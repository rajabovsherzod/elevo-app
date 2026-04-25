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
  const [matches, setMatches] = useState<Record<number, number>>({})

  const questionDataRef = useRef<ReadingPart3QuestionResponse | null>(null)
  const matchesRef = useRef<Record<number, number>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { matchesRef.current = matches }, [matches])

  // ✅ Shared Loader Hook (must be first)
  const loader = useExamLoader({
    loadFn: getReadingPart3Question,
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
    ReadingPart3EvaluateResponse
  >({
    submitFn: evaluateReadingPart3,
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

  const handleSelect = useCallback((paragraphId: number, headingId: number) => {
    setMatches((prev) => {
      if (prev[paragraphId] === headingId) return prev
      return { ...prev, [paragraphId]: headingId }
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    const qd = questionDataRef.current
    const m = matchesRef.current
    if (!qd) return

    const matchesArray = Object.entries(m).map(([paragraphId, headingId]) => ({
      question_id: parseInt(paragraphId),
      answer_question_id: headingId,
    }))

    await submitter.submit({ exam_id: qd.exam_id, matches: matchesArray })
  }, [submitter])

  const paragraphs = questionData?.set.questions ?? []
  const allMatched = paragraphs.length > 0 && paragraphs.every((p) => matches[p.id] !== undefined)

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
