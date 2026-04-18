import type { CefrLevel } from "./api.types";

export type SpeakingPartType = "PART_1_1" | "PART_1_2" | "PART_2" | "PART_3";

export interface SpeakingEvaluateRequest {
  part_id: number;
  exam_id: number;
  part_type: SpeakingPartType | string;
  audio?: File | Blob;
  transcript?: string;
  image_context?: string;
}

export interface SpeakingMetrics {
  word_count: number;
  pause_count: number;
  duration_seconds: number | null;
  speaking_speed_wpm: number | null;
  filler_ratio: number;
}

export interface SpeakingFeedback {
  strengths: { uz: string; en: string };
  weaknesses: { uz: string; en: string };
  improvements: { uz: string; en: string };
}

export interface SpeakingResult {
  part_type: SpeakingPartType;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  total_32: number;
  cefr: CefrLevel;
  feedback: SpeakingFeedback;
}

export interface SpeakingEvaluateResponse {
  attempt_id: number;
  speaking_result_id: number;
  metrics: SpeakingMetrics;
  result: SpeakingResult;
}
