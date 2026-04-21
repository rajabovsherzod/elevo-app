"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart4Question,
  evaluateReadingPart4,
  type ReadingPart4QuestionResponse,
  type ReadingPart4EvaluateResponse,
} from "@/lib/api/reading"

const TIMER_DURATION = 15 * 60  // 15 minutes for Part 4 (longer text)

export function useReadingPart4() {
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [questionData, setQuestionData] = useState<ReadingPart4QuestionResponse | null>(null)
  const [answers, setAnswers]           = useState<Record<number, number>>({})  // question_id -> answer_id
  const [result, setResult]             = useState<ReadingPart4EvaluateResponse | null>(null)
  const [timeLeft, setTimeLeft]         = useState(TIMER_DURATION)

  const questionDataRef = useRef<ReadingPart4QuestionResponse | null>(null)
  const answersRef      = useRef<Record<number, number>>({})
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef   = useRef(false)

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

  const handleSubmit = useCallback(async () => {
    const qd  = questionDataRef.current
    const a   = answersRef.current
    if (!qd || submittingRef.current) return

    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)

    try {
      const answersArray = Object.entries(a).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        answer_id: answerId,
      }))
      const response = await evaluateReadingPart4({ exam_id: qd.exam_id, answers: answersArray })
      setResult(response)
    } catch (err) {
      console.error("evaluate part4 failed:", err)
    } finally {
      setSubmitting(false)
    }
  }, [])

  const handleSubmitRef = useRef(handleSubmit)
  useEffect(() => { handleSubmitRef.current = handleSubmit }, [handleSubmit])

  const handleSelect = useCallback((questionId: number, answerId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  useEffect(() => {
    // Clear previous data and show loading
    setQuestionData(null)
    setResult(null)
    setAnswers({})
    setLoading(true)
    
    ;(async () => {
      try {
        const data = await getReadingPart4Question()
        setQuestionData(data)
        setTimeLeft(TIMER_DURATION)
      } catch (err) {
        console.error("load part4 failed:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, []) // Only run on mount

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

  const questions       = questionData?.text.questions ?? []
  const allAnswered     = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)

  return {
    loading, submitting, questionData,
    answers, result, timeLeft,
    allAnswered, formatTime,
    handleSelect, handleSubmit,
  }
}
