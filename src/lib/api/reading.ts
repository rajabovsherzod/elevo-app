import { apiClient } from "./client"
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
  ReadingPart5NewResponseSchema,
  ReadingPart5NewEvaluateResponseSchema,
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
  question_id: number  // New: question ID for evaluation
  title: string | null
  instruction: string | null
  text: string
  positions: number[]
  // Computed property for backward compatibility
  question?: ReadingPart1Question
}

export interface ReadingPart1Answer {
  question_id: number
  position: number
  answer: string
}

export interface ReadingPart1EvaluateRequest {
  exam_id: number
  question_id: number  // New: required for new API
  answers: Record<string, string>  // New format: {"1": "answer", "2": "answer"}
}

export interface ReadingPart1AnswerDetail {
  question_id: number
  position: number
  user_answer: string
  correct_answer: string | null
  correct: boolean
  explanation_uz?: string | null
  explanation_en?: string | null
}

export interface ReadingPart1ResultItem {
  is_correct: boolean
  user_answer: string
  correct_answer: string
  explanation_uz?: string | null
  explanation_en?: string | null
}

export interface ReadingPart1EvaluateResponse {
  question: {
    id: number
    title: string
    instruction: string
    text: string
  }
  results: Record<string, ReadingPart1ResultItem>  // {"1": {...}, "2": {...}}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
  // Computed properties for backward compatibility
  correct_count?: number
  total_questions?: number
  score_percent?: number
  details?: ReadingPart1AnswerDetail[]
}

export async function getReadingPart1Question(
  examId: number = 1
): Promise<ReadingPart1QuestionResponse> {
  // New API: GET /api/multilevel/{exam_id}/reading/part1/question/
  const url = `/api/multilevel/${examId}/reading/part1/question/`
  
  const { data } = await apiClient.get<ReadingPart1QuestionResponse>(url)
  
  // Transform flat response to nested structure for backward compatibility
  const transformed: ReadingPart1QuestionResponse = {
    ...data,
    question: {
      id: data.question_id,
      title: data.title,
      instruction: data.instruction,
      text: data.text,
      positions: data.positions,
    }
  }
  
  return transformed
}

// ── Part 2 ──────────────────────────────────────────────────────────────────

// New simplified API format (like Part 1)
export interface ReadingPart2Passage {
  position: number
  text: string
}

export interface ReadingPart2Heading {
  letter: string  // A, B, C, ...
  text: string
}

export interface ReadingPart2QuestionResponse {
  exam_id: number
  part: number
  set_id: number  // Part container ID
  title: string
  instruction: string
  passages: ReadingPart2Passage[]  // 8 passages (positions 1-8)
  headings: ReadingPart2Heading[]  // 10 headings (letters A-J)
}

export interface ReadingPart2EvaluateRequest {
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
}

export interface ReadingPart2ResultDetail {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ReadingPart2EvaluateResponse {
  set: {
    title: string
    instruction: string
    passages: ReadingPart2Passage[]
    headings: ReadingPart2Heading[]
  }
  results: Record<string, ReadingPart2ResultDetail>  // {"1": {...}, "2": {...}}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export async function getReadingPart2Question(
  examId: number
): Promise<ReadingPart2QuestionResponse> {
  const { data } = await apiClient.get<ReadingPart2QuestionResponse>(
    `/api/multilevel/${examId}/reading/part2/question/`
  )
  
  // Validate response
  return validateData(ReadingPart2ResponseSchema, data, 'Reading Part 2 Question')
}

export async function evaluateReadingPart2(
  examId: number,
  setId: number,
  payload: ReadingPart2EvaluateRequest
): Promise<ReadingPart2EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart2EvaluateResponse>(
    `/api/multilevel/${examId}/reading/part2/${setId}/evaluate/`,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart2EvaluateResponseSchema, data, 'Reading Part 2 Evaluate')
}

// ── Part 3 ──────────────────────────────────────────────────────────────────

// New simplified API format (like Part 2, but 8 headings A-H and 6 paragraphs 1-6)
export interface ReadingPart3Paragraph {
  position: number
  text: string
}

export interface ReadingPart3Heading {
  letter: string  // A, B, C, D, E, F, G, H
  text: string
}

export interface ReadingPart3QuestionResponse {
  exam_id: number
  part: number
  set_id: number  // Part container ID
  title: string
  instruction: string
  paragraphs: ReadingPart3Paragraph[]  // 6 paragraphs (positions 1-6)
  headings: ReadingPart3Heading[]  // 8 headings (letters A-H)
}

export interface ReadingPart3EvaluateRequest {
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
}

export interface ReadingPart3ResultDetail {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ReadingPart3EvaluateResponse {
  set: {
    title: string
    instruction: string
    paragraphs: ReadingPart3Paragraph[]
    headings: ReadingPart3Heading[]
  }
  results: Record<string, ReadingPart3ResultDetail>  // {"1": {...}, "2": {...}}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export async function getReadingPart3Question(
  examId: number
): Promise<ReadingPart3QuestionResponse> {
  const { data } = await apiClient.get<ReadingPart3QuestionResponse>(
    `/api/multilevel/${examId}/reading/part3/question/`
  )
  
  // Validate response
  return validateData(ReadingPart3ResponseSchema, data, 'Reading Part 3 Question')
}

export async function evaluateReadingPart3(
  examId: number,
  setId: number,
  payload: ReadingPart3EvaluateRequest
): Promise<ReadingPart3EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart3EvaluateResponse>(
    `/api/multilevel/${examId}/reading/part3/${setId}/evaluate/`,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart3EvaluateResponseSchema, data, 'Reading Part 3 Evaluate')
}

// ── Part 1 evaluate ─────────────────────────────────────────────────────────

export async function evaluateReadingPart1(
  payload: ReadingPart1EvaluateRequest
): Promise<ReadingPart1EvaluateResponse> {
  // New API: POST /api/multilevel/{exam_id}/reading/part1/{question_id}/evaluate/
  const url = `/api/multilevel/${payload.exam_id}/reading/part1/${payload.question_id}/evaluate/`
  
  // Send simple format: {"answers": {"1": "text", "2": "text"}}
  const { data } = await apiClient.post<ReadingPart1EvaluateResponse>(url, {
    answers: payload.answers
  })
  
  // Transform new response to old format for backward compatibility
  const details: ReadingPart1AnswerDetail[] = Object.entries(data.results).map(([pos, result]) => ({
    question_id: data.question.id,
    position: parseInt(pos),
    user_answer: result.user_answer,
    correct_answer: result.correct_answer,
    correct: result.is_correct,
    explanation_uz: result.explanation_uz,
    explanation_en: result.explanation_en,
  }))
  
  const transformed: ReadingPart1EvaluateResponse = {
    ...data,
    correct_count: data.summary.correct_count,
    total_questions: data.summary.total,
    score_percent: data.summary.score_percent,
    details,
  }
  
  return transformed
}

// ── Part 4 ──────────────────────────────────────────────────────────────────

// New simplified API format (like Part 1/2/3)
export interface ReadingPart4Answer {
  letter: string  // A, B, C, D (MCQ) or A, B, C (T/F/NG)
  text: string
}

export interface ReadingPart4Question {
  position: number  // 1-9
  question: string
  answers: ReadingPart4Answer[]
}

export interface ReadingPart4QuestionResponse {
  exam_id: number
  part: number
  text_id: number  // Text ID for evaluation
  title: string
  instruction: string
  text: string
  questions: ReadingPart4Question[]  // 9 questions (4 MCQ + 5 T/F/NG)
}

export interface ReadingPart4EvaluateRequest {
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
}

export interface ReadingPart4ResultDetail {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ReadingPart4EvaluateResponse {
  text: {
    title: string
    instruction: string
    text: string
    questions: ReadingPart4Question[]
  }
  results: Record<string, ReadingPart4ResultDetail>  // {"1": {...}, "2": {...}}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export async function getReadingPart4Question(
  examId: number
): Promise<ReadingPart4QuestionResponse> {
  const { data } = await apiClient.get<ReadingPart4QuestionResponse>(
    `/api/multilevel/${examId}/reading/part4/question/`
  )
  
  // Validate response
  return validateData(ReadingPart4ResponseSchema, data, 'Reading Part 4 Question')
}

export async function evaluateReadingPart4(
  examId: number,
  textId: number,
  payload: ReadingPart4EvaluateRequest
): Promise<ReadingPart4EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart4EvaluateResponse>(
    `/api/multilevel/${examId}/reading/part4/${textId}/evaluate/`,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart4EvaluateResponseSchema, data, 'Reading Part 4 Evaluate')
}

// ── Part 5 ──────────────────────────────────────────────────────────────────

// New simplified API format (like Part 1-4)
// 6 questions total: 4 gap filling (text input) + 2 MCQ (A/B/C/D)
export interface ReadingPart5MCQAnswer {
  letter: string  // A, B, C, D
  text: string
}

export interface ReadingPart5MCQQuestion {
  position: number  // 5-6 (after gap filling)
  question: string
  answers: ReadingPart5MCQAnswer[]
}

export interface ReadingPart5QuestionResponse {
  exam_id: number
  part: number
  text_id: number  // Text ID for evaluation
  title: string
  instruction: string
  main_text: string  // Asosiy katta text (o'qish uchun)
  summary_text: string  // Gap filling text with __1__, __2__, __3__, __4__ or _1_, _2_, _3_, _4_
  gap_positions: number[]  // [1, 2, 3, 4]
  questions: ReadingPart5MCQQuestion[]  // 2 MCQ questions (positions 5-6)
}

export interface ReadingPart5EvaluateRequest {
  answers: Record<string, string>  // {"1": "text", "2": "text", "5": "A", "6": "B"}
}

export interface ReadingPart5ResultDetail {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ReadingPart5EvaluateResponse {
  text: {
    title: string
    instruction: string
    main_text: string  // Asosiy katta text
    summary_text: string  // Gap filling text
    gap_positions: number[]
    questions: ReadingPart5MCQQuestion[]
  }
  results: Record<string, ReadingPart5ResultDetail>  // {"1": {...}, "5": {...}}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export async function getReadingPart5Question(
  examId: number
): Promise<ReadingPart5QuestionResponse> {
  const { data } = await apiClient.get<ReadingPart5QuestionResponse>(
    `/api/multilevel/${examId}/reading/part5/question/`
  )
  
  // Validate response
  return validateData(ReadingPart5NewResponseSchema, data, 'Reading Part 5 Question')
}

export async function evaluateReadingPart5(
  examId: number,
  textId: number,
  payload: ReadingPart5EvaluateRequest
): Promise<ReadingPart5EvaluateResponse> {
  const { data } = await apiClient.post<ReadingPart5EvaluateResponse>(
    `/api/multilevel/${examId}/reading/part5/${textId}/evaluate/`,
    payload
  )
  
  // Validate response
  return validateData(ReadingPart5NewEvaluateResponseSchema, data, 'Reading Part 5 Evaluate')
}

// ══════════════════════════════════════════════════════════════════════════════
// READING FULL MOCK - PROFESSIONAL SIMPLE API
// ══════════════════════════════════════════════════════════════════════════════

export interface ReadingMockResourceIds {
  part1_question_id: number
  part2_set_id: number
  part3_set_id: number
  part4_text_id: number
  part5_text_id: number
}

export interface ReadingMockQuestionResponse {
  exam_id: number
  resource_ids: ReadingMockResourceIds
  part1: {
    global_start: number  // 1
    global_end: number    // 6
    title: string
    instruction: string
    text: string
    positions: number[]  // [1, 2, 3, 4, 5, 6]
  }
  part2: {
    global_start: number  // 7
    global_end: number    // 14
    title: string
    instruction: string
    passages: ReadingPart2Passage[]  // 8 passages
    headings: ReadingPart2Heading[]  // 10 headings
  }
  part3: {
    global_start: number  // 15
    global_end: number    // 20
    title: string
    instruction: string
    paragraphs: ReadingPart3Paragraph[]  // 6 paragraphs
    headings: ReadingPart3Heading[]  // 8 headings
  }
  part4: {
    global_start: number  // 21
    global_end: number    // 29
    title: string
    instruction: string
    text: string
    questions: ReadingPart4Question[]  // 9 questions
  }
  part5: {
    global_start: number  // 30
    global_end: number    // 35
    title: string
    instruction: string
    main_text: string
    summary_text: string
    gap_positions: number[]  // [1, 2, 3, 4]
    questions: ReadingPart5MCQQuestion[]  // 2 MCQ questions
  }
}

export interface ReadingMockEvaluateRequest {
  resource_ids: ReadingMockResourceIds
  answers: Record<string, string>  // {"1": "answer", "7": "A", "30": "text", "34": "A"}
}

export interface ReadingMockPartDetail {
  question?: any  // Part 1
  set?: any  // Part 2, 3
  text?: any  // Part 4, 5
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export interface ReadingMockEvaluateResponse {
  attempt_id: number
  overall_score_percent: number
  total_correct: number
  total_questions: number
  cefr_level: string
  // NEW: Global results (1-35) for answer cards
  results: Record<string, ReadingPart1ResultItem>  // {"1": {...}, "2": {...}, ..., "35": {...}}
  // NEW: Part details for accordion
  part_details: {
    part1?: ReadingMockPartDetail
    part2?: ReadingMockPartDetail
    part3?: ReadingMockPartDetail
    part4?: ReadingMockPartDetail
    part5?: ReadingMockPartDetail
  }
}

export async function getReadingMockQuestion(
  examId: number
): Promise<ReadingMockQuestionResponse> {
  const { data } = await apiClient.get<ReadingMockQuestionResponse>(
    `/api/multilevel/${examId}/reading/mock/`,
    {
      params: { _t: Date.now() }  // Cache busting
    }
  )
  
  return data
}

export async function evaluateReadingMock(
  examId: number,
  payload: ReadingMockEvaluateRequest
): Promise<ReadingMockEvaluateResponse> {
  const { data } = await apiClient.post<ReadingMockEvaluateResponse>(
    `/api/multilevel/${examId}/reading/mock/evaluate/`,
    payload
  )
  
  return data
}
