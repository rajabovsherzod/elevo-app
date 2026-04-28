import { apiClient } from "./client"
import { ENDPOINTS } from "./endpoints"

// ── Full Mock Question Types ──────────────────────────────────────────────────
// Backend faqat exam audio yuboradi, intro/end audiolar frontend da hardcoded

export interface ListeningMockPart1Data {
  id: number
  title: string | null
  instruction: string | null
  question: string
  audio_url: string | null
  answers: {
    id: number
    position: number
    answer: string
    global_number: number
  }[]
}

export interface ListeningMockPart2Data {
  id: number
  title: string | null
  instruction: string | null
  question: string
  audio_url: string | null
  positions: {
    position: number
    global_number: number
  }[]
}

export interface ListeningMockPart3Data {
  title: string | null
  instruction: string | null
  audio_url: string | null
  questions: {
    id: number
    text: string
    global_number: number
  }[]
  answers: {
    id: number
    text: string
  }[]
}

export interface ListeningMockPart4Data {
  title: string | null
  instruction: string | null
  audio_url: string | null
  image_url: string | null
  questions: {
    id: number
    text: string
    global_number: number
  }[]
  answers: {
    id: number
    text: string
  }[]
}

export interface ListeningMockPart5Data {
  instruction: string | null
  extracts: {
    id: number
    extract: string
    title: string
    instruction: string | null
    audio_url: string | null
    questions: {
      id: number
      question: string
      global_number: number
      answers: {
        id: number
        answer: string
        is_correct: boolean
      }[]
    }[]
  }[]
}

export interface ListeningMockPart6Data {
  id: number
  title: string | null
  instruction: string | null
  question: string
  audio_url: string | null
  positions: {
    position: number
    global_number: number
  }[]
}

export interface ListeningFullMockQuestionsResponse {
  exam_id: number
  listening: {
    part1: ListeningMockPart1Data
    part2: ListeningMockPart2Data
    part3: ListeningMockPart3Data
    part4: ListeningMockPart4Data
    part5: ListeningMockPart5Data
    part6: ListeningMockPart6Data
  }
}

// ── Full Mock Evaluate Types ──────────────────────────────────────────────────

export interface ListeningFullMockPartResult {
  correct_count: number
  total_questions: number
  score_percent: number
  details: any[]
}

export interface ListeningFullMockEvaluateResponse {
  attempt_id: number
  overall_score_percent: number
  total_correct: number
  total_questions: number
  cefr_level: string
  parts: {
    part1?: ListeningFullMockPartResult
    part2?: ListeningFullMockPartResult
    part3?: ListeningFullMockPartResult
    part4?: ListeningFullMockPartResult
    part5?: ListeningFullMockPartResult
    part6?: ListeningFullMockPartResult
  }
}

// ── API Functions ─────────────────────────────────────────────────────────────

export interface ListeningFullMockEvaluatePayload {
  exam_id: number
  answers: {
    part1?: Record<string, { question_id: number; answer_id: number; global_number: number }>
    part2?: Record<string, { question_id: number; position: number; answer: string; global_number: number }>
    part3?: Record<string, { question_id: number; answer_question_id: number; global_number: number }>
    part4?: Record<string, { question_id: number; answer_question_id: number; global_number: number }>
    part5?: Record<string, { question_id: number; answer_id: number; global_number: number }>
    part6?: Record<string, { question_id: number; position: number; answer: string; global_number: number }>
  }
}

export async function getListeningFullMockQuestions(
  examId?: number
): Promise<ListeningFullMockQuestionsResponse> {
  const params: Record<string, any> = examId ? { exam_id: examId } : {}
  params._t = Date.now()

  try {
    const { data } = await apiClient.get<ListeningFullMockQuestionsResponse>(
      ENDPOINTS.listening.all.question,
      { params }
    )
    return data
  } catch (error: any) {
    console.error('❌ Listening Full Mock API Error:', {
      endpoint: ENDPOINTS.listening.all.question,
      params,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}

export async function evaluateListeningFullMock(
  payload: ListeningFullMockEvaluatePayload
): Promise<ListeningFullMockEvaluateResponse> {
  const { data } = await apiClient.post<ListeningFullMockEvaluateResponse>(
    ENDPOINTS.listening.all.evaluate,
    payload
  )
  return data
}
