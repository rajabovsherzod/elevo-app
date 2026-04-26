"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart6Questions,
  evaluateListeningPart6,
  type ListeningPart6Question,
  type ListeningPart6EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPart6Phase =
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

async function fetchPart6WithRetry() {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart6Questions()
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

export function useListeningPart6() {
  const [phase, setPhase]           = useState<ListeningPart6Phase>("loading")
  const [question, setQuestion]     = useState<ListeningPart6Question | null>(null)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [result, setResult]         = useState<ListeningPart6EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const examIdRef = useRef<number | null>(null)

  const stopAudio = useCallback(() => {
    const a = audioRef.current
    if (a) { a.pause(); a.src = ""; audioRef.current = null }
    setIsAudioPlaying(false)
  }, [])

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
        const data = await fetchPart6WithRetry()
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

        playAudio("/sounds/listening-part6.mp3", () => {
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
      // Read latest answers to avoid dependency on answers state
      const res = await evaluateListeningPart6({
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

  const allFilled = useMemo(() =>
    question
      ? (question.positions ?? []).every(p => (answers[p] ?? "").trim().length > 0)
      : false,
    [question, answers]
  )

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
