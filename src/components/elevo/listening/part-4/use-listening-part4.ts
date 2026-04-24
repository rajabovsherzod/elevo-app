"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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

const API_TIMEOUT_MS = 20_000   // API call max wait
const IMAGE_TIMEOUT_MS = 10_000 // Image preload max wait
const MAX_RETRIES = 3           // API retry attempts
const RETRY_DELAY_MS = 1_500

const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function fixUrl(raw: string | null): string {
  if (!raw) return ""
  try { return API_BASE() + new URL(raw).pathname }
  catch { return raw }
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(retries: number): Promise<Awaited<ReturnType<typeof getListeningPart4Questions>>> {
  let lastErr: unknown
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await getListeningPart4Questions()
    } catch (err) {
      lastErr = err
      if (attempt < retries - 1) await sleep(RETRY_DELAY_MS)
    }
  }
  throw lastErr
}

function preloadImage(src: string): Promise<void> {
  return new Promise<void>(resolve => {
    const img = new window.Image()
    const timer = setTimeout(resolve, IMAGE_TIMEOUT_MS)
    img.onload  = () => { clearTimeout(timer); resolve() }
    img.onerror = () => { clearTimeout(timer); resolve() } // never block on image failure
    img.src = src
  })
}

export function useListeningPart4() {
  const [phase, setPhase]             = useState<ListeningPart4Phase>("loading")
  const [set, setSet]                 = useState<ListeningPart4Set | null>(null)
  const [audioUrl, setAudioUrl]       = useState<string | null>(null)
  const [imageUrl, setImageUrl]       = useState<string | null>(null)
  const [userLetters, setUserLetters] = useState<Record<number, string>>({})
  const [result, setResult]           = useState<ListeningPart4EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg]       = useState<string | null>(null)
  const [retryKey, setRetryKey]       = useState(0)

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
    audio.play().catch(e => { console.warn("Audio play failed:", e); finish() })
  }, [stopAudio])

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

    // API-only timeout — cleared as soon as data arrives
    const apiTimeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        stopAudio()
        setErrorMsg("Server javob bermadi. Internet aloqasini tekshiring va qayta urining.")
        setPhase("error")
      }
    }, API_TIMEOUT_MS)

    ;(async () => {
      try {
        // 1. Fetch with automatic retry
        const data = await fetchWithRetry(MAX_RETRIES)
        if (cancelled) return

        // API succeeded — clear the timeout immediately
        clearTimeout(apiTimeout)

        const aUrl = fixUrl(data.set.audio_url)
        const iUrl = fixUrl(data.set.image_url)
        examIdRef.current = data.exam_id

        // 2. Preload image in parallel with nothing blocking — stays on loading screen
        if (iUrl) await preloadImage(iUrl)
        if (cancelled) return

        // 3. Everything ready — commit state and start
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
        clearTimeout(apiTimeout)
        if (cancelled) return
        const msg = err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik"
        setErrorMsg(`Yuklashda xatolik: ${msg}. Qayta urining.`)
        setPhase("error")
      }
    })()

    return () => { cancelled = true; clearTimeout(apiTimeout); stopAudio() }
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
      const matches = set.answers
        .map(place => {
          const letter = (userLetters[place.id] ?? "").toUpperCase()
          const field = set.questions.find(q => q.text.toUpperCase() === letter)
          return { question_id: place.id, answer_question_id: field?.id ?? 0 }
        })
        .filter(m => m.answer_question_id !== 0)

      const res = await evaluateListeningPart4({ exam_id: eid, matches })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [set, userLetters, stopAudio])

  const filledCount = set
    ? set.answers.filter(p => {
        const letter = (userLetters[p.id] ?? "").toUpperCase()
        return letter && set.questions.some(q => q.text.toUpperCase() === letter)
      }).length
    : 0

  const allFilled = set ? filledCount === set.answers.length : false

  return {
    phase, set, audioUrl, imageUrl, userLetters, result,
    isAudioPlaying, errorMsg, filledCount, allFilled,
    setLetter, submit, retry,
  }
}
