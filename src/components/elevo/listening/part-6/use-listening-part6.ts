"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart6QuestionsSimple,
  evaluateListeningPart6Simple,
  type ListeningPart6QuestionsResponseSimple,
  type ListeningPart6EvaluateResponseSimple,
} from "@/lib/api/listening"

export type ListeningPart6Phase =
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

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function fixAudioUrl(raw: string | null | undefined): string {
  if (!raw) return ""
  try {
    return API_BASE() + new URL(raw).pathname
  } catch {
    return raw
  }
}

async function fetchPart6WithRetry(examId: number) {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart6QuestionsSimple(examId)
    } catch (err) {
      lastErr = err
      if (i < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
    }
  }
  throw lastErr
}

export function useListeningPart6(examId: number) {
  const [phase, setPhase]           = useState<ListeningPart6Phase>("loading")
  const [data, setData]             = useState<ListeningPart6QuestionsResponseSimple | null>(null)
  const [answers, setAnswers]       = useState<Record<string, string>>({})
  const [result, setResult]         = useState<ListeningPart6EvaluateResponseSimple | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [retryKey, setRetryKey]     = useState(0)

  const audioRef     = useRef<HTMLAudioElement | null>(null)
  const submittedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    submittedRef.current = false

    setPhase("loading")
    setData(null)
    setAnswers({})
    setResult(null)
    setError(null)
    setIsAudioPlaying(false)

    const stopAudio = () => {
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
        const response = await fetchPart6WithRetry(examId)
        if (cancelled) return

        clearTimeout(timeout)

        const blank: Record<string, string> = {}
        response.positions.forEach((p: number) => { blank[String(p)] = "" })
        setData(response)
        setAnswers(blank)
        setPhase("instruction")

        const audioUrl = fixAudioUrl(response.audio_url)

        playAudio("/sounds/listening-part6.mp3", () => {
          if (cancelled) return
          if (audioUrl) {
            setPhase("question-audio")
            playAudio(audioUrl, () => { if (!cancelled) setPhase("exam") })
          } else {
            setPhase("exam")
          }
        })
      } catch (err: any) {
        clearTimeout(timeout)
        if (cancelled) return
        setError(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
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

  const setAnswer = useCallback((position: number, value: string) => {
    setAnswers(prev => ({ ...prev, [String(position)]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!data) return
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
      const [res] = await Promise.all([
        evaluateListeningPart6Simple(examId, data.question_id, { answers }),
        sleep(2000),
      ])
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [examId, data, answers])

  const allFilled = useMemo(() =>
    data ? data.positions.every((p: number) => (answers[String(p)] ?? "").trim().length > 0) : false,
    [data, answers]
  )

  const filledCount = useMemo(() =>
    data ? data.positions.filter((p: number) => (answers[String(p)] ?? "").trim().length > 0).length : 0,
    [data, answers]
  )

  return {
    phase,
    data,
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
