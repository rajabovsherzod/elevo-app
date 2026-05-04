"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart2Question,
  evaluateReadingPart2,
  type ReadingPart2QuestionResponse,
  type ReadingPart2EvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer, useExamLoader, useExamSubmit } from "@/hooks/shared"

const TIMER_DURATION = 10 * 60 // 10 minutes
const EXAM_ID = 1 // Default exam ID

export function useReadingPart2() {
  const [questionData, setQuestionData] = useState<ReadingPart2QuestionResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // {"1": "A", "2": "B", ...}

  const questionDataRef = useRef<ReadingPart2QuestionResponse | null>(null)
  const answersRef = useRef<Record<string, string>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ✅ Shared Loader Hook (must be first)
  const loader = useExamLoader({
    loadFn: () => getReadingPart2Question(EXAM_ID),
    validateFn: (data) => {
      if (!data?.set_id || !data?.passages || !data?.headings) {
        throw new Error('Invalid question data: missing required fields')
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
    { answers: Record<string, string> },
    ReadingPart2EvaluateResponse
  >({
    submitFn: (payload) => {
      const qd = questionDataRef.current
      if (!qd) throw new Error('No question data')
      return evaluateReadingPart2(qd.exam_id, qd.set_id, payload)
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
    const ans = answersRef.current
    await submitter.submit({ answers: ans })
  }, [submitter.submit])

  const passages = questionData?.passages ?? []
  const allMatched = passages.length > 0 && passages.every((p) => answers[p.position.toString()] !== undefined)

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
