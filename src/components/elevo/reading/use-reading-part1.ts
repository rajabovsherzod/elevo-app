"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart1Question,
  evaluateReadingPart1,
  type ReadingPart1QuestionResponse,
  type ReadingPart1EvaluateResponse,
} from "@/lib/api/reading"

const TIMER_DURATION = 8 * 60

export function useReadingPart1() {
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [questionData, setQuestionData] = useState<ReadingPart1QuestionResponse | null>(null)
  const [answers, setAnswers]           = useState<Record<number, string>>({})
  const [result, setResult]             = useState<ReadingPart1EvaluateResponse | null>(null)
  const [timeLeft, setTimeLeft]         = useState(TIMER_DURATION)

  // Refs mirror state so timer callback always has fresh values (no stale closure)
  const questionDataRef = useRef<ReadingPart1QuestionResponse | null>(null)
  const answersRef      = useRef<Record<number, string>>({})
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef   = useRef(false)

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

  const handleSubmit = useCallback(async () => {
    const qd  = questionDataRef.current
    const ans = answersRef.current
    if (!qd || submittingRef.current) return

    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)

    try {
      const answersArray = Object.entries(ans).map(([pos, val]) => ({
        question_id: qd.question.id,
        position: parseInt(pos),
        answer: val.trim(),
      }))
      const response = await evaluateReadingPart1({ exam_id: qd.exam_id, answers: answersArray })
      setResult(response)
    } catch (err) {
      console.error("evaluate failed:", err)
    } finally {
      setSubmitting(false)
    }
  }, [])

  // Keep a stable ref to handleSubmit for the timer
  const handleSubmitRef = useRef(handleSubmit)
  useEffect(() => { handleSubmitRef.current = handleSubmit }, [handleSubmit])

  const handleAnswerChange = useCallback((position: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [position]: value }))
  }, [])

  // Load question on mount
  useEffect(() => {
    // Clear previous data and show loading
    setQuestionData(null)
    setResult(null)
    setAnswers({})
    setLoading(true)
    
    ;(async () => {
      try {
        const data = await getReadingPart1Question()
        // Fallback: derive positions from text when the DB has no answer records
        if (data.question.positions.length === 0 && data.question.text) {
          const matches = data.question.text.match(/_{1,}(\d+)_{1,}/g) ?? []
          data.question.positions = [...new Set(matches.map((m) => parseInt(m.replace(/[^0-9]/g, ""))))]
        }
        setQuestionData(data)
        const init: Record<number, string> = {}
        data.question.positions.forEach((p) => { init[p] = "" })
        setAnswers(init)
        setTimeLeft(TIMER_DURATION)
      } catch (err) {
        console.error("load failed:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, []) // Only run on mount

  // Timer
  useEffect(() => {
    if (result || loading) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [result, loading])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const allFilled = Object.values(answers).every((a) => a.trim().length > 0)

  return {
    loading, submitting, questionData,
    answers, result, timeLeft,
    allFilled, formatTime,
    handleAnswerChange, handleSubmit,
  }
}
