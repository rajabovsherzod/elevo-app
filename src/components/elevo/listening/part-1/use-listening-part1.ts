"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart1Questions,
  evaluateListeningPart1,
  type ListeningPart1QuestionItem,
  type ListeningPart1EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPhase =
  | "loading"
  | "instruction"
  | "question-audio"
  | "exam"
  | "submitting"
  | "result"
  | "error"

const LOAD_TIMEOUT_MS = 30_000
const MAX_RETRIES     = 3
const RETRY_DELAY_MS  = 1_500

const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchPart1WithRetry(examId: number) {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart1Questions(examId)
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

export function useListeningPart1() {
  const [phase, setPhase]               = useState<ListeningPhase>("loading")
  const [questions, setQuestions]       = useState<ListeningPart1QuestionItem[]>([])
  const [audioUrl, setAudioUrl]         = useState<string | null>(null)
  const [answers, setAnswers]           = useState<Record<number, string>>({})
  const [result, setResult]             = useState<ListeningPart1EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg]         = useState<string | null>(null)
  const [retryKey, setRetryKey]         = useState(0)

  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const examIdRef     = useRef<number | null>(null)
  const questionIdRef = useRef<number | null>(null)

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
    setQuestions([])
    setAudioUrl(null)
    setAnswers({})
    setResult(null)
    setErrorMsg(null)
    examIdRef.current     = null
    questionIdRef.current = null

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
        const urlParams = new URLSearchParams(window.location.search)
        const examId = parseInt(urlParams.get("exam_id") ?? "1") || 1

        const data = await fetchPart1WithRetry(examId)
        if (cancelled) return

        clearTimeout(timeout)

        const url = fixAudioUrl(data.audio_url)
        examIdRef.current     = data.exam_id
        questionIdRef.current = data.question_id

        const initAnswers: Record<number, string> = {}
        data.questions.forEach((q: ListeningPart1QuestionItem) => { initAnswers[q.position] = "" })

        setQuestions(data.questions)
        setAudioUrl(url || null)
        setAnswers(initAnswers)
        setPhase("instruction")

        playAudio("/sounds/listening-part1.mp3", () => {
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

  const selectAnswer = useCallback((position: number, letter: string) => {
    setAnswers(prev => ({ ...prev, [position]: letter }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    const qid = questionIdRef.current
    if (!eid || !qid) return
    stopAudio()
    setPhase("submitting")
    try {
      const answersPayload: Record<string, string> = {}
      Object.entries(answers).forEach(([pos, letter]) => {
        if (letter) answersPayload[pos] = letter
      })
      const [res] = await Promise.all([
        evaluateListeningPart1(eid, qid, { answers: answersPayload }),
        sleep(1500),
      ])
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [answers, stopAudio])

  const totalAnswered = useMemo(
    () => Object.values(answers).filter(l => l !== "").length,
    [answers]
  )

  return {
    phase, questions, audioUrl, answers, result,
    isAudioPlaying, errorMsg, totalAnswered,
    selectAnswer, submit, retry,
  }
}
