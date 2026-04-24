import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE, ENDPOINTS } from "./endpoints";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ─── Request: access token qo'shish ─────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // FormData uchun Content-Type ni o'chiramiz — browser boundary bilan auto-set qiladi
  if (config.data instanceof FormData) {
    delete (config.headers as Record<string, unknown>)["Content-Type"];
  }

  return config;
});

// ─── Telegram initData bilan yangi token olish ────────────────────────────────
async function reAuthViaTelegram(): Promise<string | null> {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData;
    if (!initData) return null;

    const { data } = await axios.post(`${API_BASE}${ENDPOINTS.auth.telegram}`, {
      init_data: initData,
    });

    if (data?.access) {
      setTokens(data.access, data.refresh ?? getRefreshToken() ?? "");
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Refresh token bilan yangi token olish ────────────────────────────────────
async function reAuthViaRefresh(): Promise<string | null> {
  try {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    const { data } = await axios.post(`${API_BASE}${ENDPOINTS.auth.refresh}`, { refresh });

    if (data?.access) {
      setAccessToken(data.access);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Response: 401 da avtomatik qayta autentifikatsiya ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Auth endpointlarini, 401 bo'lmaganlarni va allaqachon retry qilinganlarni o'tkazib yuboramiz
    if (
      original.url?.includes("/auth/") ||
      error.response?.status !== 401 ||
      original._retry
    ) {
      return Promise.reject(error);
    }

    // Parallel so'rovlar bo'lsa — ularni navbatga qo'yamiz
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // 1-urinish: Telegram initData bilan qayta autentifikatsiya (asosiy yo'l)
      let newToken = await reAuthViaTelegram();

      // 2-urinish: refresh token bilan (zaxira yo'l)
      if (!newToken) {
        newToken = await reAuthViaRefresh();
      }

      if (!newToken) {
        // Ikkalasi ham ishlamadi — token tozalaymiz, so'rovni rad etamiz
        clearTokens();
        flushQueue(error, null);
        return Promise.reject(error);
      }

      flushQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Token helpers (localStorage) ───────────────────────────────────────────
const ACCESS_KEY  = "elevo_access";
const REFRESH_KEY = "elevo_refresh";

export const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;

export const getRefreshToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const setAccessToken = (access: string) =>
  localStorage.setItem(ACCESS_KEY, access);

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
