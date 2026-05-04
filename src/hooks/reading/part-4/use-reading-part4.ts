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
  const [answers, setAnswers] = useState<Record<string, string>>({}) // {"1": "A", "2": "B", ...}

  const questionDataRef = useRef<ReadingPart4QuestionResponse | null>(null)
  const answersRef = useRef<Record<string, string>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ✅ Shared Loader Hook (must be first)
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || '1')
  
  const loader = useExamLoader({
    loadFn: () => getReadingPart4Question(examId),
    validateFn: (data) => {
      if (!data?.questions || data.questions.length === 0) {
        throw new Error('Invalid question data: missing questions')
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
    { exam_id: number; text_id: number; answers: Record<string, string> },
    ReadingPart4EvaluateResponse
  >({
    submitFn: async ({ exam_id, text_id, answers }) => {
      return evaluateReadingPart4(exam_id, text_id, { answers })
    },
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

  const handleSelect = useCallback((position: number, letter: string) => {
    setAnswers((prev) => {
      const positionStr = position.toString()
      if (prev[positionStr] === letter) return prev
      return { ...prev, [positionStr]: letter }
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    const qd = questionDataRef.current
    const ans = answersRef.current
    if (!qd) return

    await submitter.submit({ 
      exam_id: qd.exam_id, 
      text_id: qd.text_id, 
      answers: ans 
    })
  }, [submitter])

  const questions = questionData?.questions ?? []
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.position.toString()] !== undefined)

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
