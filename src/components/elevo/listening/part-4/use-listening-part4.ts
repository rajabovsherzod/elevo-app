"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart4Questions,
  evaluateListeningPart4,
  type ListeningPart4Set,
  type ListeningPart4EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPart4Phase =
  | "loading"
  | "instruction"
  | "question-audio"
  | "exam"
  | "submitting"
  | "result"
  | "error"

const LOAD_TIMEOUT_MS = 20_000
const IMAGE_TIMEOUT_MS = 10_000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1_500

const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchPart4WithRetry() {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart4Questions()
    } catch (err) {
      lastErr = err
      if (i < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
    }
  }
  throw lastErr
}

function fixUrl(raw: string | null): string {
  if (!raw) return ""
  try {
    return API_BASE() + new URL(raw).pathname
  } catch {
    return raw
  }
}

function preloadImage(src: string): Promise<void> {
  return new Promise<void>(resolve => {
    const img = new window.Image()
    const timer = setTimeout(resolve, IMAGE_TIMEOUT_MS)
    img.onload  = () => { clearTimeout(timer); resolve() }
    img.onerror = () => { clearTimeout(timer); resolve() }
    img.src = src
  })
}

export function useListeningPart4() {
  const [phase, setPhase]               = useState<ListeningPart4Phase>("loading")
  const [set, setSet]                   = useState<ListeningPart4Set | null>(null)
  const [audioUrl, setAudioUrl]         = useState<string | null>(null)
  const [imageUrl, setImageUrl]         = useState<string | null>(null)
  const [userLetters, setUserLetters]   = useState<Record<number, string>>({})
  const [result, setResult]             = useState<ListeningPart4EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg]         = useState<string | null>(null)
  const [retryKey, setRetryKey]         = useState(0)

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
    setImageUrl(null)
    setUserLetters({})
    setResult(null)
    setErrorMsg(null)
    examIdRef.current = null

    let cancelled = false

    const timeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        stopAudio()
        setErrorMsg("Server javob bermadi. Internet aloqasini tekshiring va qayta urining.")
        setPhase("error")
      }
    }, LOAD_TIMEOUT_MS)

    ;(async () => {
      try {
        const data = await fetchPart4WithRetry()
        if (cancelled) return

        clearTimeout(timeout)

        const aUrl = fixUrl(data.set.audio_url)
        const iUrl = fixUrl(data.set.image_url)
        examIdRef.current = data.exam_id

        if (iUrl) await preloadImage(iUrl)
        if (cancelled) return

        setSet(data.set)
        setAudioUrl(aUrl || null)
        setImageUrl(iUrl || null)
        setPhase("instruction")

        playAudio("/sounds/listening-part4.mp3", () => {
          if (cancelled) return
          if (aUrl) {
            setPhase("question-audio")
            playAudio(aUrl, () => { if (!cancelled) setPhase("exam") })
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

  const setLetter = useCallback((placeId: number, letter: string) => {
    setUserLetters(prev => ({ ...prev, [placeId]: letter.toUpperCase() }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid || !set) return
    stopAudio()
    setPhase("submitting")
    try {
      const matchList = set.answers
        .map(place => {
          const letter = (userLetters[place.id] ?? "").toUpperCase()
          const field  = set.questions.find(q => q.text.toUpperCase() === letter)
          return { question_id: place.id, answer_question_id: field?.id ?? 0 }
        })
        .filter(m => m.answer_question_id !== 0)

      const res = await evaluateListeningPart4({ exam_id: eid, matches: matchList })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [set, userLetters, stopAudio])

  const filledCount = useMemo(() => 
    set
      ? set.answers.filter(p => {
          const letter = (userLetters[p.id] ?? "").toUpperCase()
          return letter && set.questions.some(q => q.text.toUpperCase() === letter)
        }).length
      : 0,
    [set, userLetters]
  )

  const allFilled = useMemo(() => 
    set ? filledCount === set.answers.length : false,
    [set, filledCount]
  )

  return {
    phase, set, audioUrl, imageUrl, userLetters, result,
    isAudioPlaying, errorMsg, filledCount, allFilled,
    setLetter, submit, retry,
  }
}
