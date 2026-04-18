import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"

export interface ReadingPart1Question {
  id: number
  title: string | null
  instruction: string | null
  text: string
  positions: number[]
}

export interface ReadingPart1QuestionResponse {
  exam_id: number
  part: number
  question: ReadingPart1Question
}

export interface ReadingPart1Answer {
  question_id: number
  position: number
  answer: string
}

export interface ReadingPart1EvaluateRequest {
  exam_id: number
  answers: ReadingPart1Answer[]
}

export interface ReadingPart1AnswerDetail {
  question_id: number
  position: number
  user_answer: string
  correct_answer: string | null
  correct: boolean
}

export interface ReadingPart1EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ReadingPart1AnswerDetail[]
}

export async function getReadingPart1Question(
  examId?: number
): Promise<ReadingPart1QuestionResponse> {
  const params = examId ? { exam_id: examId } : {}
  const { data } = await apiClient.get<ReadingPart1QuestionResponse>(
    ENDPOINTS.reading.part(1).question,
    { params }
  )
  return data
}

// ── Part 2 ──────────────────────────────────────────────────────────────────

export interface ReadingPart2AnswerOption {
  id: number
  text: string
}

export interface ReadingPart2Set {
  title: string | null
  instruction: string | null
  text: string | null
  questions: ReadingPart2AnswerOption[]
  answers: ReadingPart2AnswerOption[]
}

export interface ReadingPart2QuestionResponse {
  exam_id: number
  part: number
  set: ReadingPart2Set
}

export interface ReadingPart2Match {
  question_id: number
  answer_question_id: number
}

export interface ReadingPart2EvaluateRequest {
  exam_id: number
  matches: ReadingPart2Match[]
}

export interface ReadingPart2DetailItem {
  question_id: number
  answer_question_id: number
  correct: boolean
  correct_answer_id: number | null
}

export interface ReadingPart2EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ReadingPart2DetailItem[]
}

export async function getReadingPart2Question(
  examId?: number
): Promise<ReadingPart2QuestionResponse> {
  const params = examId ? { exam_id: examId } : {}
  const { data } = await apiClient.get<ReadingPart2QuestionResponse>(
    ENDPOINTS.reading.part(2).question,
    { params }
  )
  return data
}

export async function evaluateReadingPart2(
  payload: ReadingPart2EvaluateRequest
): Promise<ReadingPart2EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart2EvaluateResponse>(
    ENDPOINTS.reading.part(2).evaluate,
    payload
  )
  return data
}

// ── Part 1 evaluate ─────────────────────────────────────────────────────────

export async function evaluateReadingPart1(
  payload: ReadingPart1EvaluateRequest
): Promise<ReadingPart1EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart1EvaluateResponse>(
    ENDPOINTS.reading.part(1).evaluate,
    payload
  )
  return data
}
