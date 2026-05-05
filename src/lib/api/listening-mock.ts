import { apiClient } from "./client"

// ── Resource IDs ──────────────────────────────────────────────────────────────
export interface ListeningMockResourceIds {
  part1_question_id: number
  part2_question_id: number
  part3_question_id: number
  part4_question_id: number
  part5_question_id: number
  part6_question_id: number
}

// ── GET Question Response (Simple Structure) ─────────────────────────────────
export interface ListeningMockQuestionResponse {
  exam_id: number
  resource_ids: ListeningMockResourceIds
  part1: {
    global_start: number  // 1
    global_end: number    // 8
    title: string
    instruction: string
    question: string
    audio_url: string
    questions: Array<{
      position: number
      question: string
      answers: Array<{
        letter: string  // A, B, C, D
        text: string
      }>
    }>
  }
  part2: {
    global_start: number  // 9
    global_end: number    // 13
    title: string
    instruction: string
    question: string  // Text with _1_, _2_, etc.
    audio_url: string
    positions: number[]  // [1, 2, 3, 4, 5]
  }
  part3: {
    global_start: number  // 14
    global_end: number    // 18
    title: string
    instruction: string
    audio_url: string
    speakers: Array<{
      position: number
      text: string
    }>
    options: Array<{
      letter: string  // A, B, C, D, E, F
      text: string
    }>
  }
  part4: {
    global_start: number  // 19
    global_end: number    // 23
    title: string
    instruction: string
    audio_url: string
    map_image_url: string
    places: Array<{
      position: number
      text: string
    }>
    options_count: number  // 6, 7, or 8
  }
  part5: {
    global_start: number  // 24
    global_end: number    // 29
    title: string
    instruction: string
    audio_url: string
    extracts: Array<{
      extract_number: number
      audio_url: string
      questions: Array<{
        position: number
        question: string
        answers: Array<{
          letter: string  // A, B, C
          text: string
        }>
      }>
    }>
  }
  part6: {
    global_start: number  // 30
    global_end: number    // 35
    title: string
    instruction: string
    question: string  // Text with _1_, _2_, etc.
    audio_url: string
    positions: number[]  // [1, 2, 3, 4, 5, 6]
  }
}

// ── POST Evaluate Request (Simple Structure) ─────────────────────────────────
export interface ListeningMockEvaluateRequest {
  resource_ids: ListeningMockResourceIds
  answers: Record<string, string>  // {"1": "A", "2": "text", ..., "35": "text"}
}

// ── POST Evaluate Response (Simple Structure) ────────────────────────────────
export interface ListeningMockResultItem {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ListeningMockPartDetail {
  question?: {
    id: number
    title: string
    instruction: string
    audio_url: string
  }
  places?: Array<{
    position: number
    text: string
  }>
  extracts?: Array<{
    extract_number: number
    audio_url: string
    questions: Array<{
      position: number
      question: string
    }>
  }>
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export interface ListeningMockEvaluateResponse {
  attempt_id: number
  overall_score_percent: number
  total_correct: number
  total_questions: number
  cefr_level: string
  results: Record<string, ListeningMockResultItem>  // {"1": {...}, "2": {...}, ..., "35": {...}}
  part_details: {
    part1?: ListeningMockPartDetail
    part2?: ListeningMockPartDetail
    part3?: ListeningMockPartDetail
    part4?: ListeningMockPartDetail
    part5?: ListeningMockPartDetail
    part6?: ListeningMockPartDetail
  }
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function getListeningMockQuestion(): Promise<ListeningMockQuestionResponse> {
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || "1")
  
  try {
    const { data } = await apiClient.get<ListeningMockQuestionResponse>(
      `/api/multilevel/${examId}/listening/all/question/`,
      {
        params: { _t: Date.now() }  // Cache busting
      }
    )
    return data
  } catch (error: any) {
    console.error('❌ Listening Mock GET Error:', {
      endpoint: `/api/multilevel/${examId}/listening/all/question/`,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}

export async function evaluateListeningMock(
  payload: ListeningMockEvaluateRequest
): Promise<ListeningMockEvaluateResponse> {
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || "1")
  
  try {
    const { data } = await apiClient.post<ListeningMockEvaluateResponse>(
      `/api/multilevel/${examId}/listening/all/evaluate/`,
      payload
    )
    return data
  } catch (error: any) {
    console.error('❌ Listening Mock POST Error:', {
      endpoint: `/api/multilevel/${examId}/listening/all/evaluate/`,
      payload,
      error: error.response?.data || error.message,
      status: error.response?.status
    })
    throw error
  }
}
