"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getReadingPart3Question,
  evaluateReadingPart3,
  type ReadingPart3QuestionResponse,
  type ReadingPart3EvaluateResponse,
} from "@/lib/api/reading"

const TIMER_DURATION = 10 * 60

export function useReadingPart3() {
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [questionData, setQuestionData] = useState<ReadingPart3QuestionResponse | null>(null)
  const [matches, setMatches]           = useState<Record<number, number>>({})
  const [result, setResult]             = useState<ReadingPart3EvaluateResponse | null>(null)
  const [timeLeft, setTimeLeft]         = useState(TIMER_DURATION)

  const questionDataRef = useRef<ReadingPart3QuestionResponse | null>(null)
  const matchesRef      = useRef<Record<number, number>>({})
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittingRef   = useRef(false)

  useEffect(() => { questionDataRef.current = questionData }, [questionData])
  useEffect(() => { matchesRef.current = matches }, [matches])
  useEffect(() => { submittingRef.current = submitting }, [submitting])

  const handleSubmit = useCallback(async () => {
    const qd  = questionDataRef.current
    const m   = matchesRef.current
    if (!qd || submittingRef.current) return

    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitting(true)

    try {
      // Backend expects: { question_id, answer_question_id }
      // m = { paragraph_id: heading_id }
      // Backend'da: question = paragraphs (6 ta), answer/headings = headings (8 ta)
      const matchesArray = Object.entries(m).map(([paragraphId, headingId]) => ({
        question_id: parseInt(paragraphId),  // Paragraph (6 ta)
        answer_question_id: headingId,        // Heading (8 ta)
      }))
      const response = await evaluateReadingPart3({ exam_id: qd.exam_id, matches: matchesArray })
      setResult(response)
    } catch (err) {
      console.error("evaluate part3 failed:", err)
    } finally {
      setSubmitting(false)
    }
  }, [])

  const handleSubmitRef = useRef(handleSubmit)
  useEffect(() => { handleSubmitRef.current = handleSubmit }, [handleSubmit])

  const handleSelect = useCallback((paragraphId: number, headingId: number) => {
    setMatches((prev) => {
      if (prev[paragraphId] === headingId) return prev
      return { ...prev, [paragraphId]: headingId }
    })
  }, [])

  useEffect(() => {
    // Clear previous data and show loading
    setQuestionData(null)
    setResult(null)
    setMatches({})
    setLoading(true)
    
    ;(async () => {
      try {
        const data = await getReadingPart3Question()
        setQuestionData(data)
        setTimeLeft(TIMER_DURATION)
      } catch (err) {
        console.error("load part3 failed:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, []) // Only run on mount

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

  const paragraphs      = questionData?.set.questions ?? []
  const headings        = questionData?.set.answers ?? []
  const allMatched      = paragraphs.length > 0 && paragraphs.every((p) => matches[p.id] !== undefined)

  return {
    loading, submitting, questionData,
    matches, result, timeLeft,
    allMatched, formatTime,
    handleSelect, handleSubmit,
  }
}
