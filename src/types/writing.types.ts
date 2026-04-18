import type { CefrLevel } from "./api.types";

export type WritingTaskType = "TASK1_1" | "TASK1_2" | "TASK2";

export interface WritingEvaluateRequest {
  task_id: number;
  exam_id: number;
  task_type: WritingTaskType;
  student_text: string;
}

export interface WritingResult {
  task_type: WritingTaskType;
  task_achievement: number;
  coherence_cohesion: number;
  vocabulary: number;
  grammar_accuracy: number;
  total_36: number;
  cefr: CefrLevel;
  feedback: {
    strengths: { uz: string; en: string };
    weaknesses: { uz: string; en: string };
    improvements: { uz: string; en: string };
  };
}

export interface WritingEvaluateResponse {
  attempt_id: number;
  writing_result_id: number;
  result: WritingResult;
}
