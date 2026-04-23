"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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

function groupQuestions(
  raw: ListeningPart1Question,
  audioUrl: string
): ListeningPart1Question[] {
  if (raw.answers.length <= 3) return [{ ...raw, audio_url: audioUrl }]

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
      audio_url: audioUrl,
      answers: posAnswers,
    }))
}

export function useListeningPart1() {
  const [phase, setPhase]       = useState<ListeningPhase>("loading")
  const [questions, setQuestions] = useState<ListeningPart1Question[]>([])
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)
  const [answers, setAnswers]     = useState<Record<number, number>>({})
  const [result, setResult]       = useState<ListeningPart1EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [retryKey, setRetryKey]   = useState(0)

  const audioRef   = useRef<HTMLAudioElement | null>(null)
  const examIdRef  = useRef<number | null>(null)

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

  // ── Main fetch — reruns on retry ─────────────────────────────────────────────

  useEffect(() => {
    setPhase("loading")
    setQuestions([])
    setAnswers({})
    setResult(null)
    setErrorMsg(null)
    examIdRef.current = null

    let cancelled = false

    // Timeout guard — prevents infinite loading if API hangs
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
        const data = await getListeningPart1Questions()
        if (cancelled) return

        // Handle both single question and array of questions
        const questions = Array.isArray(data.question) ? data.question : [data.question]
        const audioUrl = fixAudioUrl(questions[0]?.audio_url ?? null)
        
        // Transform each question
        const transformed = questions.flatMap(q => groupQuestions(q, audioUrl))

        examIdRef.current = data.exam_id
        setQuestions(transformed)
        setPhase("instruction")

        // Audio chain: instruction jingle → question audio → exam
        playAudio("/sounds/listening-part1.mp3", () => {
          if (cancelled) return
          if (audioUrl) {
            setPhase("question-audio")
            playAudio(audioUrl, () => {
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
        answers: Object.entries(answers).map(([qid, aid]) => ({
          question_id: Number(qid),
          answer_id: Number(aid),
        })),
      })
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [answers, stopAudio])

  return {
    phase,
    questions,
    audioUrl: questions[0]?.audio_url ?? null,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    totalAnswered: Object.keys(answers).length,
    selectAnswer,
    submit,
    retry,
  }
}
