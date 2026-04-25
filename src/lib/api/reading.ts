import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"
import { validateData } from "@/lib/utils/validation"
import {
  ReadingPart1ResponseSchema,
  ReadingPart1EvaluateResponseSchema,
  ReadingPart2ResponseSchema,
  ReadingPart2EvaluateResponseSchema,
  ReadingPart3ResponseSchema,
  ReadingPart3EvaluateResponseSchema,
  ReadingPart4ResponseSchema,
  ReadingPart4EvaluateResponseSchema,
} from "@/lib/schemas/reading"

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
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  // Add cache bust to prevent browser/Next.js caching
  params._t = Date.now()
  
  const { data } = await apiClient.get<ReadingPart1QuestionResponse>(
    ENDPOINTS.reading.part(1).question,
    { params }
  )
  
  // Validate response
  return validateData(ReadingPart1ResponseSchema, data, 'Reading Part 1 Question')
}

// ── Part 2 ──────────────────────────────────────────────────────────────────

export interface ReadingPart2AnswerOption {
  id: number
  text: string
}

export interface ReadingPart2Set {
  title: string | null
  instruction: string | null
  questions: ReadingPart2AnswerOption[]  // A-J (10 ta questions)
  answers: ReadingPart2AnswerOption[]    // 1-8 (8 ta passages)
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
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  // Add cache bust to prevent browser/Next.js caching
  params._t = Date.now()
  
  const { data } = await apiClient.get<ReadingPart2QuestionResponse>(
    ENDPOINTS.reading.part(2).question,
    { params }
  )
  
  // Validate response
  return validateData(ReadingPart2ResponseSchema, data, 'Reading Part 2 Question')
}

export async function evaluateReadingPart2(
  payload: ReadingPart2EvaluateRequest
): Promise<ReadingPart2EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart2EvaluateResponse>(
    ENDPOINTS.reading.part(2).evaluate,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart2EvaluateResponseSchema, data, 'Reading Part 2 Evaluate')
}

// ── Part 3 ──────────────────────────────────────────────────────────────────

export interface ReadingPart3AnswerOption {
  id: number
  text: string
}

export interface ReadingPart3Set {
  title: string | null
  instruction: string | null
  text: string | null
  questions: ReadingPart3AnswerOption[]  // 6 ta paragraphs
  answers: ReadingPart3AnswerOption[]    // 8 ta headings
}

export interface ReadingPart3QuestionResponse {
  exam_id: number
  part: number
  set: ReadingPart3Set
}

export interface ReadingPart3Match {
  question_id: number
  answer_question_id: number
}

export interface ReadingPart3EvaluateRequest {
  exam_id: number
  matches: ReadingPart3Match[]
}

export interface ReadingPart3DetailItem {
  question_id: number
  answer_question_id: number
  correct: boolean
}

export interface ReadingPart3EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ReadingPart3DetailItem[]
}

export async function getReadingPart3Question(
  examId?: number
): Promise<ReadingPart3QuestionResponse> {
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  // Add cache bust to prevent browser/Next.js caching
  params._t = Date.now()
  
  const { data } = await apiClient.get<ReadingPart3QuestionResponse>(
    ENDPOINTS.reading.part(3).question,
    { params }
  )
  
  // Validate response
  return validateData(ReadingPart3ResponseSchema, data, 'Reading Part 3 Question')
}

export async function evaluateReadingPart3(
  payload: ReadingPart3EvaluateRequest
): Promise<ReadingPart3EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart3EvaluateResponse>(
    ENDPOINTS.reading.part(3).evaluate,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart3EvaluateResponseSchema, data, 'Reading Part 3 Evaluate')
}

// ── Part 1 evaluate ─────────────────────────────────────────────────────────

export async function evaluateReadingPart1(
  payload: ReadingPart1EvaluateRequest
): Promise<ReadingPart1EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart1EvaluateResponse>(
    ENDPOINTS.reading.part(1).evaluate,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart1EvaluateResponseSchema, data, 'Reading Part 1 Evaluate')
}

// ── Part 4 ──────────────────────────────────────────────────────────────────

export interface ReadingPart4AnswerOption {
  id: number
  answer: string
}

export interface ReadingPart4QuestionItem {
  id: number
  question: string
  answers: ReadingPart4AnswerOption[]  // 4 ta (MCQ) yoki 3 ta (T/F/NG)
}

export interface ReadingPart4TextData {
  id: number
  title: string | null
  instruction: string | null
  text: string
  questions: ReadingPart4QuestionItem[]  // 9 ta (4 MCQ + 5 T/F/NG)
}

export interface ReadingPart4QuestionResponse {
  exam_id: number
  part: number
  text: ReadingPart4TextData
}

export interface ReadingPart4Answer {
  question_id: number
  answer_id: number
}

export interface ReadingPart4EvaluateRequest {
  exam_id: number
  answers: ReadingPart4Answer[]
}

export interface ReadingPart4DetailItem {
  question_id: number
  answer_id: number
  correct: boolean
  correct_answer: string  // To'g'ri javob matni
}

export interface ReadingPart4EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ReadingPart4DetailItem[]
}

export async function getReadingPart4Question(
  examId?: number
): Promise<ReadingPart4QuestionResponse> {
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  // Add cache bust to prevent browser/Next.js caching
  params._t = Date.now()
  
  const { data } = await apiClient.get<ReadingPart4QuestionResponse>(
    ENDPOINTS.reading.part(4).question,
    { params }
  )
  
  // Validate response
  return validateData(ReadingPart4ResponseSchema, data, 'Reading Part 4 Question')
}

export async function evaluateReadingPart4(
  payload: ReadingPart4EvaluateRequest
): Promise<ReadingPart4EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart4EvaluateResponse>(
    ENDPOINTS.reading.part(4).evaluate,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart4EvaluateResponseSchema, data, 'Reading Part 4 Evaluate')
}
