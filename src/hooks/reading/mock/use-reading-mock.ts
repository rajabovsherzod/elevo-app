"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  getReadingFullMockQuestions,
  evaluateReadingFullMock,
  type ReadingFullMockQuestionsResponse,
  type ReadingFullMockEvaluateResponse,
} from "@/lib/api/reading-mock"
import { useExamTimer } from "@/hooks/shared"

const TIMER_DURATION = 60 * 60 // 60 minutes

export type MockPart = 1 | 2 | 3 | 4 | 5

export function useReadingMock() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<ReadingFullMockQuestionsResponse | null>(null)
  const [result, setResult] = useState<ReadingFullMockEvaluateResponse | null>(null)
  const [currentPart, setCurrentPart] = useState<MockPart>(1)

  // ── Per-part answers ────────────────────────────────────────────────────────
  const [part1Answers, setPart1Answers] = useState<Record<number, string>>({})
  const [part2Matches, setPart2Matches] = useState<Record<number, number>>({})
  const [part3Matches, setPart3Matches] = useState<Record<number, number>>({})
  const [part4Answers, setPart4Answers] = useState<Record<number, number>>({})
  const [part5GapAnswers, setPart5GapAnswers] = useState<Record<string, string>>({})
  const [part5McqAnswers, setPart5McqAnswers] = useState<Record<number, number>>({})

  // Refs for stable access in callbacks
  const examDataRef = useRef(examData)
  const part1AnswersRef = useRef(part1Answers)
  const part2MatchesRef = useRef(part2Matches)
  const part3MatchesRef = useRef(part3Matches)
  const part4AnswersRef = useRef(part4Answers)
  const part5GapAnswersRef = useRef(part5GapAnswers)
  const part5McqAnswersRef = useRef(part5McqAnswers)

  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { part1AnswersRef.current = part1Answers }, [part1Answers])
  useEffect(() => { part2MatchesRef.current = part2Matches }, [part2Matches])
  useEffect(() => { part3MatchesRef.current = part3Matches }, [part3Matches])
  useEffect(() => { part4AnswersRef.current = part4Answers }, [part4Answers])
  useEffect(() => { part5GapAnswersRef.current = part5GapAnswers }, [part5GapAnswers])
  useEffect(() => { part5McqAnswersRef.current = part5McqAnswers }, [part5McqAnswers])

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

    getReadingFullMockQuestions()
      .then((data) => {
        if (cancelled) return
        setExamData(data)

        // Initialize Part 1 answers
        const p1Init: Record<number, string> = {}
        if (data.reading.part1.questions) {
          data.reading.part1.questions.forEach((q) => { p1Init[q.position] = "" })
        }
        setPart1Answers(p1Init)

        // Initialize Part 5 gap answers
        const p5Init: Record<string, string> = {}
        if (data.reading.part5.gap_fillings) {
          data.reading.part5.gap_fillings.forEach((gf: any) => {
            gf.positions.forEach((pos: any) => {
              p5Init[`${gf.id}_${pos.position}`] = ""
            })
          })
        }
        setPart5GapAnswers(p5Init)

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

  // ── Part 1 handlers ─────────────────────────────────────────────────────────
  const handlePart1Change = useCallback((position: number, value: string) => {
    setPart1Answers((prev) => ({ ...prev, [position]: value }))
  }, [])

  // ── Part 2 handlers ─────────────────────────────────────────────────────────
  const handlePart2Select = useCallback((passageId: number, questionId: number) => {
    setPart2Matches((prev) => ({ ...prev, [passageId]: questionId }))
  }, [])

  // ── Part 3 handlers ─────────────────────────────────────────────────────────
  const handlePart3Select = useCallback((paragraphId: number, headingId: number) => {
    setPart3Matches((prev) => ({ ...prev, [paragraphId]: headingId }))
  }, [])

  // ── Part 4 handlers ─────────────────────────────────────────────────────────
  const handlePart4Select = useCallback((questionId: number, answerId: number) => {
    setPart4Answers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  // ── Part 5 handlers ─────────────────────────────────────────────────────────
  const handlePart5GapChange = useCallback((key: string, value: string) => {
    setPart5GapAnswers((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handlePart5McqSelect = useCallback((questionId: number, answerId: number) => {
    setPart5McqAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

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
    if (!data || submitting) return

    setSubmitting(true)
    timer.stop()

    try {
      const p1Ans = part1AnswersRef.current
      const p2Mat = part2MatchesRef.current
      const p3Mat = part3MatchesRef.current
      const p4Ans = part4AnswersRef.current
      const p5Gap = part5GapAnswersRef.current
      const p5Mcq = part5McqAnswersRef.current

      const part1AnswersPayload: Record<string, any> = {}
      data.reading.part1.questions?.forEach((q) => {
        part1AnswersPayload[q.global_number.toString()] = {
          question_id: data.reading.part1.id,
          position: q.position,
          answer: (p1Ans[q.position] || "").trim()
        }
      })

      const part2AnswersPayload: Record<string, any> = {}
      // Part 2: p2Mat da key = passageId, value = questionId (alohida Part 2 dagi kabi)
      data.reading.part2.answers?.forEach((passage) => {
        const questionId = p2Mat[passage.id]  // Shu passage uchun tanlangan question
        
        part2AnswersPayload[passage.global_number.toString()] = {
          question_id: questionId || null,
          answer_question_id: passage.id,
          global_number: passage.global_number
        }
      })

      const part3AnswersPayload: Record<string, any> = {}
      data.reading.part3.questions?.forEach((q) => {
        part3AnswersPayload[q.global_number.toString()] = {
          question_id: q.id,
          answer_question_id: p3Mat[q.id] || null // Send null if not answered
        }
      })

      const part4AnswersPayload: Record<string, any> = {}
      data.reading.part4.questions?.forEach((q) => {
        part4AnswersPayload[q.global_number.toString()] = {
          question_id: q.id,
          answer_id: p4Ans[q.id] || null // Send null if not answered
        }
      })

      const part5AnswersPayload: Record<string, any> = {}
      data.reading.part5.gap_fillings?.forEach((gf) => {
        gf.positions?.forEach((pos) => {
          const key = `${gf.id}_${pos.position}`
          part5AnswersPayload[pos.global_number.toString()] = {
            gap_filling_id: gf.id,
            position: pos.position,
            answer: (p5Gap[key] || "").trim()
          }
        })
      })

      data.reading.part5.mcq_questions?.forEach((q) => {
        part5AnswersPayload[q.global_number.toString()] = {
          question_id: q.id,
          answer_id: p5Mcq[q.id] || null // Send null if not answered
        }
      })

      const payload = {
        exam_id: data.exam_id,
        answers: {
          part1: part1AnswersPayload,
          part2: part2AnswersPayload,
          part3: part3AnswersPayload,
          part4: part4AnswersPayload,
          part5: part5AnswersPayload,
        }
      }

      const res = await evaluateReadingFullMock(payload)
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
    setPart1Answers({})
    setPart2Matches({})
    setPart3Matches({})
    setPart4Answers({})
    setPart5GapAnswers({})
    setPart5McqAnswers({})
    setLoading(true)

    getReadingFullMockQuestions()
      .then((data) => {
        setExamData(data)
        const p1Init: Record<number, string> = {}
        if (data.reading.part1.questions) {
          data.reading.part1.questions.forEach((q) => { p1Init[q.position] = "" })
        }
        setPart1Answers(p1Init)

        const p5Init: Record<string, string> = {}
        if (data.reading.part5.gap_fillings) {
          data.reading.part5.gap_fillings.forEach((gf: any) => {
            gf.positions.forEach((pos: any) => {
              p5Init[`${gf.id}_${pos.position}`] = ""
            })
          })
        }
        setPart5GapAnswers(p5Init)

        timer.reset()
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load")
        setLoading(false)
      })
  }, [timer])

  // ── Computed ────────────────────────────────────────────────────────────────
  const part1Filled = Object.values(part1Answers).every((a) => a.trim().length > 0)
  const part2Filled = examData ? Object.keys(part2Matches).length >= (examData.reading.part2.answers?.length || 0) : false  // 8 ta passage uchun
  const part3Filled = examData ? Object.keys(part3Matches).length >= (examData.reading.part3.questions?.length || 0) : false
  const part4Filled = examData ? Object.keys(part4Answers).length >= (examData.reading.part4.questions?.length || 0) : false
  const part5GapFilled = Object.values(part5GapAnswers).every((a) => a.trim().length > 0)
  const part5McqFilled = examData
    ? Object.keys(part5McqAnswers).length >= (examData.reading.part5.mcq_questions?.length || 0)
    : false
  const part5Filled = part5GapFilled && part5McqFilled

  const partCompletions = {
    1: part1Filled,
    2: part2Filled,
    3: part3Filled,
    4: part4Filled,
    5: part5Filled,
  }

  const allFilled = part1Filled && part2Filled && part3Filled && part4Filled && part5Filled

  // ── Stats ───────────────────────────────────────────────────────────────────
  let totalQuestionsCount = 35 // Hardcoded 35 for Full Mock

  const answeredCount =
    Object.values(part1Answers).filter((a) => a.trim().length > 0).length +
    Object.keys(part2Matches).length +
    Object.keys(part3Matches).length +
    Object.keys(part4Answers).length +
    Object.values(part5GapAnswers).filter((a) => a.trim().length > 0).length +
    Object.keys(part5McqAnswers).length

  return {
    // State
    loading,
    submitting,
    error,
    examData,
    result,
    currentPart,

    // Answers
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
