import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  WritingEvaluateRequest,
  WritingEvaluateResponse,
} from "@/types/writing.types";

export const writingService = {
  evaluate: async (payload: WritingEvaluateRequest): Promise<WritingEvaluateResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.writing.evaluate, payload);
    return data as WritingEvaluateResponse;
  },
};
