"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
const API_BASE = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

function fixAudioUrl(raw: string | null): string {
  if (!raw) return ""
  try {
    return API_BASE() + new URL(raw).pathname
  } catch {
    return raw
  }
}

export function useListeningPart3() {
  const [phase, setPhase]     = useState<ListeningPart3Phase>("loading")
  const [set, setSet]         = useState<ListeningPart3Set | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  // matches: { speakerId → selectedAnswerId }
  const [matches, setMatches] = useState<Record<number, number>>({})
  const [result, setResult]   = useState<ListeningPart3EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const examIdRef = useRef<number | null>(null)

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.src = ""; audioRef.current = null }
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
        const data = await getListeningPart3Questions()
        if (cancelled) return

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
        if (cancelled) return
        setErrorMsg(err?.message ?? "Noma'lum xatolik")
        setPhase("error")
      } finally {
        clearTimeout(timeout)
      }
    })()

    return () => { cancelled = true; clearTimeout(timeout); stopAudio() }
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
      // Only submit for speaker questions (skip "Main")
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
      setErrorMsg(err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [set, matches, stopAudio])

  const speakers = set?.questions.filter(q => q.text !== "Main") ?? []
  const allMatched = speakers.length > 0 && speakers.every(q => matches[q.id] !== undefined)

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
