export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type CefrLevel = "Below B1" | "B1" | "B2" | "C1";
