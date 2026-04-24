"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getListeningPart2Questions,
  evaluateListeningPart2,
  type ListeningPart2Question,
  type ListeningPart2EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPart2Phase =
  | "loading"
  | "instruction"
  | "question-audio"
  | "exam"
  | "submitting"
  | "result"
  | "error"

const LOAD_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1_500

const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchPart2WithRetry() {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart2Questions()
    } catch (err) {
      lastErr = err
      if (i < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
    }
  }
  throw lastErr
}

function fixAudioUrl(raw: string | null): string {
  if (!raw) return ""
  try {
    return API_BASE() + new URL(raw).pathname
  } catch {
    return raw
  }
}

export function useListeningPart2() {
  const [phase, setPhase]           = useState<ListeningPart2Phase>("loading")
  const [question, setQuestion]     = useState<ListeningPart2Question | null>(null)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [result, setResult]         = useState<ListeningPart2EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const examIdRef = useRef<number | null>(null)

  // useCallback([]) — faqat ref va stable setter → hech qachon o'zgarmaydi
  const stopAudio = useCallback(() => {
    const a = audioRef.current
    if (a) { a.pause(); a.src = ""; audioRef.current = null }
    setIsAudioPlaying(false)
  }, [])

  // useCallback([stopAudio]) — stopAudio [] deps → playAudio ham stable
  const playAudio = useCallback((src: string, onEnd?: () => void) => {
    stopAudio()
    const audio = new Audio(src)
    audioRef.current = audio
    setIsAudioPlaying(true)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      audio.removeEventListener("ended", finish)
      audio.removeEventListener("error", finish)
      setIsAudioPlaying(false)
      onEnd?.()
    }
    audio.addEventListener("ended", finish)
    audio.addEventListener("error", finish)
    audio.play().catch(() => finish())
  }, [stopAudio])

  // stopAudio + playAudio deps da — ular stable, hech qachon re-run bermaydi
  useEffect(() => {
    setPhase("loading")
    setQuestion(null)
    setAudioUrl(null)
    setAnswers({})
    setResult(null)
    setErrorMsg(null)
    examIdRef.current = null

    let cancelled = false

    const timeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        stopAudio()
        setErrorMsg("So'rov juda uzoq davom etdi. Internet aloqasini tekshiring.")
        setPhase("error")
      }
    }, LOAD_TIMEOUT_MS)

    ;(async () => {
      try {
        const data = await fetchPart2WithRetry()
        if (cancelled) return

        clearTimeout(timeout)

        const url = fixAudioUrl(data.question.audio_url)
        examIdRef.current = data.exam_id
        setQuestion(data.question)
        setAudioUrl(url || null)

        const blank: Record<number, string> = {}
        ;(data.question.positions ?? []).forEach(p => { blank[p] = "" })
        setAnswers(blank)

        setPhase("instruction")

        playAudio("/sounds/listening-part2.mp3", () => {
          if (cancelled) return
          if (url) {
            setPhase("question-audio")
            playAudio(url, () => { if (!cancelled) setPhase("exam") })
          } else {
            setPhase("exam")
          }
        })
      } catch (err: any) {
        clearTimeout(timeout)
        if (cancelled) return
        setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
        setPhase("error")
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeout)
      stopAudio()
    }
  }, [retryKey, stopAudio, playAudio])

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const setAnswer = useCallback((position: number, value: string) => {
    setAnswers(prev => ({ ...prev, [position]: value }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid || !question) return
    stopAudio()
    setPhase("submitting")
    try {
      const res = await evaluateListeningPart2({
        exam_id: eid,
        answers: (question.positions ?? []).map(pos => ({
          question_id: question.id,
          position:    pos,
          answer:      answers[pos] ?? "",
        })),
      })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [answers, question, stopAudio])

  const allFilled = question
    ? (question.positions ?? []).every(p => (answers[p] ?? "").trim().length > 0)
    : false

  return {
    phase,
    question,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    allFilled,
    setAnswer,
    submit,
    retry,
  }
}
