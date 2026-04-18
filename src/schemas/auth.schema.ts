import { z } from "zod";

export const authUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  photo: z.string().nullable(),
  telegram_id: z.number().nullable(),
  telegram_username: z.string().nullable(),
  telegram_name: z.string().nullable(),
  telegram_phone: z.string().nullable(),
  role: z.enum(["ADMIN", "STUDENT"]).nullable(),
  status: z.enum(["NEW", "UNPAID", "PAID"]).nullable(),
});

export const telegramAuthResponseSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
  user: authUserSchema,
});

export type TelegramAuthResponseSchema = z.infer<typeof telegramAuthResponseSchema>;
