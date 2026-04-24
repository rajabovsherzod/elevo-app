import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"

// ── Part 1 Types ─────────────────────────────────────────────────────────────

export interface ListeningPart1AnswerOption {
  id: number
  position: number
  answer: string
}

export interface ListeningPart1Question {
  id: number
  title: string | null
  instruction: string | null
  question: string | null
  audio_url: string | null
  answers: ListeningPart1AnswerOption[]
}

export interface ListeningPart1QuestionsResponse {
  exam_id: number
  part: number
  question: ListeningPart1Question | ListeningPart1Question[]
}

export interface ListeningPart1SubmitAnswer {
  question_id: number
  answer_id: number
}

export interface ListeningPart1EvaluateRequest {
  exam_id: number
  answers: ListeningPart1SubmitAnswer[]
}

export interface ListeningPart1AnswerDetail {
  question_id: number
  answer_id: number
  correct: boolean
  user_answer_text: string | null
  correct_answer_id: number | null
  correct_answer_text: string | null
}

export interface ListeningPart1EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart1AnswerDetail[]
}

// ── Part 2 Types ──────────────────────────────────────────────────────────────

export interface ListeningPart2Question {
  id: number
  title: string | null
  instruction: string | null
  text: string | null
  positions: number[]
  audio_url: string | null
}

export interface ListeningPart2QuestionsResponse {
  exam_id: number
  part: number
  question: ListeningPart2Question
}

export interface ListeningPart2SubmitAnswer {
  question_id: number
  position: number
  answer: string
}

export interface ListeningPart2EvaluateRequest {
  exam_id: number
  answers: ListeningPart2SubmitAnswer[]
}

export interface ListeningPart2AnswerDetail {
  question_id: number
  position: number
  answer: string       // user's submitted answer
  correct: boolean
  correct_answer?: string | null  // backend may or may not return this
}

export interface ListeningPart2EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart2AnswerDetail[]
}

// ── Part 1 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart1Questions(
  examId?: number
): Promise<ListeningPart1QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  params._t = Date.now()
  
  const { data } = await apiClient.get<ListeningPart1QuestionsResponse>(
    ENDPOINTS.listening.part(1).question,
    { params }
  )
  return data
}

export async function evaluateListeningPart1(
  payload: ListeningPart1EvaluateRequest
): Promise<ListeningPart1EvaluateResponse> {
  const { data } = await apiClient.post<ListeningPart1EvaluateResponse>(
    ENDPOINTS.listening.part(1).evaluate,
    payload
  )
  return data
}

// ── Part 2 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart2Questions(
  examId?: number
): Promise<ListeningPart2QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  params._t = Date.now()

  const { data } = await apiClient.get<any>(
    ENDPOINTS.listening.part(2).question,
    { params }
  )

  // Normalize question — backend may use different field names
  const raw = data.question ?? data

  const rawText: string | null =
    raw.question    ??   // ← actual field name from backend
    raw.text        ?? raw.passage   ?? raw.body          ??
    raw.content     ?? raw.paragraph ?? raw.gap_text      ??
    raw.question_text ?? raw.transcript ?? null

  // Auto-extract positions from text if backend didn't send them
  const rawPositions: number[] = raw.positions ?? raw.gap_positions ?? raw.gaps ?? []
  const positions: number[] =
    rawPositions.length > 0
      ? rawPositions
      : rawText
        ? [...new Set([...(rawText.matchAll(/_{1,}(\d+)_{1,}/g))].map(m => parseInt(m[1])))]
        : []

  const q: ListeningPart2Question = {
    id:          raw.id ?? 0,
    title:       raw.title ?? null,
    instruction: raw.instruction ?? null,
    text:        rawText,
    positions,
    audio_url:   raw.audio_url ?? raw.audio ?? null,
  }

  return {
    exam_id: data.exam_id ?? raw.exam_id ?? 0,
    part:    data.part    ?? 2,
    question: q,
  }
}

export async function evaluateListeningPart2(
  payload: ListeningPart2EvaluateRequest
): Promise<ListeningPart2EvaluateResponse> {
  const { data } = await apiClient.post<any>(
    ENDPOINTS.listening.part(2).evaluate,
    payload
  )

  // Normalize details
  const rawDetails: any[] = data.details ?? []
  const details: ListeningPart2AnswerDetail[] = rawDetails.map(d => ({
    question_id:    d.question_id ?? 0,
    position:       d.position    ?? 0,
    answer:         d.answer      ?? d.user_answer ?? d.user_answer_text ?? "",
    correct:        d.correct     ?? d.is_correct  ?? false,
    correct_answer: d.correct_answer ?? d.correct_answer_text ?? d.right_answer ?? null,
  }))

  return {
    correct_count:   data.correct_count   ?? 0,
    total_questions: data.total_questions ?? details.length,
    score_percent:   data.score_percent   ?? 0,
    details,
  }
}

// ── Part 3 Types ──────────────────────────────────────────────────────────────

export interface ListeningPart3QuestionItem {
  id: number
  text: string
}

export interface ListeningPart3AnswerOption {
  id: number
  text: string
}

export interface ListeningPart3Set {
  title: string | null
  instruction: string | null
  audio_url: string | null
  questions: ListeningPart3QuestionItem[]  // includes "Main" + Speaker 1-5
  answers: ListeningPart3AnswerOption[]    // A-F options
}

export interface ListeningPart3QuestionsResponse {
  exam_id: number
  part: number
  set: ListeningPart3Set
}

export interface ListeningPart3SubmitMatch {
  question_id: number
  answer_question_id: number
}

export interface ListeningPart3EvaluateRequest {
  exam_id: number
  matches: ListeningPart3SubmitMatch[]
}

export interface ListeningPart3AnswerDetail {
  question_id: number
  answer_question_id: number
  correct: boolean
  correct_answer_id: number | null
}

export interface ListeningPart3EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart3AnswerDetail[]
}

// ── Part 4 Types ──────────────────────────────────────────────────────────────

export interface ListeningPart4FieldItem {
  id: number
  text: string  // "A", "B", "C" ... (map position letter)
}

export interface ListeningPart4PlaceOption {
  id: number
  text: string  // "Restaurant", "School" ...
}

export interface ListeningPart4Set {
  title: string | null
  instruction: string | null
  audio_url: string | null
  image_url: string | null
  questions: ListeningPart4FieldItem[]   // map field letters
  answers: ListeningPart4PlaceOption[]   // 5 place names
}

export interface ListeningPart4QuestionsResponse {
  exam_id: number
  part: number
  set: ListeningPart4Set
}

export interface ListeningPart4SubmitMatch {
  question_id: number         // place name id (from answers)
  answer_question_id: number  // field letter id (from questions)
}

export interface ListeningPart4EvaluateRequest {
  exam_id: number
  matches: ListeningPart4SubmitMatch[]
}

export interface ListeningPart4AnswerDetail {
  question_id: number
  answer_question_id: number
  correct: boolean
}

export interface ListeningPart4EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart4AnswerDetail[]
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

// ── Part 3 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart3Questions(
  examId?: number
): Promise<ListeningPart3QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  params._t = Date.now()

  const { data } = await apiClient.get<ListeningPart3QuestionsResponse>(
    ENDPOINTS.listening.part(3).question,
    { params }
  )
  return data
}

export async function evaluateListeningPart3(
  payload: ListeningPart3EvaluateRequest
): Promise<ListeningPart3EvaluateResponse> {
  const { data } = await apiClient.post<ListeningPart3EvaluateResponse>(
    ENDPOINTS.listening.part(3).evaluate,
    payload
  )
  return data
}
