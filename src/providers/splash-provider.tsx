"use client"

import { useState, useCallback, useLayoutEffect } from "react"
import { SplashScreen } from "@/components/elevo/splash/splash-screen"

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [splashVisible, setSplashVisible] = useState(false)

  // Bottom-up order: not-found.tsx sets __ELEVO_NOT_FOUND__ before this runs
  useLayoutEffect(() => {
    const hasShown = sessionStorage.getItem("elevo-splash-shown")
    const isNotFound = (window as any).__ELEVO_NOT_FOUND__ === true

    if (isNotFound) {
      sessionStorage.setItem("elevo-splash-shown", "true")
    } else if (!hasShown) {
      setSplashVisible(true)
    }
  }, [])

  const handleExit = useCallback(() => {
    sessionStorage.setItem("elevo-splash-shown", "true")
  }, [])

  const handleComplete = useCallback(() => setSplashVisible(false), [])

  return (
    <>
      {children}
      {splashVisible && (
        <SplashScreen onExit={handleExit} onComplete={handleComplete} />
      )}
    </>
  )
}
