"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart5Question,
  evaluateReadingPart5,
  type ReadingPart5QuestionResponse,
  type ReadingPart5EvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer, useExamLoader, useExamSubmit } from "@/hooks/shared"

const TIMER_DURATION = 12 * 60 // 12 minutes

export function useReadingPart5() {
  const [questionData, setQuestionData] = useState<ReadingPart5QuestionResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // {"1": "text", "5": "A"}

  const questionDataRef = useRef<ReadingPart5QuestionResponse | null>(null)
  const answersRef = useRef<Record<string, string>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ✅ Shared Loader Hook (must be first)
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || '1')
  
  const loader = useExamLoader({
    loadFn: () => getReadingPart5Question(examId),
    validateFn: (data) => {
      if (!data?.summary_text || !data?.gap_positions) {
        throw new Error('Invalid question data: missing summary_text or gap positions')
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
    ReadingPart5EvaluateResponse
  >({
    submitFn: async ({ exam_id, text_id, answers }) => {
      return evaluateReadingPart5(exam_id, text_id, { answers })
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

  const handleAnswerChange = useCallback((position: number, value: string) => {
    setAnswers((prev) => {
      const positionStr = position.toString()
      if (prev[positionStr] === value) return prev
      return { ...prev, [positionStr]: value }
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

  // Check if all answers are filled
  const gapPositions = questionData?.gap_positions ?? []
  const mcqQuestions = questionData?.questions ?? []
  const totalQuestions = gapPositions.length + mcqQuestions.length
  
  const allAnswered = totalQuestions > 0 && 
    [...gapPositions, ...mcqQuestions.map(q => q.position)].every(
      pos => answers[pos.toString()]?.trim()
    )

  return {
    loading: loader.loading,
    error: loader.error,
    retry: loader.retry,
    questionData,
    answers,
    handleAnswerChange,
    submitting: submitter.submitting,
    result: submitter.result,
    handleSubmit,
    allAnswered,
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
