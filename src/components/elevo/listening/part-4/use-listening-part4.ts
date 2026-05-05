"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart4QuestionsSimple,
  evaluateListeningPart4Simple,
  type ListeningPart4QuestionsResponseSimple,
  type ListeningPart4EvaluateResponseSimple,
} from "@/lib/api/listening"

export type ListeningPart4Phase =
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

async function fetchPart4WithRetry(examId: number) {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart4QuestionsSimple(examId)
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

export function useListeningPart4(examId: number) {
  const [phase, setPhase]           = useState<ListeningPart4Phase>("loading")
  const [question, setQuestion]     = useState<ListeningPart4QuestionsResponseSimple | null>(null)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [result, setResult]         = useState<ListeningPart4EvaluateResponseSimple | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  // Prevents audio finish callbacks from firing phase transitions after user submits.
  // Cannot use closure-local `cancelled` for this because handleSubmit is outside the effect.
  const submittedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    submittedRef.current = false  // reset on each effect run (retry / new exam)

    setPhase("loading")
    setQuestion(null)
    setAudioUrl(null)
    setAnswers({})
    setResult(null)
    setError(null)

    const stopAudio = () => {
      const a = audioRef.current
      if (a) {
        // Remove listeners BEFORE clearing src to prevent spurious error events
        // from triggering the finish callback and calling onEnd after submit.
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
        const response = await fetchPart4WithRetry(examId)
        if (cancelled) return

        clearTimeout(timeout)

        const url = fixAudioUrl(response.audio_url)
        setQuestion(response)
        setAudioUrl(url || null)

        const blank: Record<number, string> = {}
        response.places.forEach(p => { blank[p.position] = "" })
        setAnswers(blank)

        setPhase("instruction")

        playAudio("/sounds/listening-part4.mp3", () => {
          if (cancelled) return
          if (url) {
            setPhase("question-audio")
            playAudio(url, () => {
              if (!cancelled) setPhase("exam")
            })
          } else {
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

    // Mark as submitted so audio finish callbacks don't fire phase transitions
    submittedRef.current = true

    // Stop audio using the same clean stop as stopAudio (listeners removed first)
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
        evaluateListeningPart4Simple(examId, question.question_id, { answers: answersPayload }),
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

  const getAvailableLetters = useCallback((): string[] => {
    if (!question) return []
    const count = question.options_count || 8
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i))
  }, [question])

  const allFilled = useMemo(() =>
    question
      ? question.places.every(p => {
          const answer = answers[p.position]
          return answer && answer.trim().length > 0
        })
      : false,
    [question, answers]
  )

  const filledCount = useMemo(() =>
    question
      ? question.places.filter(p => {
          const answer = answers[p.position]
          return answer && answer.trim().length > 0
        }).length
      : 0,
    [question, answers]
  )

  return {
    phase,
    question,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    error,
    allFilled,
    filledCount,
    setAnswer,
    handleSubmit,
    getAvailableLetters,
    retry,
  }
}
