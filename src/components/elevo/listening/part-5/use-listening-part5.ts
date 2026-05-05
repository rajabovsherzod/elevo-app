"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart5QuestionsSimple,
  evaluateListeningPart5Simple,
  type ListeningPart5QuestionsResponseSimple,
  type ListeningPart5EvaluateResponseSimple,
} from "@/lib/api/listening"

export type ListeningPart5Phase =
  | "loading"
  | "instruction"
  | "question-audio"
  | "exam"
  | "calculating"
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

async function fetchPart5WithRetry(examId: number) {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart5QuestionsSimple(examId)
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

export function useListeningPart5(examId: number) {
  const [phase, setPhase]           = useState<ListeningPart5Phase>("loading")
  const [question, setQuestion]     = useState<ListeningPart5QuestionsResponseSimple | null>(null)
  const [answers, setAnswers]       = useState<Record<number, string>>({})  // {1: "A", 2: "B", ...}
  const [result, setResult]         = useState<ListeningPart5EvaluateResponseSimple | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const submittedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    submittedRef.current = false

    setPhase("loading")
    setQuestion(null)
    setAnswers({})
    setResult(null)
    setError(null)

    const stopAudio = () => {
      const a = audioRef.current
      if (a) {
        a.onended  = null
        a.onerror  = null
        a.pause()
        a.currentTime = 0
        a.src = ""
        audioRef.current = null
      }
      setIsAudioPlaying(false)
    }

    const playAudio = (src: string, onEnd?: () => void) => {
      stopAudio()
      const audio = new Audio(src)
      audioRef.current = audio
      setIsAudioPlaying(true)
      let done = false

      const finish = () => {
        if (done) return
        done = true
        audio.onended = null
        audio.onerror = null
        setIsAudioPlaying(false)
        if (!cancelled && !submittedRef.current) onEnd?.()
      }

      audio.onended = finish
      audio.onerror = finish
      audio.play().catch(() => finish())
    }

    const timeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        stopAudio()
        setError("So'rov juda uzoq davom etdi. Internet aloqasini tekshiring.")
        setPhase("error")
      }
    }, LOAD_TIMEOUT_MS)

    ;(async () => {
      try {
        const response = await fetchPart5WithRetry(examId)
        if (cancelled) return

        clearTimeout(timeout)

        setQuestion(response)

        // Initialize answers for 6 positions
        const blank: Record<number, string> = {}
        for (let i = 1; i <= 6; i++) {
          blank[i] = ""
        }
        setAnswers(blank)

        setPhase("instruction")

        // Play instruction audio, then question audio
        playAudio("/sounds/listening-part5.mp3", () => {
          if (cancelled || submittedRef.current) return
          
          setPhase("question-audio")
          
          // Play question audio (main audio from backend)
          const questionAudioUrl = fixAudioUrl(response.audio_url)
          if (questionAudioUrl) {
            playAudio(questionAudioUrl, () => {
              if (cancelled || submittedRef.current) return
              setPhase("exam")
            })
          } else {
            // No audio, go directly to exam
            setPhase("exam")
          }
        })
      } catch (err: unknown) {
        clearTimeout(timeout)
        if (cancelled) return
        const e = err as { response?: { data?: { detail?: string } }; message?: string }
        setError(e?.response?.data?.detail ?? e?.message ?? "Noma'lum xatolik")
        setPhase("error")
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeout)
      stopAudio()
    }
  }, [examId, retryKey])

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const setAnswer = useCallback((position: number, letter: string) => {
    setAnswers(prev => ({ ...prev, [position]: letter }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!question) return

    submittedRef.current = true

    const a = audioRef.current
    if (a) {
      a.onended = null
      a.onerror = null
      a.pause()
      a.currentTime = 0
      a.src = ""
      audioRef.current = null
    }
    setIsAudioPlaying(false)
    setPhase("calculating")

    try {
      const answersPayload: Record<string, string> = {}
      Object.entries(answers).forEach(([pos, letter]) => {
        answersPayload[pos] = letter
      })

      const [res] = await Promise.all([
        evaluateListeningPart5Simple(examId, question.question_id, { answers: answersPayload }),
        sleep(2000),
      ])
      setResult(res)
      setPhase("result")
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(e?.response?.data?.detail ?? e?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [examId, question, answers])

  const allFilled = useMemo(() =>
    question
      ? Object.values(answers).every(a => a && a.trim().length > 0)
      : false,
    [question, answers]
  )

  const filledCount = useMemo(() =>
    Object.values(answers).filter(a => a && a.trim().length > 0).length,
    [answers]
  )

  return {
    phase,
    question,
    answers,
    result,
    isAudioPlaying,
    error,
    allFilled,
    filledCount,
    setAnswer,
    handleSubmit,
    retry,
  }
}
