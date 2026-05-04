"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  getReadingMockQuestion,
  evaluateReadingMock,
  type ReadingMockQuestionResponse,
  type ReadingMockEvaluateResponse,
} from "@/lib/api/reading"
import { useExamTimer } from "@/hooks/shared"

const TIMER_DURATION = 60 * 60 // 60 minutes
const DEFAULT_EXAM_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || "1")

export type MockPart = 1 | 2 | 3 | 4 | 5

export function useReadingMock() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<ReadingMockQuestionResponse | null>(null)
  const [result, setResult] = useState<ReadingMockEvaluateResponse | null>(null)
  const [currentPart, setCurrentPart] = useState<MockPart>(1)

  // ── Global answers (positions 1-35) ────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Refs for stable access in callbacks
  const examDataRef = useRef(examData)
  const answersRef = useRef(answers)

  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ── Timer ───────────────────────────────────────────────────────────────────
  const timer = useExamTimer({
    duration: TIMER_DURATION,
    onTimeout: () => handleSubmit(),
    enabled: !loading && !result && !error && !submitting,
  })

  // ── Load questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getReadingMockQuestion(DEFAULT_EXAM_ID)
      .then((data) => {
        if (cancelled) return
        setExamData(data)
        
        // Initialize empty answers for all 35 positions
        const initialAnswers: Record<string, string> = {}
        for (let i = 1; i <= 35; i++) {
          initialAnswers[i.toString()] = ""
        }
        setAnswers(initialAnswers)

        timer.reset()
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || "Failed to load full mock questions")
        setLoading(false)
      })

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Answer handlers (global positions 1-35) ─────────────────────────────────
  const handleAnswerChange = useCallback((globalPosition: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [globalPosition.toString()]: value }))
  }, [])

  // ── Part-specific handlers (convert to global positions) ───────────────────
  // Part 1: positions 1-6
  const handlePart1Change = useCallback((position: number, value: string) => {
    const globalPosition = position  // Part 1: 1-6
    handleAnswerChange(globalPosition, value)
  }, [handleAnswerChange])

  // Part 2: positions 7-14 (passage position -> letter)
  const handlePart2Select = useCallback((passagePosition: number, letter: string) => {
    const globalPosition = 6 + passagePosition  // Part 2: 7-14
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 3: positions 15-20 (paragraph position -> letter)
  const handlePart3Select = useCallback((paragraphPosition: number, letter: string) => {
    const globalPosition = 14 + paragraphPosition  // Part 3: 15-20
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 4: positions 21-29 (question position -> letter)
  const handlePart4Select = useCallback((questionPosition: number, letter: string) => {
    const globalPosition = 20 + questionPosition  // Part 4: 21-29
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 5 gap filling: positions 30-33 (gap position -> text)
  const handlePart5GapChange = useCallback((gapPosition: number, value: string) => {
    const globalPosition = 29 + gapPosition  // Part 5 gap: 30-33
    handleAnswerChange(globalPosition, value)
  }, [handleAnswerChange])

  // Part 5 MCQ: positions 34-35 (question position -> letter)
  const handlePart5McqSelect = useCallback((questionPosition: number, letter: string) => {
    const data = examDataRef.current
    if (!data) return
    
    // questionPosition backend dan keladi (5, 6)
    // Global position: 34, 35
    const gapCount = data.part5.gap_positions.length  // 4
    const localMcqPosition = questionPosition - gapCount  // 5-4=1, 6-4=2
    const globalPosition = 29 + gapCount + localMcqPosition  // 29+4+1=34, 29+4+2=35
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goToNextPart = useCallback(() => {
    setCurrentPart((prev) => Math.min(prev + 1, 5) as MockPart)
  }, [])

  const goToPrevPart = useCallback(() => {
    setCurrentPart((prev) => Math.max(prev - 1, 1) as MockPart)
  }, [])

  const goToPart = useCallback((part: MockPart) => {
    setCurrentPart(part)
  }, [])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const data = examDataRef.current
    const currentAnswers = answersRef.current
    
    if (!data || submitting) return

    setSubmitting(true)
    timer.stop()

    try {
      const payload = {
        resource_ids: data.resource_ids,
        answers: currentAnswers,  // Simple format: {"1": "answer", "7": "A", ...}
      }

      const res = await evaluateReadingMock(DEFAULT_EXAM_ID, payload)
      setResult(res)
    } catch (err: any) {
      setError(err?.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }, [submitting, timer])

  // ── Retry ───────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    setResult(null)
    setError(null)
    setCurrentPart(1)
    setAnswers({})
    setLoading(true)

    getReadingMockQuestion(DEFAULT_EXAM_ID)
      .then((data) => {
        setExamData(data)
        
        // Initialize empty answers for all 35 positions
        const initialAnswers: Record<string, string> = {}
        for (let i = 1; i <= 35; i++) {
          initialAnswers[i.toString()] = ""
        }
        setAnswers(initialAnswers)

        timer.reset()
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load")
        setLoading(false)
      })
  }, [timer])

  // ── Computed ────────────────────────────────────────────────────────────────
  // Part 1: positions 1-6
  const part1Filled = [1, 2, 3, 4, 5, 6].every(pos => 
    answers[pos.toString()]?.trim().length > 0
  )

  // Part 2: positions 7-14
  const part2Filled = [7, 8, 9, 10, 11, 12, 13, 14].every(pos => 
    answers[pos.toString()]?.trim().length > 0
  )

  // Part 3: positions 15-20
  const part3Filled = [15, 16, 17, 18, 19, 20].every(pos => 
    answers[pos.toString()]?.trim().length > 0
  )

  // Part 4: positions 21-29
  const part4Filled = [21, 22, 23, 24, 25, 26, 27, 28, 29].every(pos => 
    answers[pos.toString()]?.trim().length > 0
  )

  // Part 5: positions 30-35
  const part5Filled = [30, 31, 32, 33, 34, 35].every(pos => 
    answers[pos.toString()]?.trim().length > 0
  )

  const partCompletions = {
    1: part1Filled,
    2: part2Filled,
    3: part3Filled,
    4: part4Filled,
    5: part5Filled,
  }

  const allFilled = part1Filled && part2Filled && part3Filled && part4Filled && part5Filled

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalQuestionsCount = 35

  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length

  // ── Convert global answers to part-specific format for UI ──────────────────
  // Part 1: positions 1-6
  const part1Answers: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    part1Answers[i] = answers[i.toString()] || ""
  }

  // Part 2: positions 7-14 (passage position -> letter)
  const part2Matches: Record<number, string> = {}
  for (let i = 1; i <= 8; i++) {
    const globalPos = 6 + i
    const letter = answers[globalPos.toString()] || ""
    if (letter) part2Matches[i] = letter
  }

  // Part 3: positions 15-20 (paragraph position -> letter)
  const part3Matches: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    const globalPos = 14 + i
    const letter = answers[globalPos.toString()] || ""
    if (letter) part3Matches[i] = letter
  }

  // Part 4: positions 21-29 (question position -> letter)
  const part4Answers: Record<number, string> = {}
  for (let i = 1; i <= 9; i++) {
    const globalPos = 20 + i
    part4Answers[i] = answers[globalPos.toString()] || ""
  }

  // Part 5 gap: positions 30-33
  const part5GapAnswers: Record<number, string> = {}
  for (let i = 1; i <= 4; i++) {
    const globalPos = 29 + i
    part5GapAnswers[i] = answers[globalPos.toString()] || ""
  }

  // Part 5 MCQ: positions 34-35
  const part5McqAnswers: Record<number, string> = {}
  const gapCount = examData?.part5.gap_positions.length || 4
  for (let i = 1; i <= 2; i++) {
    const globalPos = 29 + gapCount + i  // 29+4+1=34, 29+4+2=35
    const mcqPosition = gapCount + i  // 5, 6 (backend position)
    part5McqAnswers[mcqPosition] = answers[globalPos.toString()] || ""
  }

  return {
    // State
    loading,
    submitting,
    error,
    examData,
    result,
    currentPart,

    // Answers (part-specific format for UI compatibility)
    part1Answers,
    part2Matches,
    part3Matches,
    part4Answers,
    part5GapAnswers,
    part5McqAnswers,

    // Handlers
    handlePart1Change,
    handlePart2Select,
    handlePart3Select,
    handlePart4Select,
    handlePart5GapChange,
    handlePart5McqSelect,

    // Navigation
    goToNextPart,
    goToPrevPart,
    goToPart,

    // Submit
    handleSubmit,
    retry,

    // Computed
    partCompletions,
    allFilled,
    answeredCount,
    totalQuestionsCount,

    // Timer
    timeLeft: timer.timeLeft,
    formatTime: timer.formatTime,
  }
}
