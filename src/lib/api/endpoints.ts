export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const ENDPOINTS = {
  auth: {
    telegram: "/api/telegram/auth/",
    google: "/api/auth/google/",
    refresh: "/api/auth/token/refresh/",
    me: "/api/auth/me/",
  },
  speaking: {
    evaluate: "/api/multilevel/speaking/evaluate/",
    part1_1: {
      question: "/api/multilevel/speaking/part1_1/question/",
    },
  },
  writing: {
    evaluate: "/api/multilevel/writing/evaluate/",
  },
  reading: {
    part: (n: 1 | 2 | 3 | 4 | 5) => ({
      question: `/api/multilevel/reading/part${n}/question/`,
      evaluate: `/api/multilevel/reading/part${n}/evaluate/`,
    }),
    all: {
      question: "/api/multilevel/reading/all/question/",
      evaluate: "/api/multilevel/reading/all/evaluate/",
    },
  },
  listening: {
    part: (n: 1 | 2 | 3 | 4 | 5 | 6) => ({
      question: `/api/multilevel/listening/part${n}/question/`,
      evaluate: `/api/multilevel/listening/part${n}/evaluate/`,
    }),
    all: {
      question: "/api/multilevel/listening/all/question/",
      evaluate: "/api/multilevel/listening/all/evaluate/",
    },
  },
  exams: {
    list: "/api/exams/",
  },
} as const;
