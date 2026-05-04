"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart3Question,
  evaluateReadingPart3,
  type ReadingPart3QuestionResponse,
  type ReadingPart3EvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer, useExamLoader, useExamSubmit } from "@/hooks/shared"

const TIMER_DURATION = 10 * 60 // 10 minutes

export function useReadingPart3() {
  const [questionData, setQuestionData] = useState<ReadingPart3QuestionResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // {"1": "A", "2": "B", ...}

  const questionDataRef = useRef<ReadingPart3QuestionResponse | null>(null)
  const answersRef = useRef<Record<string, string>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ✅ Shared Loader Hook (must be first)
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || '1')
  
  const loader = useExamLoader({
    loadFn: () => getReadingPart3Question(examId),
    validateFn: (data) => {
      if (!data?.paragraphs || !data?.headings) {
        throw new Error('Invalid question data: missing paragraphs or headings')
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
    { exam_id: number; set_id: number; answers: Record<string, string> },
    ReadingPart3EvaluateResponse
  >({
    submitFn: async ({ exam_id, set_id, answers }) => {
      return evaluateReadingPart3(exam_id, set_id, { answers })
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
      set_id: qd.set_id, 
      answers: ans 
    })
  }, [submitter])

  const paragraphs = questionData?.paragraphs ?? []
  const allMatched = paragraphs.length > 0 && paragraphs.every((p) => answers[p.position.toString()] !== undefined)

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
    allMatched,
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
