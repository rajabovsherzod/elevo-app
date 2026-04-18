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

// ─── Response: 401 da token yangilash ───────────────────────────────────────
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

    if (original.url?.includes("auth") || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

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
      const refresh = getRefreshToken();
      if (!refresh) throw new Error("No refresh token");

      const { data } = await axios.post(`${API_BASE}${ENDPOINTS.auth.refresh}`, {
        refresh,
      });

      setAccessToken(data.access);
      flushQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(original);
    } catch (err) {
      flushQueue(err, null);
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Token helpers (localStorage) ───────────────────────────────────────────
const ACCESS_KEY = "elevo_access";
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
