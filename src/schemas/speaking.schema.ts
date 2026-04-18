import { z } from "zod";

const cefrSchema = z.enum(["Below B1", "B1", "B2", "C1"]);

const bilingualSchema = z.object({
  uz: z.string(),
  en: z.string(),
});

export const speakingEvaluateResponseSchema = z.object({
  attempt_id: z.number(),
  speaking_result_id: z.number(),
  transcript: z.string().nullable().optional(),
  metrics: z.object({
    word_count: z.number(),
    pause_count: z.number(),
    duration_seconds: z.number().nullable(),
    speaking_speed_wpm: z.number().nullable(),
    filler_ratio: z.number(),
  }),
  result: z.object({
    part_type: z.string(),
    fluency: z.number().min(0).max(8),
    vocabulary: z.number().min(0).max(8),
    grammar: z.number().min(0).max(8),
    pronunciation: z.number().min(0).max(8),
    total_32: z.number().min(0).max(32),
    cefr: cefrSchema,
    feedback: z.object({
      strengths: bilingualSchema,
      weaknesses: bilingualSchema,
      improvements: bilingualSchema,
    }),
  }),
});

export type SpeakingEvaluateResponseSchema = z.infer<typeof speakingEvaluateResponseSchema>;

export const speakingQuestionSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  question: z.string().nullable(),
});

export const speakingPart1_1ResponseSchema = z.object({
  exam_id: z.number(),
  part_type: z.string(),
  questions: z.array(speakingQuestionSchema),
});

export type SpeakingPart1_1ResponseSchema = z.infer<typeof speakingPart1_1ResponseSchema>;
