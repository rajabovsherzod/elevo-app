import { apiClient } from "@/lib/api/client"
import { ENDPOINTS } from "@/lib/api/endpoints"

export type WritingTaskType = "TASK1_1" | "TASK1_2" | "TASK2"
export type WritingCefr = "B1_Below" | "B1" | "B2" | "C1"

export interface WritingTaskResponse {
  exam_id: number
  task_id: number
  task_type: WritingTaskType
  title: string
  instruction: string
}

export interface WritingEvaluatePayload {
  task_id: number
  exam_id: number
  task_type: WritingTaskType
  student_text: string
}

export interface WritingBilingual {
  uz: string
  en: string
}

export interface WritingResult {
  is_off_topic: boolean
  task_type: string
  topic: string
  task_achievement: number
  coherence: number
  vocabulary: number
  grammar: number
  total_36: number
  total_75: number
  cefr: WritingCefr
  feedback: {
    strengths: WritingBilingual
    weaknesses: WritingBilingual
    improvements: WritingBilingual
  }
}

export interface WritingEvaluateResponse {
  attempt_id: number
  writing_result_id: number
  result: WritingResult
}

export async function getWritingTask(
  examId: number,
  taskType: WritingTaskType,
): Promise<WritingTaskResponse> {
  const { data } = await apiClient.get(ENDPOINTS.writing.task(examId, taskType))
  return data
}

export async function evaluateWriting(
  payload: WritingEvaluatePayload,
): Promise<WritingEvaluateResponse> {
  const { data } = await apiClient.post(ENDPOINTS.writing.evaluate, payload)
  return data
}
