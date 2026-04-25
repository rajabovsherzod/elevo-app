"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart4Question,
  evaluateReadingPart4,
  type ReadingPart4QuestionResponse,
  type ReadingPart4EvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer, useExamLoader, useExamSubmit } from "@/hooks/shared"

const TIMER_DURATION = 15 * 60 // 15 minutes

export function useReadingPart4() {
  const [questionData, setQuestionData] = useState<ReadingPart4QuestionResponse | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const questionDataRef = useRef<ReadingPart4QuestionResponse | null>(null)
  const answersRef = useRef<Record<number, number>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ✅ Shared Loader Hook (must be first)
  const loader = useExamLoader({
    loadFn: getReadingPart4Question,
    validateFn: (data) => {
      if (!data?.text) {
        throw new Error('Invalid question data: missing text')
      }
    },
    onSuccess: (data) => {
      setQuestionData(data)
      setAnswers({})
      timer.reset()
    },
  })

  // ✅ Shared Submit Hook
  const submitter = useExamSubmit<
    { exam_id: number; answers: Array<{ question_id: number; answer_id: number }> },
    ReadingPart4EvaluateResponse
  >({
    submitFn: evaluateReadingPart4,
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

  useEffect(() => {
    loader.load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback((questionId: number, answerId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  const handleSubmit = useCallback(async () => {
    const qd = questionDataRef.current
    const a = answersRef.current
    if (!qd) return

    const answersArray = Object.entries(a).map(([questionId, answerId]) => ({
      question_id: parseInt(questionId),
      answer_id: answerId,
    }))

    await submitter.submit({ exam_id: qd.exam_id, answers: answersArray })
  }, [submitter])

  const questions = questionData?.text.questions ?? []
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)

  return {
    loading: loader.loading,
    error: loader.error,
    retry: loader.retry,
    questionData,
    answers,
    handleSelect,
    submitting: submitter.submitting,
    result: submitter.result,
    handleSubmit,
    allAnswered,
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
