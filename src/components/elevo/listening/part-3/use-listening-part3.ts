"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart3Questions,
  evaluateListeningPart3,
  type ListeningPart3Set,
  type ListeningPart3EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPart3Phase =
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

async function fetchPart3WithRetry() {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart3Questions()
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

export function useListeningPart3() {
  const [phase, setPhase]           = useState<ListeningPart3Phase>("loading")
  const [set, setSet]               = useState<ListeningPart3Set | null>(null)
  const [audioUrl, setAudioUrl]     = useState<string | null>(null)
  const [matches, setMatches]       = useState<Record<number, number>>({})
  const [result, setResult]         = useState<ListeningPart3EvaluateResponse | null>(null)
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
    setSet(null)
    setAudioUrl(null)
    setMatches({})
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
        const data = await fetchPart3WithRetry()
        if (cancelled) return

        clearTimeout(timeout)

        const url = fixAudioUrl(data.set.audio_url)
        examIdRef.current = data.exam_id
        setSet(data.set)
        setAudioUrl(url || null)
        setPhase("instruction")

        playAudio("/sounds/listening-part3.mp3", () => {
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

  const selectMatch = useCallback((speakerId: number, answerId: number) => {
    setMatches(prev => ({ ...prev, [speakerId]: answerId }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid || !set) return
    stopAudio()
    setPhase("submitting")
    try {
      const speakers = set.questions.filter(q => q.text !== "Main")
      const res = await evaluateListeningPart3({
        exam_id: eid,
        matches: speakers
          .filter(q => matches[q.id] !== undefined)
          .map(q => ({ question_id: q.id, answer_question_id: matches[q.id] })),
      })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [set, matches, stopAudio])

  const speakers = useMemo(() => 
    set?.questions.filter(q => q.text !== "Main") ?? [],
    [set]
  )
  
  const allMatched = useMemo(() => 
    speakers.length > 0 && speakers.every(q => matches[q.id] !== undefined),
    [speakers, matches]
  )

  return {
    phase,
    set,
    speakers,
    audioUrl,
    matches,
    result,
    isAudioPlaying,
    errorMsg,
    allMatched,
    selectMatch,
    submit,
    retry,
  }
}
