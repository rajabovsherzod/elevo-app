"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { TelegramAuthRequest } from "@/types/auth.types";

export const useTelegramAuth = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: TelegramAuthRequest) => authService.telegramLogin(payload),
    onSuccess: (data) => setAuth(data),
    onError: (err: any) => {
      console.error("Telegram Auth xatosi:", err.response?.data || err.message);
    }
  });
};
