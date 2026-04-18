"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart2Question,
  evaluateReadingPart2,
  type ReadingPart2QuestionResponse,
  type ReadingPart2EvaluateResponse,
} from "@/lib/api/reading"

const TIMER_DURATION = 10 * 60

export function useReadingPart2() {
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [questionData, setQuestionData] = useState<ReadingPart2QuestionResponse | null>(null)
  const [matches, setMatches]           = useState<Record<number, number>>({})
  const [result, setResult]             = useState<ReadingPart2EvaluateResponse | null>(null)
  const [timeLeft, setTimeLeft]         = useState(TIMER_DURATION)

  const questionDataRef = useRef<ReadingPart2QuestionResponse | null>(null)
  const matchesRef      = useRef<Record<number, number>>({})
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef   = useRef(false)

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { matchesRef.current = matches }, [matches])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

  const handleSubmit = useCallback(async () => {
    const qd  = questionDataRef.current
    const m   = matchesRef.current
    if (!qd || submittingRef.current) return

    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)

    try {
      const matchesArray = Object.entries(m).map(([qid, aid]) => ({
        question_id: parseInt(qid),
        answer_question_id: aid,
      }))
      const response = await evaluateReadingPart2({ exam_id: qd.exam_id, matches: matchesArray })
      setResult(response)
    } catch (err) {
      console.error("evaluate part2 failed:", err)
    } finally {
      setSubmitting(false)
    }
  }, [])

  const handleSubmitRef = useRef(handleSubmit)
  useEffect(() => { handleSubmitRef.current = handleSubmit }, [handleSubmit])

  const handleSelect = useCallback((questionId: number, answerId: number) => {
    setMatches((prev) => {
      if (prev[questionId] === answerId) return prev
      return { ...prev, [questionId]: answerId }
    })
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getReadingPart2Question()
        setQuestionData(data)
        setTimeLeft(TIMER_DURATION)
      } catch (err) {
        console.error("load part2 failed:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

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

  const questions       = questionData?.set.questions ?? []
  const allMatched      = questions.length > 0 && questions.every((q) => matches[q.id] !== undefined)

  return {
    loading, submitting, questionData,
    matches, result, timeLeft,
    allMatched, formatTime,
    handleSelect, handleSubmit,
  }
}
