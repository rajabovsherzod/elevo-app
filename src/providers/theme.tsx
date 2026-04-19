"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
interface ThemeCtx { theme: Theme; setTheme: (t: Theme) => void }

const Ctx = createContext<ThemeCtx>({ theme: "dark", setTheme: () => {} });

export function Theme({ children }: { children: React.ReactNode }) {
  const [theme, set] = useState<Theme>("dark");

  // Read current theme from <html> class (set by inline script in <head>)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark-mode");
    set(isDark ? "dark" : "light");
  }, []);

  const setTheme = (t: Theme) => {
    set(t);
    const cls = document.documentElement.classList;
    cls.remove("dark-mode", "light-mode");
    cls.add(t === "dark" ? "dark-mode" : "light-mode");
    try { localStorage.setItem("elevo-theme", t); } catch {}
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
