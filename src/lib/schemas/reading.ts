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
 * Reading Part 2 - Matching Headings Schemas (New simplified format)
 */
export const ReadingPart2PassageSchema = z.object({
  position: z.number().positive(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak")
})

export const ReadingPart2HeadingSchema = z.object({
  letter: z.string().length(1, "Letter 1 ta harf bo'lishi kerak"),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak")
})

export const ReadingPart2ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(2),
  set_id: z.number().positive(),
  title: z.string(),
  instruction: z.string(),
  passages: z.array(ReadingPart2PassageSchema).min(1, "Kamida 1 ta passage bo'lishi kerak"),
  headings: z.array(ReadingPart2HeadingSchema).min(1, "Kamida 1 ta heading bo'lishi kerak")
})

export const ReadingPart2ResultDetailSchema = z.object({
  is_correct: z.boolean(),
  user_answer: z.string(),
  correct_answer: z.string()
})

export const ReadingPart2EvaluateResponseSchema = z.object({
  set: z.object({
    title: z.string(),
    instruction: z.string(),
    passages: z.array(ReadingPart2PassageSchema),
    headings: z.array(ReadingPart2HeadingSchema)
  }),
  results: z.record(z.string(), ReadingPart2ResultDetailSchema),
  summary: z.object({
    correct_count: z.number().min(0),
    total: z.number().min(0),
    score_percent: z.number().min(0).max(100)
  })
})

/**
 * Reading Part 3 - Matching Headers Schemas (New simplified format)
 */
export const ReadingPart3ParagraphSchema = z.object({
  position: z.number().positive(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak")
})

export const ReadingPart3HeadingSchema = z.object({
  letter: z.string().length(1, "Letter 1 ta harf bo'lishi kerak"),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak")
})

export const ReadingPart3ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(3),
  set_id: z.number().positive(),
  title: z.string(),
  instruction: z.string(),
  paragraphs: z.array(ReadingPart3ParagraphSchema).min(1, "Kamida 1 ta paragraph bo'lishi kerak"),
  headings: z.array(ReadingPart3HeadingSchema).min(1, "Kamida 1 ta heading bo'lishi kerak")
})

export const ReadingPart3ResultDetailSchema = z.object({
  is_correct: z.boolean(),
  user_answer: z.string(),
  correct_answer: z.string()
})

export const ReadingPart3EvaluateResponseSchema = z.object({
  set: z.object({
    title: z.string(),
    instruction: z.string(),
    paragraphs: z.array(ReadingPart3ParagraphSchema),
    headings: z.array(ReadingPart3HeadingSchema)
  }),
  results: z.record(z.string(), ReadingPart3ResultDetailSchema),
  summary: z.object({
    correct_count: z.number().min(0),
    total: z.number().min(0),
    score_percent: z.number().min(0).max(100)
  })
})

/**
 * Reading Part 4 - Multiple Choice & T/F/NG Schemas (New simplified format)
 */
export const ReadingPart4AnswerSchema = z.object({
  letter: z.string().length(1, "Letter 1 ta harf bo'lishi kerak"),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak")
})

export const ReadingPart4QuestionSchema = z.object({
  position: z.number().positive(),
  question: z.string().min(1, "Question bo'sh bo'lmasligi kerak"),
  answers: z.array(ReadingPart4AnswerSchema).min(3, "Kamida 3 ta javob bo'lishi kerak")
})

export const ReadingPart4ResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(4),
  text_id: z.number().positive(),
  title: z.string(),
  instruction: z.string(),
  text: z.string().min(1, "Text bo'sh bo'lmasligi kerak"),
  questions: z.array(ReadingPart4QuestionSchema).min(1, "Kamida 1 ta savol bo'lishi kerak")
})

export const ReadingPart4ResultDetailSchema = z.object({
  is_correct: z.boolean(),
  user_answer: z.string(),
  correct_answer: z.string()
})

export const ReadingPart4EvaluateResponseSchema = z.object({
  text: z.object({
    title: z.string(),
    instruction: z.string(),
    text: z.string(),
    questions: z.array(ReadingPart4QuestionSchema)
  }),
  results: z.record(z.string(), ReadingPart4ResultDetailSchema),
  summary: z.object({
    correct_count: z.number().min(0),
    total: z.number().min(0),
    score_percent: z.number().min(0).max(100)
  })
})

/**
 * Type exports from schemas
 */
export type ReadingPart1Response = z.infer<typeof ReadingPart1ResponseSchema>
export type ReadingPart1Question = z.infer<typeof ReadingPart1QuestionSchema>
export type ReadingPart1EvaluateResponse = z.infer<typeof ReadingPart1EvaluateResponseSchema>

export type ReadingPart2Response = z.infer<typeof ReadingPart2ResponseSchema>
export type ReadingPart2EvaluateResponse = z.infer<typeof ReadingPart2EvaluateResponseSchema>

export type ReadingPart3Response = z.infer<typeof ReadingPart3ResponseSchema>
export type ReadingPart3EvaluateResponse = z.infer<typeof ReadingPart3EvaluateResponseSchema>

export type ReadingPart4Response = z.infer<typeof ReadingPart4ResponseSchema>
export type ReadingPart4Question = z.infer<typeof ReadingPart4QuestionSchema>
export type ReadingPart4EvaluateResponse = z.infer<typeof ReadingPart4EvaluateResponseSchema>

/**
 * Reading Part 5 - Gap Filling + MCQ Schemas
 * New Simple API Format: 4 gap filling + 2 MCQ = 6 questions
 */

// New Simple API Schemas
export const ReadingPart5MCQAnswerSchema = z.object({
  letter: z.string().length(1),  // A, B, C, D
  text: z.string().min(1)
})

export const ReadingPart5MCQQuestionSchema = z.object({
  position: z.number().positive(),  // 5-6
  question: z.string().min(1),
  answers: z.array(ReadingPart5MCQAnswerSchema).length(4)  // Always 4 options
})

export const ReadingPart5NewResponseSchema = z.object({
  exam_id: z.number().positive(),
  part: z.literal(5),
  text_id: z.number().positive(),
  title: z.string(),
  instruction: z.string(),
  main_text: z.string().min(1),  // Asosiy katta text (o'qish uchun)
  summary_text: z.string().min(1),  // Gap filling text with __1__, __2__, etc.
  gap_positions: z.array(z.number().positive()).length(4),  // [1, 2, 3, 4]
  questions: z.array(ReadingPart5MCQQuestionSchema).length(2)  // 2 MCQ questions
})

export const ReadingPart5ResultDetailSchema = z.object({
  is_correct: z.boolean(),
  user_answer: z.string(),
  correct_answer: z.string()
})

export const ReadingPart5NewEvaluateResponseSchema = z.object({
  text: z.object({
    title: z.string(),
    instruction: z.string(),
    main_text: z.string(),  // Asosiy katta text
    summary_text: z.string(),  // Gap filling text
    gap_positions: z.array(z.number().positive()),
    questions: z.array(ReadingPart5MCQQuestionSchema)
  }),
  results: z.record(z.string(), ReadingPart5ResultDetailSchema),  // {"1": {...}, "5": {...}}
  summary: z.object({
    correct_count: z.number().min(0),
    total: z.number().min(0),
    score_percent: z.number().min(0).max(100)
  })
})

// Old API Schemas (kept for backward compatibility)
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

export const ReadingPart5ResponseSchema = ReadingPart5NewResponseSchema  // Use new schema

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

export const ReadingPart5EvaluateResponseSchema = ReadingPart5NewEvaluateResponseSchema  // Use new schema

export type ReadingPart5Response = z.infer<typeof ReadingPart5NewResponseSchema>
export type ReadingPart5TextData = z.infer<typeof ReadingPart5TextDataSchema>
export type ReadingPart5EvaluateResponse = z.infer<typeof ReadingPart5NewEvaluateResponseSchema>
