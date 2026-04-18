"use client";

import { useMutation } from "@tanstack/react-query";
import { speakingService } from "@/services/speaking.service";
import type { SpeakingEvaluateRequest } from "@/types/speaking.types";
// Return type is inferred from speakingService.evaluate → SpeakingEvaluateResponseSchema

export const useSpeakingEvaluate = () => {
  return useMutation({
    mutationFn: (payload: SpeakingEvaluateRequest) => speakingService.evaluate(payload),
  });
};
