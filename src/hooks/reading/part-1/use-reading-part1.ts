"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart1Question,
  evaluateReadingPart1,
  type ReadingPart1QuestionResponse,
  type ReadingPart1EvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer, useExamLoader, useExamSubmit } from "@/hooks/shared"

const TIMER_DURATION = 8 * 60 // 8 minutes

export function useReadingPart1() {
  const [questionData, setQuestionData] = useState<ReadingPart1QuestionResponse | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  // Refs for stable references
  const questionDataRef = useRef<ReadingPart1QuestionResponse | null>(null)
  const answersRef = useRef<Record<number, string>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ✅ Shared Loader Hook (must be first)
  const loader = useExamLoader({
    loadFn: getReadingPart1Question,
    validateFn: (data) => {
      if (!data?.question?.text) {
        throw new Error('Invalid question data: missing text')
      }
    },
    onSuccess: (data) => {
      // Fallback: derive positions from text when DB has no answer records
      if (data.question.positions.length === 0 && data.question.text) {
        const matches = data.question.text.match(/_{1,}(\d+)_{1,}/g) ?? []
        data.question.positions = [...new Set(matches.map((m) => parseInt(m.replace(/[^0-9]/g, ""))))]
      }

      setQuestionData(data)

      // Initialize answers
      const init: Record<number, string> = {}
      data.question.positions.forEach((p) => { init[p] = "" })
      setAnswers(init)

      timer.reset()
    },
  })

  // ✅ Shared Submit Hook
  const submitter = useExamSubmit<
    { exam_id: number; answers: Array<{ question_id: number; position: number; answer: string }> },
    ReadingPart1EvaluateResponse
  >({
    submitFn: evaluateReadingPart1,
    onSuccess: () => {
      timer.stop()
    },
  })

  // ✅ Shared Timer Hook
  const timer = useExamTimer({
    duration: TIMER_DURATION,
    onTimeout: () => handleSubmit(),
    enabled: !loader.loading && !submitter.result && !loader.error,
  })

  // Load question on mount
  useEffect(() => {
    // Clear previous data to prevent flickering
    setQuestionData(null)
    setAnswers({})
    
    loader.load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle answer change
  const handleAnswerChange = useCallback((position: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [position]: value }))
  }, [])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    const qd = questionDataRef.current
    const ans = answersRef.current
    if (!qd) return

    const answersArray = Object.entries(ans).map(([pos, val]) => ({
      question_id: qd.question.id,
      position: parseInt(pos),
      answer: val.trim(),
    }))

    await submitter.submit({ exam_id: qd.exam_id, answers: answersArray })
  }, [submitter.submit])

  // Check if all filled
  const allFilled = Object.values(answers).every((a) => a.trim().length > 0)

  return {
    // Loading state
    loading: loader.loading,
    error: loader.error,
    retry: loader.retry,

    // Question data
    questionData,
    answers,
    handleAnswerChange,

    // Submit state
    submitting: submitter.submitting,
    result: submitter.result,
    handleSubmit,
    allFilled,

    // Timer
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
