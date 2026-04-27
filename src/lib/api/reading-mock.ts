import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"
import type { ReadingPart1Question } from "./reading"
import type { ReadingPart5TextData } from "./reading-part5"

// ── Full Mock Question Types ──────────────────────────────────────────────────

export interface ReadingMockPart1Data {
  id: number
  title: string | null
  instruction: string | null
  text: string
  questions: { global_number: number; position: number }[]
}

export interface ReadingMockPart2Data {
  title: string | null
  instruction: string | null
  text?: string | null
  questions: { id: number; text: string }[]  // 10 ta question (A-J) - global_number yo'q
  answers: { global_number: number; id: number; text: string }[]  // 8 ta passage with global numbers (7-14)
}

export interface ReadingMockPart3Data {
  title: string | null
  instruction: string | null
  text: string | null
  questions: { global_number: number; id: number; text: string }[]
  answers: { id: number; text: string }[]
}

export interface ReadingMockPart4Data {
  id: number
  title: string | null
  instruction: string | null
  text: string
  questions: {
    global_number: number
    id: number
    question: string
    answers: { id: number; answer: string }[]
  }[]
}

export interface ReadingMockPart5Data {
  id: number
  title: string | null
  instruction: string | null
  text: string
  summary_text: string
  gap_fillings: {
    id: number
    positions: { global_number: number; position: number }[]
    answers: { position: number; answer: string }[]
  }[]
  mcq_questions: {
    global_number: number
    id: number
    question: string
    answers: { id: number; answer: string; is_correct: boolean }[]
  }[]
}

export interface ReadingFullMockQuestionsResponse {
  exam_id: number
  reading: {
    part1: ReadingMockPart1Data
    part2: ReadingMockPart2Data
    part3: ReadingMockPart3Data
    part4: ReadingMockPart4Data
    part5: ReadingMockPart5Data
  }
}

// ── Full Mock Evaluate Types ──────────────────────────────────────────────────

export interface ReadingFullMockPartResult {
  correct_count: number
  total_questions: number
  score_percent: number
  details: any[]
}

export interface ReadingFullMockEvaluateResponse {
  attempt_id: number
  overall_score_percent: number
  total_correct: number
  total_questions: number
  cefr_level: string
  parts: {
    part1?: ReadingFullMockPartResult
    part2?: ReadingFullMockPartResult
    part3?: ReadingFullMockPartResult
    part4?: ReadingFullMockPartResult
    part5?: ReadingFullMockPartResult
  }
}

// ── API Functions ─────────────────────────────────────────────────────────────

export interface ReadingFullMockEvaluatePayload {
  exam_id: number
  answers: {
    part1?: Record<string, { question_id: number; position: number; answer: string }>
    part2?: Record<string, { question_id: number; answer_question_id: number }>
    part3?: Record<string, { question_id: number; answer_question_id: number }>
    part4?: Record<string, { question_id: number; answer_id: number }>
    part5?: Record<string, 
      | { gap_filling_id: number; position: number; answer: string }
      | { question_id: number; answer_id: number }
    >
  }
}

export async function getReadingFullMockQuestions(
  examId?: number
): Promise<ReadingFullMockQuestionsResponse> {
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  params._t = Date.now()

  const { data } = await apiClient.get<ReadingFullMockQuestionsResponse>(
    ENDPOINTS.reading.all.question,
    { params }
  )
  return data
}

export async function evaluateReadingFullMock(
  payload: ReadingFullMockEvaluatePayload
): Promise<ReadingFullMockEvaluateResponse> {
  const { data } = await apiClient.post<ReadingFullMockEvaluateResponse>(
    ENDPOINTS.reading.all.evaluate,
    payload
  )
  return data
}
