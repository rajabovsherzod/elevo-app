import { z } from 'zod'

/**
 * Reading Part 1 - Gap Filling Schemas
 */
export const ReadingPart1QuestionSchema = z.object({
  id: z.number().positive("Question ID musbat bo'lishi kerak"),
  title: z.string().nullable(),
  instruction: z.string().nullable(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak"),
  positions: z.array(z.number().positive()).min(1, "Kamida 1 ta gap bo'lishi kerak")
})

export const ReadingPart1ResponseSchema = z.object({
  exam_id: z.number().positive("Exam ID musbat bo'lishi kerak"),
  part: z.literal(1),
  question: ReadingPart1QuestionSchema
})

export const ReadingPart1AnswerDetailSchema = z.object({
  question_id: z.number(),
  position: z.number(),
  user_answer: z.string(),
  correct_answer: z.string().nullable(),
  correct: z.boolean()
})

export const ReadingPart1EvaluateResponseSchema = z.object({
  correct_count: z.number().min(0),
  total_questions: z.number().min(0),
  score_percent: z.number().min(0).max(100),
  details: z.array(ReadingPart1AnswerDetailSchema)
})

/**
 * Reading Part 2 - Matching Banners Schemas
 */
export const ReadingPart2AnswerOptionSchema = z.object({
  id: z.number().positive(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak")
})

export const ReadingPart2SetSchema = z.object({
  title: z.string().nullable(),
  instruction: z.string().nullable(),
  questions: z.array(ReadingPart2AnswerOptionSchema).min(1, "Kamida 1 ta question bo'lishi kerak"),
  answers: z.array(ReadingPart2AnswerOptionSchema).min(1, "Kamida 1 ta answer bo'lishi kerak")
})

export const ReadingPart2ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(2),
  set: ReadingPart2SetSchema
})

export const ReadingPart2DetailItemSchema = z.object({
  question_id: z.number(),
  answer_question_id: z.number(),
  correct: z.boolean(),
  correct_answer_id: z.number().nullable()
})

export const ReadingPart2EvaluateResponseSchema = z.object({
  correct_count: z.number().min(0),
  total_questions: z.number().min(0),
  score_percent: z.number().min(0).max(100),
  details: z.array(ReadingPart2DetailItemSchema)
})

/**
 * Reading Part 3 - Matching Headers Schemas
 */
export const ReadingPart3AnswerOptionSchema = z.object({
  id: z.number().positive(),
  text: z.string().min(1)
})

export const ReadingPart3SetSchema = z.object({
  title: z.string().nullable(),
  instruction: z.string().nullable(),
  text: z.string().nullable(),
  questions: z.array(ReadingPart3AnswerOptionSchema).min(1, "Kamida 1 ta paragraph bo'lishi kerak"),
  answers: z.array(ReadingPart3AnswerOptionSchema).min(1, "Kamida 1 ta heading bo'lishi kerak")
})

export const ReadingPart3ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(3),
  set: ReadingPart3SetSchema
})

export const ReadingPart3DetailItemSchema = z.object({
  question_id: z.number(),
  answer_question_id: z.number(),
  correct: z.boolean()
})

export const ReadingPart3EvaluateResponseSchema = z.object({
  correct_count: z.number().min(0),
  total_questions: z.number().min(0),
  score_percent: z.number().min(0).max(100),
  details: z.array(ReadingPart3DetailItemSchema)
})

/**
 * Reading Part 4 - Multiple Choice & T/F/NG Schemas
 */
export const ReadingPart4AnswerOptionSchema = z.object({
  id: z.number().positive(),
  answer: z.string().min(1)
})

export const ReadingPart4QuestionItemSchema = z.object({
  id: z.number().positive(),
  question: z.string().min(1),
  answers: z.array(ReadingPart4AnswerOptionSchema).min(3, "Kamida 3 ta javob bo'lishi kerak")
})

export const ReadingPart4TextDataSchema = z.object({
  id: z.number().positive(),
  title: z.string().nullable(),
  instruction: z.string().nullable(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak"),
  questions: z.array(ReadingPart4QuestionItemSchema).min(1, "Kamida 1 ta savol bo'lishi kerak")
})

export const ReadingPart4ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(4),
  text: ReadingPart4TextDataSchema
})

export const ReadingPart4DetailItemSchema = z.object({
  question_id: z.number(),
  answer_id: z.number(),
  correct: z.boolean(),
  correct_answer: z.string()
})

export const ReadingPart4EvaluateResponseSchema = z.object({
  correct_count: z.number().min(0),
  total_questions: z.number().min(0),
  score_percent: z.number().min(0).max(100),
  details: z.array(ReadingPart4DetailItemSchema)
})

/**
 * Type exports from schemas
 */
export type ReadingPart1Response = z.infer<typeof ReadingPart1ResponseSchema>
export type ReadingPart1Question = z.infer<typeof ReadingPart1QuestionSchema>
export type ReadingPart1EvaluateResponse = z.infer<typeof ReadingPart1EvaluateResponseSchema>

export type ReadingPart2Response = z.infer<typeof ReadingPart2ResponseSchema>
export type ReadingPart2Set = z.infer<typeof ReadingPart2SetSchema>
export type ReadingPart2EvaluateResponse = z.infer<typeof ReadingPart2EvaluateResponseSchema>

export type ReadingPart3Response = z.infer<typeof ReadingPart3ResponseSchema>
export type ReadingPart3Set = z.infer<typeof ReadingPart3SetSchema>
export type ReadingPart3EvaluateResponse = z.infer<typeof ReadingPart3EvaluateResponseSchema>

export type ReadingPart4Response = z.infer<typeof ReadingPart4ResponseSchema>
export type ReadingPart4TextData = z.infer<typeof ReadingPart4TextDataSchema>
export type ReadingPart4EvaluateResponse = z.infer<typeof ReadingPart4EvaluateResponseSchema>

/**
 * Reading Part 5 - Gap Filling + MCQ Schemas
 * Note: Part 5 has its own API file (reading-part5.ts)
 */
export const ReadingPart5GapFillingSchema = z.object({
  id: z.number().positive(),
  positions: z.array(z.number().positive()).min(1),
  answers: z.array(z.object({
    position: z.number(),
    answer: z.string()
  })).optional()
})

export const ReadingPart5AnswerOptionSchema = z.object({
  id: z.number().positive(),
  answer: z.string().min(1),
  is_correct: z.boolean()
})

export const ReadingPart5QuestionItemSchema = z.object({
  id: z.number().positive(),
  question: z.string().min(1),
  answers: z.array(ReadingPart5AnswerOptionSchema).min(2)
})

export const ReadingPart5TextDataSchema = z.object({
  id: z.number().positive(),
  title: z.string().nullable(),
  instruction: z.string().nullable(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak"),
  summary_text: z.string(), // Backend returns empty string if null
  gap_fillings: z.array(ReadingPart5GapFillingSchema).optional(),
  mcq_questions: z.array(ReadingPart5QuestionItemSchema).optional()
})

export const ReadingPart5ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(5),
  text: ReadingPart5TextDataSchema
})

export const ReadingPart5GapDetailSchema = z.object({
  gap_filling_id: z.number().optional(),
  position: z.number(),
  answer: z.string().optional(),
  user_answer: z.string().optional(),
  correct_answer: z.string().nullable().optional(),
  correct: z.boolean()
})

export const ReadingPart5QuestionDetailSchema = z.object({
  question_id: z.number(),
  answer_id: z.number(),
  correct: z.boolean(),
  correct_answer: z.string().optional()
})

export const ReadingPart5EvaluateResponseSchema = z.object({
  correct_count: z.number().min(0),
  total_questions: z.number().min(0),
  score_percent: z.number().min(0).max(100),
  details: z.object({
    gap_filling: z.array(ReadingPart5GapDetailSchema),
    questions: z.array(ReadingPart5QuestionDetailSchema)
  })
})

export type ReadingPart5Response = z.infer<typeof ReadingPart5ResponseSchema>
export type ReadingPart5TextData = z.infer<typeof ReadingPart5TextDataSchema>
export type ReadingPart5EvaluateResponse = z.infer<typeof ReadingPart5EvaluateResponseSchema>
