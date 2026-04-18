import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { 
  speakingEvaluateResponseSchema, 
  speakingPart1_1ResponseSchema,
  type SpeakingEvaluateResponseSchema,
  type SpeakingPart1_1ResponseSchema
} from "@/schemas/speaking.schema";
import type { SpeakingEvaluateRequest } from "@/types/speaking.types";

export const speakingService = {
  getPart1_1Questions: async (examId?: number): Promise<SpeakingPart1_1ResponseSchema> => {
    const params = examId ? { exam_id: examId } : undefined;
    const { data } = await apiClient.get(ENDPOINTS.speaking.part1_1.question, { params });
    return speakingPart1_1ResponseSchema.parse(data);
  },

  evaluate: async (payload: SpeakingEvaluateRequest): Promise<SpeakingEvaluateResponseSchema> => {
    const form = new FormData();
    form.append("part_id", String(payload.part_id));
    form.append("exam_id", String(payload.exam_id));
    form.append("part_type", payload.part_type);

    if (payload.audio) {
      if (payload.audio instanceof Blob && !(payload.audio instanceof File)) {
        form.append("audio", payload.audio, "audio.webm");
      } else {
        form.append("audio", payload.audio);
      }
    }
    if (payload.transcript) form.append("transcript", payload.transcript);
    if (payload.image_context) form.append("image_context", payload.image_context);

    const { data } = await apiClient.post(ENDPOINTS.speaking.evaluate, form, {
      timeout: 60_000, // AI call uzoq ketishi mumkin
    });

    return speakingEvaluateResponseSchema.parse(data);
  },
};
