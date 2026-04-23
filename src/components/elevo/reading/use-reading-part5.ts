"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart5Question,
  evaluateReadingPart5,
  type ReadingPart5QuestionResponse,
  type ReadingPart5EvaluateResponse,
} from "@/lib/api/reading-part5"

const TIMER_DURATION = 12 * 60  // 12 minutes for Part 5

export function useReadingPart5() {
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [questionData, setQuestionData] = useState<ReadingPart5QuestionResponse | null>(null)
  const [gapAnswers, setGapAnswers]     = useState<Record<number, string>>({})  // position -> answer
  const [mcqAnswers, setMcqAnswers]     = useState<Record<number, number>>({})  // question_id -> answer_id
  const [result, setResult]             = useState<ReadingPart5EvaluateResponse | null>(null)
  const [timeLeft, setTimeLeft]         = useState(TIMER_DURATION)

  const questionDataRef = useRef<ReadingPart5QuestionResponse | null>(null)
  const gapAnswersRef   = useRef<Record<number, string>>({})
  const mcqAnswersRef   = useRef<Record<number, number>>({})
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef   = useRef(false)

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { gapAnswersRef.current = gapAnswers }, [gapAnswers])
  useEffect(() => { mcqAnswersRef.current = mcqAnswers }, [mcqAnswers])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

  const handleSubmit = useCallback(async () => {
    const qd  = questionDataRef.current
    const gaps = gapAnswersRef.current
    const mcqs = mcqAnswersRef.current
    if (!qd || submittingRef.current) return

    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)

    try {
      // Backend expects: [{gap_filling_id, position, answer}]
      // We have: gap_answers = {position: string}
      // Need to map position -> gap_filling_id from questionData
      const gapFillings = qd.text.gap_fillings || []
      const gapIdMap = new Map<number, number>() // position -> gap_filling_id
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
      
      console.log('Gap Answers being sent:', gaps)
      console.log('Gap Answers Array:', gapAnswersArray)
      
      const mcqAnswersArray = Object.entries(mcqs).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        answer_id: answerId,
      }))

      const response = await evaluateReadingPart5({
        exam_id: qd.exam_id,
        gap_answers: gapAnswersArray,
        question_answers: mcqAnswersArray,
      })
      setResult(response)
    } catch (err) {
      console.error("evaluate part5 failed:", err)
    } finally {
      setSubmitting(false)
    }
  }, [])

  const handleSubmitRef = useRef(handleSubmit)
  useEffect(() => { handleSubmitRef.current = handleSubmit }, [handleSubmit])

  const handleGapChange = useCallback((position: number, value: string) => {
    setGapAnswers((prev) => ({ ...prev, [position]: value }))
  }, [])

  const handleMcqSelect = useCallback((questionId: number, answerId: number) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  useEffect(() => {
    setQuestionData(null)
    setResult(null)
    setGapAnswers({})
    setMcqAnswers({})
    setLoading(true)
    
    ;(async () => {
      try {
        const data = await getReadingPart5Question()
        setQuestionData(data)
        setTimeLeft(TIMER_DURATION)
      } catch (err) {
        console.error("load part5 failed:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (result || loading) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [result, loading])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const gapFillingsRaw   = questionData?.text.gap_fillings ?? []
  const mcqQuestions  = questionData?.text.mcq_questions ?? []
  // Backend format: [{id, positions: [1,2,3,4]}] -> flatten to [{position: 1}, {position: 2}, ...]
  const gapFillings = gapFillingsRaw.flatMap((gf: any) => 
    gf.positions.map((pos: number) => ({ position: pos }))
  )
  const allGapAnswered = gapFillings.every((g) => gapAnswers[g.position]?.trim())
  const allMcqAnswered = mcqQuestions.every((q) => mcqAnswers[q.id] !== undefined)
  const allAnswered = allGapAnswered && allMcqAnswered

  return {
    loading, submitting, questionData,
    gapAnswers, mcqAnswers, result, timeLeft,
    gapFillings, mcqQuestions, allAnswered, formatTime,
    handleGapChange, handleMcqSelect, handleSubmit,
  }
}
