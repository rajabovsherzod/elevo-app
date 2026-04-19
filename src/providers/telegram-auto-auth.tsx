"use client";

/**
 * TelegramAutoAuth — Telegram Mini App ichida ochilganda
 * avtomatik initData yuborib autentifikatsiya qiladi.
 *
 * Flow:
 *   1. window.Telegram.WebApp mavjudligini tekshiradi
 *   2. initData ni oladi
 *   3. POST /api/telegram/auth/ ga yuboradi
 *   4. JWT tokens va user ma'lumotlarini Zustand store ga saqlaydi
 */

import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import { useTelegramAuth } from "@/hooks/auth/use-telegram-auth";
import { useAuthStore } from "@/store/auth.store";

export const TelegramAutoAuth = ({ children }: PropsWithChildren) => {
  const { mutate, isPending } = useTelegramAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const attempted = useRef(false);

useEffect(() => {
    if (isAuthenticated || attempted.current) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const tg = (window as any).Telegram?.WebApp;
      
      if (tg?.initData) {
        clearInterval(interval);
        attempted.current = true;
        console.log("🚀 Telegram WebApp topildi, initData yuborilmoqda...");
        mutate({ init_data: tg.initData });
      } else if (attempts >= 10) {
        // 1 soniyadan keyin ham topilmasa — Telegram ichida emasmiz
        clearInterval(interval);
        console.log("ℹ️ Telegram WebApp topilmadi yoki initData yo'q.");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isAuthenticated, mutate]);

  return <>{children}</>;
};
