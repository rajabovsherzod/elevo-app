import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens } from "@/lib/api/client";
import type { AuthUser, TelegramAuthResponse } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (response: TelegramAuthResponse) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (response) => {
        setTokens(response.access, response.refresh);
        set({ user: response.user, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "elevo-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
