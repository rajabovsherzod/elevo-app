export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface TelegramAuthRequest {
  init_data: string;
}

export interface TelegramAuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  photo: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  telegram_name: string | null;
  telegram_phone: string | null;
  role: "ADMIN" | "STUDENT" | null;
  status: "NEW" | "UNPAID" | "PAID" | null;
}

/** User'ning ko'rsatiladigan ismi — mavjud eng yaxshi variantni qaytaradi */
export function getDisplayName(user: AuthUser | null): string {
  if (!user) return "Foydalanuvchi";
  return user.full_name || user.telegram_name || user.username || "Foydalanuvchi";
}

/** Avatar uchun boshlang'ich harf */
export function getInitial(user: AuthUser | null): string {
  const name = getDisplayName(user);
  return name.charAt(0).toUpperCase();
}
