"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart1Questions,
  evaluateListeningPart1,
  type ListeningPart1Question,
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
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1_500

const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchPart1WithRetry() {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart1Questions()
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
  const [phase, setPhase] = useState<ListeningPhase>("loading")
  const [questions, setQuestions] = useState<ListeningPart1Question[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<ListeningPart1EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const examIdRef = useRef<number | null>(null)

  // useCallback([]) — faqat ref va stable setter → hech qachon o'zgarmaydi
  const stopAudio = useCallback(() => {
    const a = audioRef.current
    if (a) { 
      a.pause()
      a.src = ""
      audioRef.current = null 
    }
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

  // Stable function - no deps, no re-creation
  const groupQuestions = useCallback((
    raw: ListeningPart1Question,
    url: string
  ): ListeningPart1Question[] => {
    if (raw.answers.length <= 3) return [{ ...raw, audio_url: url }]
    
    const map = new Map<number, typeof raw.answers>()
    raw.answers.forEach(a => {
      if (!map.has(a.position)) map.set(a.position, [])
      map.get(a.position)!.push(a)
    })
    
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([position, posAnswers]) => ({
        id: raw.id * 1000 + position,
        title: raw.title,
        instruction: raw.instruction,
        question: `Question ${position}`,
        audio_url: url,
        answers: posAnswers,
      }))
  }, [])

  // Main effect - only depends on retryKey (stable deps pattern like Part 3)
  useEffect(() => {
    setPhase("loading")
    setQuestions([])
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
        const data = await fetchPart1WithRetry()
        if (cancelled) return

        clearTimeout(timeout)

        const qs = Array.isArray(data.question) ? data.question : [data.question]
        const url = fixAudioUrl(qs[0]?.audio_url ?? null)
        const transformed = qs.flatMap(q => groupQuestions(q, url))

        examIdRef.current = data.exam_id
        setQuestions(transformed)
        setAudioUrl(url || null)
        setPhase("instruction")

        // Initialize answers
        const initAnswers: Record<number, number> = {}
        transformed.forEach(q => { initAnswers[q.id] = 0 })
        setAnswers(initAnswers)

        // Audio sequence: instruction → question-audio → exam (like Part 3)
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
  }, [retryKey]) // Only retryKey dependency - stable pattern

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const selectAnswer = useCallback((questionId: number, answerId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid) return
    
    stopAudio()
    setPhase("submitting")
    
    try {
      const res = await evaluateListeningPart1({
        exam_id: eid,
        answers: Object.entries(answers)
          .filter(([, aid]) => aid > 0) // Only include answered questions
          .map(([qid, aid]) => ({
            question_id: Number(qid),
            answer_id: Number(aid),
          })),
      })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [answers, stopAudio])

  const totalAnswered = useMemo(() => 
    Object.values(answers).filter(aid => aid > 0).length,
    [answers]
  )

  return {
    phase,
    questions,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    totalAnswered,
    selectAnswer,
    submit,
    retry,
  }
}
