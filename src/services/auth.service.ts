import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { telegramAuthResponseSchema } from "@/schemas/auth.schema";
import type { AuthUser, TelegramAuthRequest, TelegramAuthResponse } from "@/types/auth.types";

export const authService = {
  telegramLogin: async (payload: TelegramAuthRequest): Promise<TelegramAuthResponse> => {
    const { data } = await apiClient.post(ENDPOINTS.auth.telegram, payload);
    return telegramAuthResponseSchema.parse(data);
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get(ENDPOINTS.auth.me);
    return data as AuthUser;
  },
};
