"use client"

import { useState, useCallback } from "react"
import { SplashScreen } from "@/components/elevo/splash/splash-screen"

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [splashVisible, setSplashVisible] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  // useCallback — stable refs so SplashScreen's useEffect never re-runs
  const handleExit = useCallback(() => setContentVisible(true), [])
  const handleComplete = useCallback(() => setSplashVisible(false), [])

  return (
    <>
      {/* opacity:0 until splash starts its exit — auth/data fetching runs normally */}
      <div style={{
        opacity: contentVisible ? 1 : 0,
        transition: contentVisible ? `opacity ${350}ms ease` : "none",
      }}>
        {children}
      </div>
      {splashVisible && (
        <SplashScreen onExit={handleExit} onComplete={handleComplete} />
      )}
    </>
  )
}
