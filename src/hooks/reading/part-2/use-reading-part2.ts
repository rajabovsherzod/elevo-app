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

export function useReadingPart2() {
  const [questionData, setQuestionData] = useState<ReadingPart2QuestionResponse | null>(null)
  const [matches, setMatches] = useState<Record<number, number>>({})

  const questionDataRef = useRef<ReadingPart2QuestionResponse | null>(null)
  const matchesRef = useRef<Record<number, number>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { matchesRef.current = matches }, [matches])

  // ✅ Shared Loader Hook (must be first)
  const loader = useExamLoader({
    loadFn: getReadingPart2Question,
    validateFn: (data) => {
      if (!data?.set) {
        throw new Error('Invalid question data: missing set')
      }
    },
    onSuccess: (data) => {
      setQuestionData(data)
      setMatches({})
      timer.reset()
    },
  })

  // ✅ Shared Submit Hook
  const submitter = useExamSubmit<
    { exam_id: number; matches: Array<{ question_id: number; answer_question_id: number }> },
    ReadingPart2EvaluateResponse
  >({
    submitFn: evaluateReadingPart2,
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

  const handleSelect = useCallback((passageId: number, questionId: number) => {
    setMatches((prev) => {
      if (prev[passageId] === questionId) return prev
      return { ...prev, [passageId]: questionId }
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    const qd = questionDataRef.current
    const m = matchesRef.current
    if (!qd) return

    const matchesArray = Object.entries(m).map(([passageId, questionId]) => ({
      question_id: questionId,
      answer_question_id: parseInt(passageId),
    }))

    await submitter.submit({ exam_id: qd.exam_id, matches: matchesArray })
  }, [submitter.submit])

  const passages = questionData?.set.answers ?? []
  const allMatched = passages.length > 0 && passages.every((p) => matches[p.id] !== undefined)

  return {
    loading: loader.loading,
    error: loader.error,
    retry: loader.retry,
    questionData,
    matches,
    handleSelect,
    submitting: submitter.submitting,
    result: submitter.result,
    handleSubmit,
    allMatched,
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
