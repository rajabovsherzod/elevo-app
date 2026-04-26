"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart5Question,
  evaluateReadingPart5,
  type ReadingPart5QuestionResponse,
  type ReadingPart5EvaluateResponse,
} from "@/lib/api/reading-part5"
import { useExamTimer, useExamLoader, useExamSubmit } from "@/hooks/shared"

const TIMER_DURATION = 12 * 60 // 12 minutes

export function useReadingPart5() {
  const [questionData, setQuestionData] = useState<ReadingPart5QuestionResponse | null>(null)
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({})
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({})

  const questionDataRef = useRef<ReadingPart5QuestionResponse | null>(null)
  const gapAnswersRef = useRef<Record<number, string>>({})
  const mcqAnswersRef = useRef<Record<number, number>>({})

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { gapAnswersRef.current = gapAnswers }, [gapAnswers])
  useEffect(() => { mcqAnswersRef.current = mcqAnswers }, [mcqAnswers])

  // ✅ Shared Loader Hook (must be first)
  const loader = useExamLoader({
    loadFn: getReadingPart5Question,
    validateFn: (data) => {
      if (!data?.text) {
        throw new Error('Invalid question data: missing text')
      }
    },
    onSuccess: (data) => {
      setQuestionData(data)
      setGapAnswers({})
      setMcqAnswers({})
      timer.reset()
    },
  })

  // ✅ Shared Submit Hook
  const submitter = useExamSubmit<
    {
      exam_id: number
      gap_answers: Array<{ gap_filling_id: number; position: number; answer: string }>
      question_answers: Array<{ question_id: number; answer_id: number }>
    },
    ReadingPart5EvaluateResponse
  >({
    submitFn: evaluateReadingPart5,
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

  const handleGapChange = useCallback((position: number, value: string) => {
    setGapAnswers((prev) => ({ ...prev, [position]: value }))
  }, [])

  const handleMcqSelect = useCallback((questionId: number, answerId: number) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  const handleSubmit = useCallback(async () => {
    const qd = questionDataRef.current
    const gaps = gapAnswersRef.current
    const mcqs = mcqAnswersRef.current
    if (!qd) return

    // Build gap ID map
    const gapFillings = qd.text.gap_fillings || []
    const gapIdMap = new Map<number, number>()
    gapFillings.forEach((gf: any) => {
      gf.positions.forEach((pos: number) => {
        gapIdMap.set(pos, gf.id)
      })
    })

    const gapAnswersArray = Object.entries(gaps).map(([position, answer]) => ({
      gap_filling_id: gapIdMap.get(parseInt(position)) || 0,
      position: parseInt(position),
      answer: answer,
    }))

    const mcqAnswersArray = Object.entries(mcqs).map(([questionId, answerId]) => ({
      question_id: parseInt(questionId),
      answer_id: answerId,
    }))

    await submitter.submit({
      exam_id: qd.exam_id,
      gap_answers: gapAnswersArray,
      question_answers: mcqAnswersArray,
    })
  }, [submitter.submit])

  const gapFillingsRaw = questionData?.text.gap_fillings ?? []
  const mcqQuestions = questionData?.text.mcq_questions ?? []
  const gapFillings = gapFillingsRaw.flatMap((gf: any) =>
    gf.positions.map((pos: number) => ({ position: pos }))
  )
  const allGapAnswered = gapFillings.every((g) => gapAnswers[g.position]?.trim())
  const allMcqAnswered = mcqQuestions.every((q) => mcqAnswers[q.id] !== undefined)
  const allAnswered = allGapAnswered && allMcqAnswered

  return {
    loading: loader.loading,
    error: loader.error,
    retry: loader.retry,
    questionData,
    gapAnswers,
    mcqAnswers,
    handleGapChange,
    handleMcqSelect,
    submitting: submitter.submitting,
    result: submitter.result,
    handleSubmit,
    gapFillings,
    mcqQuestions,
    allAnswered,
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
