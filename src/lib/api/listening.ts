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
  questions: ListeningPart1Question[]
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
}

export interface ListeningPart1EvaluateResponse {
  correct_count: number
  total_questions: number
  score_percent: number
  details: ListeningPart1AnswerDetail[]
}

// ── Part 1 API Functions ──────────────────────────────────────────────────────

export async function getListeningPart1Questions(
  examId?: number
): Promise<ListeningPart1QuestionsResponse> {
  const params: Record<string, unknown> = examId ? { exam_id: examId } : {}
  
  console.log('🔍 [LISTENING API] Fetching questions...')
  console.log('🔍 [LISTENING API] Endpoint:', ENDPOINTS.listening.part(1).question)
  console.log('🔍 [LISTENING API] Params:', params)
  
  try {
    const { data } = await apiClient.get<ListeningPart1QuestionsResponse>(
      ENDPOINTS.listening.part(1).question,
      { params }
    )
    console.log('✅ [LISTENING API] Success! Questions:', data.questions.length)
    return data
  } catch (error: any) {
    console.error('❌ [LISTENING API] FAILED!')
    console.error('❌ Error:', error.message)
    console.error('❌ Code:', error.code)
    if (error.response) {
      console.error('❌ Response:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('❌ No response - Network/CORS/Tunnel issue')
      console.error('❌ Request URL:', error.config?.baseURL + error.config?.url)
    }
    throw error
  }
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
