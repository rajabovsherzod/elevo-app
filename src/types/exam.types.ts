import type { CefrLevel } from "./api.types";

export interface Exam {
  id: number;
  title: string;
  description: string;
}

export interface UserAttempt {
  id: number;
  exam: number;
  section: "SPEAKING" | "WRITING" | "READING" | "LISTENING";
  cefr_level: CefrLevel | null;
  final_result: number;
  created_at: string;
}
