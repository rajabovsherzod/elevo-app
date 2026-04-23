import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"

// ── Part 5 Types ──────────────────────────────────────────────────────────────

export interface ReadingPart5GapFillingAnswer {
  position: number
  answer: string
}

export interface ReadingPart5GapFilling {
  id: number
  positions: number[]
  answers: ReadingPart5GapFillingAnswer[]
}

export interface ReadingPart5MCQAnswer {
  id: number
  answer: string
  is_correct: boolean
}

export interface ReadingPart5MCQQuestion {
  id: number
  question: string
  answers: ReadingPart5MCQAnswer[]
}

export interface ReadingPart5TextData {
  id: number
  title: string | null
  instruction: string | null
  text: string  // MAIN TEXT
  summary_text: string  // SUMMARY WITH _1_ _2_
  gap_fillings: ReadingPart5GapFilling[]
  mcq_questions: ReadingPart5MCQQuestion[]
}

export interface ReadingPart5QuestionResponse {
  exam_id: number
  part: number
  text: ReadingPart5TextData
}

export interface ReadingPart5GapAnswer {
  gap_filling_id: number
  position: number
  answer: string
}

export interface ReadingPart5MCQAnswerSubmit {
  question_id: number
  answer_id: number
}

export interface ReadingPart5EvaluateRequest {
  exam_id: number
  gap_answers: ReadingPart5GapAnswer[]
  question_answers: ReadingPart5MCQAnswerSubmit[]
}

export interface ReadingPart5GapDetail {
  position: number
  user_answer: string
  correct_answer: string | null
  correct: boolean
}

export interface ReadingPart5MCQDetail {
  question_id: number
  answer_id: number
  correct: boolean
  correct_answer: string
}

export interface ReadingPart5EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: {
    gap_filling: ReadingPart5GapDetail[]
    questions: ReadingPart5MCQDetail[]
  }
}

export async function getReadingPart5Question(
  examId?: number
): Promise<ReadingPart5QuestionResponse> {
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  params._t = Date.now()
  
  const { data } = await apiClient.get<ReadingPart5QuestionResponse>(
    ENDPOINTS.reading.part(5).question,
    { params }
  )
  return data
}

export async function evaluateReadingPart5(
  payload: ReadingPart5EvaluateRequest
): Promise<ReadingPart5EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart5EvaluateResponse>(
    ENDPOINTS.reading.part(5).evaluate,
    payload
  )
  return data
}
