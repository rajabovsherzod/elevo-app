"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getListeningPart2Questions,
  evaluateListeningPart2,
  type ListeningPart2Question,
  type ListeningPart2EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPart2Phase =
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

export function useListeningPart2() {
  const [phase, setPhase]         = useState<ListeningPart2Phase>("loading")
  const [question, setQuestion]   = useState<ListeningPart2Question | null>(null)
  const [audioUrl, setAudioUrl]   = useState<string | null>(null)
  const [answers, setAnswers]     = useState<Record<number, string>>({})
  const [result, setResult]       = useState<ListeningPart2EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)
  const [retryKey, setRetryKey]   = useState(0)

  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const examIdRef = useRef<number | null>(null)

  // ── Audio helpers ────────────────────────────────────────────────────────────

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
    setIsAudioPlaying(false)
  }, [])

  const playAudio = useCallback(
    (src: string, onEnd?: () => void) => {
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
      audio.play().catch(e => {
        console.warn("Audio play failed:", e)
        finish()
      })
    },
    [stopAudio]
  )

  // ── Main fetch ───────────────────────────────────────────────────────────────

  useEffect(() => {
    setPhase("loading")
    setQuestion(null)
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
        const data = await getListeningPart2Questions()
        if (cancelled) return

        const url = fixAudioUrl(data.question.audio_url)
        examIdRef.current = data.exam_id
        setQuestion(data.question)
        setAudioUrl(url || null)

        // Init blank answers for each position
        const blank: Record<number, string> = {}
        ;(data.question.positions ?? []).forEach(p => { blank[p] = "" })
        setAnswers(blank)

        setPhase("instruction")

        // Audio chain: instruction jingle → question audio → exam
        playAudio("/sounds/listening-part2.mp3", () => {
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
      } catch (err: any) {
        if (cancelled) return
        setErrorMsg(err?.message ?? "Noma'lum xatolik")
        setPhase("error")
      } finally {
        clearTimeout(timeout)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeout)
      stopAudio()
    }
  }, [retryKey, stopAudio, playAudio])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const setAnswer = useCallback((position: number, value: string) => {
    setAnswers(prev => ({ ...prev, [position]: value }))
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid || !question) return
    stopAudio()
    setPhase("submitting")
    try {
      const res = await evaluateListeningPart2({
        exam_id: eid,
        answers: (question.positions ?? []).map(pos => ({
          question_id: question.id,
          position:    pos,
          answer:      answers[pos] ?? "",
        })),
      })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [answers, question, stopAudio])

  const allFilled = question
    ? (question.positions ?? []).every(p => (answers[p] ?? "").trim().length > 0)
    : false

  return {
    phase,
    question,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    allFilled,
    setAnswer,
    submit,
    retry,
  }
}
