"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  getListeningPart5Questions,
  evaluateListeningPart5,
  type ListeningPart5Extract,
  type ListeningPart5EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPart5Phase =
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

async function fetchPart5WithRetry() {
  let lastErr: unknown
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await getListeningPart5Questions()
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
    const url = new URL(raw)
    // Force HTTPS for cloudflare URLs
    if (url.hostname.includes('trycloudflare.com')) {
      url.protocol = 'https:'
    }
    return url.toString()
  } catch {
    return raw
  }
}

export function useListeningPart5() {
  const [phase, setPhase]             = useState<ListeningPart5Phase>("loading")
  const [extracts, setExtracts]       = useState<ListeningPart5Extract[]>([])
  const [audioUrls, setAudioUrls]     = useState<string[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [result, setResult]           = useState<ListeningPart5EvaluateResponse | null>(null)
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
    audio.play().catch(() => finish())
  }, [stopAudio])

  useEffect(() => {
    setPhase("loading")
    setExtracts([])
    setAudioUrls([])
    setUserAnswers({})
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

    const playSequential = (urls: string[], idx: number, onDone: () => void) => {
      if (idx >= urls.length) { onDone(); return }
      playAudio(urls[idx], () => {
        if (!cancelled) playSequential(urls, idx + 1, onDone)
      })
    }

    ;(async () => {
      try {
        const data = await fetchPart5WithRetry()
        if (cancelled) return

        clearTimeout(timeout)

        // Part 5 has one main audio for all extracts
        const mainAudioUrl = fixAudioUrl(data.audio_url)
        console.log('[Part 5] Audio URL:', mainAudioUrl)
        console.log('[Part 5] Data:', data)
        examIdRef.current = data.exam_id
        setExtracts(data.extracts)
        setAudioUrls(mainAudioUrl ? [mainAudioUrl] : [])
        setPhase("instruction")

        console.log('[Part 5] Playing instruction audio...')
        playAudio("/sounds/listening-part5.mp3", () => {
          if (cancelled) return
          console.log('[Part 5] Instruction done. Playing question audio:', mainAudioUrl)
          // Play main question audio (one audio for all extracts)
          if (mainAudioUrl) {
            setPhase("question-audio")
            playAudio(mainAudioUrl, () => { if (!cancelled) setPhase("exam") })
          } else {
            console.log('[Part 5] No audio, going straight to exam')
            setPhase("exam")
          }
        })
      } catch (err: any) {
        clearTimeout(timeout)
        if (cancelled) return
        console.error('[Part 5] Error:', err)
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

  const selectAnswer = useCallback((questionId: number, answerId: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerId }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid || extracts.length === 0) return
    stopAudio()
    setPhase("submitting")
    try {
      // Read latest userAnswers to avoid dependency
      const answers = Object.entries(userAnswers).map(([qid, aid]) => ({
        question_id: Number(qid),
        answer_id:   Number(aid),
      }))
      const res = await evaluateListeningPart5({ exam_id: eid, answers })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [extracts, userAnswers, stopAudio])

  const totalQuestions = useMemo(() => 
    extracts.reduce((sum, e) => sum + e.questions.length, 0),
    [extracts]
  )
  
  const answeredCount = useMemo(() => 
    Object.keys(userAnswers).length,
    [userAnswers]
  )
  
  const allAnswered = useMemo(() => 
    totalQuestions > 0 && answeredCount === totalQuestions,
    [totalQuestions, answeredCount]
  )

  return {
    phase,
    extracts,
    audioUrls,
    userAnswers,
    result,
    isAudioPlaying,
    errorMsg,
    totalQuestions,
    answeredCount,
    allAnswered,
    selectAnswer,
    submit,
    retry,
  }
}
