"use client";

/**
 * TelegramAutoAuth — Telegram Mini App ichida ochilganda
 * avtomatik initData yuborib autentifikatsiya qiladi.
 *
 * Har ochilishda (mount) ishlaydi — isAuthenticated holatidan qat'i nazar.
 * Sababi: JWT token vaqti tugagan bo'lishi mumkin, lekin Telegram
 * initData har doim bor va uni orqali yangi token olinadi.
 */

import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import { useTelegramAuth } from "@/hooks/auth/use-telegram-auth";

export const TelegramAutoAuth = ({ children }: PropsWithChildren) => {
  const { mutate } = useTelegramAuth();
  const attempted = useRef(false);

  useEffect(() => {
    // Bir session ichida bir marta urinish yetarli
    if (attempted.current) return;

    let tries = 0;
    const interval = setInterval(() => {
      tries++;
      const tg = (window as any).Telegram?.WebApp;

      if (tg?.initData) {
        clearInterval(interval);
        attempted.current = true;
        // initData bilan yangi token olamiz — har doim yangi, hech qachon eskirmas
        mutate({ init_data: tg.initData });
      } else if (tries >= 15) {
        // 1.5 soniyada ham topilmasa — Telegram Mini App muhitida emasmiz
        clearInterval(interval);
        console.warn("Telegram WebApp topilmadi — dev muhitida ishlayapsiz.");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [mutate]);

  return <>{children}</>;
};
