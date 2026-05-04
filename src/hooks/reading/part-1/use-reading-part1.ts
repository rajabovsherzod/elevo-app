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
      if (!data?.text) {
        throw new Error('Invalid question data: missing text')
      }
    },
    onSuccess: (data) => {
      // Fallback: derive positions from text when DB has no answer records
      if (data.positions.length === 0 && data.text) {
        const matches = data.text.match(/_{1,}(\d+)_{1,}/g) ?? []
        data.positions = [...new Set(matches.map((m) => parseInt(m.replace(/[^0-9]/g, ""))))]
      }

      setQuestionData(data)

      // Initialize answers
      const init: Record<number, string> = {}
      data.positions.forEach((p) => { init[p] = "" })
      setAnswers(init)

      timer.reset()
    },
  })

  // ✅ Shared Submit Hook
  const submitter = useExamSubmit<
    { exam_id: number; question_id: number; answers: Record<string, string> },
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

    // Convert to simple format: {"1": "answer", "2": "answer"}
    const answersRecord: Record<string, string> = {}
    Object.entries(ans).forEach(([pos, val]) => {
      answersRecord[pos] = val.trim()
    })

    await submitter.submit({ 
      exam_id: qd.exam_id, 
      question_id: qd.question_id,
      answers: answersRecord 
    })
  }, [submitter])

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
