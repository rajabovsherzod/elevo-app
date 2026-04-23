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

export function useListeningPart1() {
  const [phase, setPhase]               = useState<ListeningPhase>("loading")
  const [questions, setQuestions]       = useState<ListeningPart1Question[]>([])
  const [examId, setExamId]             = useState<number | null>(null)
  const [answers, setAnswers]           = useState<Record<number, number>>({})
  const [result, setResult]             = useState<ListeningPart1EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const examIdRef     = useRef<number | null>(null)

  useEffect(() => { examIdRef.current = examId }, [examId])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current = null
    }
    setIsAudioPlaying(false)
  }, [])

  const playAudio = useCallback((src: string, onEnd?: () => void) => {
    stopAudio()
    const audio = new Audio(src)
    audioRef.current = audio
    setIsAudioPlaying(true)

    // done flag — error event + .catch() ikkalasi ham otishi mumkin, faqat bir marta chaqiramiz
    let done = false
    const finish = () => {
      if (done) return
      done = true
      setIsAudioPlaying(false)
      onEnd?.()
    }

    audio.addEventListener("ended", finish)
    audio.addEventListener("error", finish)
    audio.play().catch(finish)
  }, [stopAudio])

  // Fetch fresh data on every mount
  useEffect(() => {
    setPhase("loading")
    setQuestions([])
    setAnswers({})
    setResult(null)
    setError(null)

    let cancelled = false

    ;(async () => {
      try {
        const data = await getListeningPart1Questions()
        if (cancelled) return

        const rawQuestion = data.question

        // audio_url backenddan localhost:8000/media/... keladi.
        // Tunnel orqali ishlash uchun NEXT_PUBLIC_API_URL ga almashtiramiz.
        let audioUrl = rawQuestion.audio_url
        if (audioUrl) {
          try {
            const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")
            const path = new URL(audioUrl).pathname
            audioUrl = apiBase + path
          } catch {
            // URL parse xatosi bo'lsa asl URL ni ishlatamiz
          }
        }

        // Group answers by position → one question per position
        let transformed: ListeningPart1Question[]
        if (rawQuestion.answers.length > 3) {
          const map = new Map<number, typeof rawQuestion.answers>()
          rawQuestion.answers.forEach(a => {
            if (!map.has(a.position)) map.set(a.position, [])
            map.get(a.position)!.push(a)
          })
          transformed = Array.from(map.entries())
            .sort(([a], [b]) => a - b)
            .map(([position, posAnswers]) => ({
              id: rawQuestion.id * 1000 + position,
              title: rawQuestion.title,
              instruction: rawQuestion.instruction,
              question: `Question ${position}`,
              audio_url: audioUrl,
              answers: posAnswers,
            }))
        } else {
          transformed = [{ ...rawQuestion, audio_url: audioUrl }]
        }

        setQuestions(transformed)
        setExamId(data.exam_id)
        setPhase("instruction")

        // 1. Instruction audio → 2. Question audio → 3. Exam
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
        if (!cancelled) {
          setError("Savollarni yuklashda xatolik: " + (err?.message ?? "Unknown error"))
          setPhase("exam")
        }
      }
    })()

    return () => {
      cancelled = true
      stopAudio()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    } catch {
      setPhase("exam")
    }
  }, [answers, stopAudio])

  const totalAnswered = Object.keys(answers).length
  const audioUrl = questions[0]?.audio_url ?? null

  return {
    phase,
    questions,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    error,
    totalAnswered,
    selectAnswer,
    submit,
  }
}
