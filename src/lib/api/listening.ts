import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"

// ── Part 1 Types (SIMPLE STRUCTURE) ──────────────────────────────────────────

export interface ListeningPart1AnswerOption {
  letter: string  // "A", "B", "C", "D"
  text: string
}

export interface ListeningPart1QuestionItem {
  position: number  // 1-8
  question: string
  answers: ListeningPart1AnswerOption[]
}

export interface ListeningPart1QuestionsResponse {
  exam_id: number
  part: number
  question_id: number
  title: string | null
  instruction: string | null
  question: string | null
  audio_url: string | null
  questions: ListeningPart1QuestionItem[]
}

export interface ListeningPart1EvaluateRequest {
  answers: Record<string, string>  // {"1": "A", "2": "B", ...}
}

export interface ListeningPart1ResultItem {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ListeningPart1EvaluateResponse {
  question: {
    id: number
    title: string | null
    instruction: string | null
    audio_url: string | null
  }
  results: Record<string, ListeningPart1ResultItem>  // {"1": {...}, "2": {...}, ...}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

// ── Part 2 Types (SIMPLE STRUCTURE) ──────────────────────────────────────────

export interface ListeningPart2QuestionsResponse {
  exam_id: number
  part: number
  question_id: number
  title: string | null
  instruction: string | null
  question: string | null  // Text with _1_, _2_, etc.
  audio_url: string | null
  positions: number[]  // [1, 2, 3, 4, 5]
}

export interface ListeningPart2EvaluateRequest {
  answers: Record<string, string>  // {"1": "Paris", "2": "Monday", ...}
}

export interface ListeningPart2ResultItem {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ListeningPart2EvaluateResponse {
  question: {
    id: number
    title: string | null
    instruction: string | null
    question: string | null  // Text with _1_, _2_, etc.
    audio_url: string | null
  }
  results: Record<string, ListeningPart2ResultItem>  // {"1": {...}, "2": {...}, ...}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

// ── Part 3 Types (SIMPLE STRUCTURE) ──────────────────────────────────────────

export interface ListeningPart3Speaker {
  position: number  // 1-5
  text: string
}

export interface ListeningPart3Option {
  letter: string  // "A", "B", "C", "D", "E", "F"
  text: string
}

export interface ListeningPart3QuestionsResponse {
  exam_id: number
  part: number
  question_id: number
  title: string | null
  instruction: string | null
  audio_url: string | null
  speakers: ListeningPart3Speaker[]  // 5 speakers
  options: ListeningPart3Option[]    // 6 options A-F
}

export interface ListeningPart3EvaluateRequest {
  answers: Record<string, string>  // {"1": "A", "2": "C", "3": "B", "4": "F", "5": "D"}
}

export interface ListeningPart3ResultItem {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ListeningPart3EvaluateResponse {
  question: {
    id: number
    title: string | null
    instruction: string | null
    audio_url: string | null
  }
  results: Record<string, ListeningPart3ResultItem>  // {"1": {...}, "2": {...}, ...}
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

// ── Part 3 Types (OLD COMPLEX STRUCTURE - for backward compatibility) ────────

export interface ListeningPart3QuestionItemOld {
  id: number
  text: string
}

export interface ListeningPart3AnswerOptionOld {
  id: number
  text: string
}

export interface ListeningPart3SetOld {
  title: string | null
  instruction: string | null
  audio_url: string | null
  questions: ListeningPart3QuestionItemOld[]
  answers: ListeningPart3AnswerOptionOld[]
}

export interface ListeningPart3QuestionsResponseOld {
  exam_id: number
  part: number
  set: ListeningPart3SetOld
}

export interface ListeningPart3SubmitMatchOld {
  question_id: number
  answer_question_id: number
}

export interface ListeningPart3EvaluateRequestOld {
  exam_id: number
  matches: ListeningPart3SubmitMatchOld[]
}

export interface ListeningPart3AnswerDetailOld {
  question_id: number
  answer_question_id: number
  correct: boolean
  correct_answer_id: number | null
}

export interface ListeningPart3EvaluateResponseOld {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart3AnswerDetailOld[]
}

// ── Part 4 Types ──────────────────────────────────────────────────────────────

export interface ListeningPart4FieldItem {
  id: number
  text: string
}

export interface ListeningPart4PlaceOption {
  id: number
  text: string
}

export interface ListeningPart4Set {
  title: string | null
  instruction: string | null
  audio_url: string | null
  image_url: string | null
  questions: ListeningPart4FieldItem[]
  answers: ListeningPart4PlaceOption[]
}

export interface ListeningPart4QuestionsResponse {
  exam_id: number
  part: number
  set: ListeningPart4Set
}

export interface ListeningPart4SubmitMatch {
  question_id: number
  answer_question_id: number
}

export interface ListeningPart4EvaluateRequest {
  exam_id: number
  matches: ListeningPart4SubmitMatch[]
}

export interface ListeningPart4AnswerDetail {
  question_id: number
  answer_question_id: number
  correct: boolean
  correct_answer_id?: number | null
  correct_answer?: string | null
}

export interface ListeningPart4EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart4AnswerDetail[]
}

// ── Part 1 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart1Questions(
  examId?: number
): Promise<ListeningPart1QuestionsResponse> {
  // For simple structure, we need exam_id in URL
  if (!examId) {
    // Get default exam_id from somewhere or throw error
    throw new Error("exam_id is required for Listening Part 1")
  }
  
  const params: Record<string, unknown> = {}
  params._t = Date.now()
  
  const { data } = await apiClient.get<ListeningPart1QuestionsResponse>(
    ENDPOINTS.listening.part1Simple.question(examId),
    { params }
  )
  return data
}

export async function evaluateListeningPart1(
  examId: number,
  questionId: number,
  payload: ListeningPart1EvaluateRequest
): Promise<ListeningPart1EvaluateResponse> {
  const { data } = await apiClient.post<ListeningPart1EvaluateResponse>(
    ENDPOINTS.listening.part1Simple.evaluate(examId, questionId),
    payload
  )
  return data
}

// ── Part 2 API Functions (SIMPLE STRUCTURE) ───────────────────────────────────

export async function getListeningPart2Questions(
  examId?: number
): Promise<ListeningPart2QuestionsResponse> {
  // For simple structure, we need exam_id in URL
  if (!examId) {
    // Get default exam_id from somewhere or throw error
    throw new Error("exam_id is required for Listening Part 2")
  }
  
  const params: Record<string, unknown> = {}
  params._t = Date.now()
  
  const { data } = await apiClient.get<ListeningPart2QuestionsResponse>(
    ENDPOINTS.listening.part2Simple.question(examId),
    { params }
  )
  return data
}

export async function evaluateListeningPart2(
  examId: number,
  questionId: number,
  payload: ListeningPart2EvaluateRequest
): Promise<ListeningPart2EvaluateResponse> {
  const { data } = await apiClient.post<ListeningPart2EvaluateResponse>(
    ENDPOINTS.listening.part2Simple.evaluate(examId, questionId),
    payload
  )
  return data
}

// ── Part 3 API Functions (SIMPLE STRUCTURE) ───────────────────────────────────

export async function getListeningPart3Questions(
  examId?: number
): Promise<ListeningPart3QuestionsResponse> {
  // For simple structure, we need exam_id in URL
  if (!examId) {
    throw new Error("exam_id is required for Listening Part 3")
  }
  
  const params: Record<string, unknown> = {}
  params._t = Date.now()
  
  const { data } = await apiClient.get<ListeningPart3QuestionsResponse>(
    ENDPOINTS.listening.part3Simple.question(examId),
    { params }
  )
  return data
}

export async function evaluateListeningPart3(
  examId: number,
  questionId: number,
  payload: ListeningPart3EvaluateRequest
): Promise<ListeningPart3EvaluateResponse> {
  const { data } = await apiClient.post<ListeningPart3EvaluateResponse>(
    ENDPOINTS.listening.part3Simple.evaluate(examId, questionId),
    payload
  )
  return data
}

// ── Part 3 API Functions (OLD - for backward compatibility) ───────────────────

// ── Part 5 Types ──────────────────────────────────────────────────────────────

export interface ListeningPart5AnswerOption {
  id: number
  answer: string
  is_correct: boolean
}

export interface ListeningPart5Question {
  id: number
  question: string
  answers: ListeningPart5AnswerOption[]
}

export interface ListeningPart5Extract {
  id: number
  extract: string
  title: string | null
  instruction: string | null
  audio_url: string | null
  questions: ListeningPart5Question[]
}

export interface ListeningPart5QuestionsResponse {
  exam_id: number
  part: number
  instruction: string | null
  audio_url: string | null
  extracts: ListeningPart5Extract[]
}

export interface ListeningPart5SubmitAnswer {
  question_id: number
  answer_id: number
}

export interface ListeningPart5EvaluateRequest {
  exam_id: number
  answers: ListeningPart5SubmitAnswer[]
}

export interface ListeningPart5AnswerDetail {
  question_id: number
  answer_id: number
  correct: boolean
  correct_answer_id: number | null
  correct_answer_text: string | null
}

export interface ListeningPart5EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart5AnswerDetail[]
}

// ── Part 4 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart4Questions(
  examId?: number
): Promise<ListeningPart4QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  params._t = Date.now()
  const { data } = await apiClient.get<ListeningPart4QuestionsResponse>(
    ENDPOINTS.listening.part(4).question,
    { params }
  )
  return data
}

export async function evaluateListeningPart4(
  payload: ListeningPart4EvaluateRequest
): Promise<ListeningPart4EvaluateResponse> {
  const { data } = await apiClient.post<ListeningPart4EvaluateResponse>(
    ENDPOINTS.listening.part(4).evaluate,
    payload
  )
  return data
}

// ── Part 5 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart5Questions(
  examId?: number
): Promise<ListeningPart5QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  params._t = Date.now()
  const { data } = await apiClient.get<any>(
    ENDPOINTS.listening.part(5).question,
    { params }
  )

  // Transform backend response to match frontend types
  const rawExtracts = data.extracts || []
  const extracts: ListeningPart5Extract[] = rawExtracts.map((ext: any, idx: number) => ({
    id: idx + 1,
    extract: ext.extract || `EXTRACT_${idx + 1}`,
    title: ext.extract || `Extract ${idx + 1}`,
    instruction: data.instruction || null,
    audio_url: data.audio_url || ext.audio_url || null,
    questions: (ext.questions || []).map((q: any) => ({
      id: q.id,
      question: q.question || q.text || '',
      answers: (q.answers || []).map((a: any) => ({
        id: a.id,
        answer: a.answer || a.text || '',
        is_correct: a.is_correct || false,
      })),
    })),
  }))

  return {
    exam_id: data.exam_id || 0,
    part: 5,
    instruction: data.instruction || null,
    audio_url: data.audio_url || null,
    extracts,
  }
}

export async function evaluateListeningPart5(
  payload: ListeningPart5EvaluateRequest
): Promise<ListeningPart5EvaluateResponse> {
  const { data } = await apiClient.post<any>(
    ENDPOINTS.listening.part(5).evaluate,
    payload
  )

  // Transform backend response
  const rawDetails: any[] = data.details || []
  const details: ListeningPart5AnswerDetail[] = rawDetails.map(d => ({
    question_id: d.question_id || 0,
    answer_id: d.answer_id || 0,
    correct: d.correct ?? d.is_correct ?? false,
    correct_answer_id: d.correct_answer_id ?? null,
    correct_answer_text: d.correct_answer_text ?? null,
  }))

  return {
    correct_count: data.correct_count ?? 0,
    total_questions: data.total_questions ?? details.length,
    score_percent: data.score_percent ?? 0,
    details,
  }
}

// ── Part 6 Types ──────────────────────────────────────────────────────────────

export interface ListeningPart6Question {
  id: number
  title: string | null
  instruction: string | null
  text: string | null
  positions: number[]
  audio_url: string | null
}

export interface ListeningPart6QuestionsResponse {
  exam_id: number
  part: number
  question: ListeningPart6Question
}

export interface ListeningPart6SubmitAnswer {
  question_id: number
  position: number
  answer: string
}

export interface ListeningPart6EvaluateRequest {
  exam_id: number
  answers: ListeningPart6SubmitAnswer[]
}

export interface ListeningPart6AnswerDetail {
  question_id: number
  position: number
  answer: string
  correct: boolean
  correct_answer?: string | null
}

export interface ListeningPart6EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart6AnswerDetail[]
}

// ── Part 6 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart6Questions(
  examId?: number
): Promise<ListeningPart6QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  params._t = Date.now()

  const { data } = await apiClient.get<any>(
    ENDPOINTS.listening.part(6).question,
    { params }
  )

  const raw = data.question ?? {}
  const rawPositions: any[] = Array.isArray(raw.positions)
    ? raw.positions
    : typeof raw.positions === "string"
      ? JSON.parse(raw.positions)
      : []

  const q: ListeningPart6Question = {
    id:          raw.id          ?? 0,
    title:       raw.title       ?? null,
    instruction: raw.instruction ?? null,
    text:        raw.question    ?? null,  // Backend uses 'question' field for text
    positions:   rawPositions,
    audio_url:   raw.audio_url   ?? null,
  }

  return {
    exam_id:  data.exam_id ?? 0,
    part:     data.part    ?? 6,
    question: q,
  }
}

export async function evaluateListeningPart6(
  payload: ListeningPart6EvaluateRequest
): Promise<ListeningPart6EvaluateResponse> {
  const { data } = await apiClient.post<any>(
    ENDPOINTS.listening.part(6).evaluate,
    payload
  )

  const rawDetails: any[] = data.details ?? []
  const details: ListeningPart6AnswerDetail[] = rawDetails.map(d => ({
    question_id:    d.question_id ?? 0,
    position:       d.position    ?? 0,
    answer:         d.answer      ?? "",
    correct:        d.correct     ?? d.is_correct ?? false,
    correct_answer: d.correct_answer ?? null,
  }))

  return {
    correct_count:   data.correct_count   ?? 0,
    total_questions: data.total_questions ?? details.length,
    score_percent:   data.score_percent   ?? 0,
    details,
  }
}
