"use client"

import { useState, useCallback, useLayoutEffect } from "react"
import { SplashScreen } from "@/components/elevo/splash/splash-screen"

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [splashVisible, setSplashVisible] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  // Runs BEFORE browser paint. Bottom-up order: not-found.tsx sets flag first.
  useLayoutEffect(() => {
    const hasShown = sessionStorage.getItem("elevo-splash-shown")
    const isNotFound = (window as any).__ELEVO_NOT_FOUND__ === true

    if (isNotFound) {
      sessionStorage.setItem("elevo-splash-shown", "true")
      setSplashVisible(false)
      setContentVisible(true)
    } else if (hasShown) {
      setSplashVisible(false)
      setContentVisible(true)
    }
    // First-time valid visit: splashVisible stays true, contentVisible stays false
  }, [])

  // Called when splash exit animation STARTS → fade content in simultaneously
  const handleExit = useCallback(() => {
    sessionStorage.setItem("elevo-splash-shown", "true")
    setContentVisible(true)
  }, [])

  // Called when splash exit animation ENDS → remove splash from DOM
  const handleComplete = useCallback(() => setSplashVisible(false), [])

  return (
    <>
      {/* opacity:0 = content exists but is NOT painted. Server renders this hidden. */}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: contentVisible ? "opacity 350ms ease" : "none",
          willChange: contentVisible ? "auto" : "opacity",
        }}
      >
        {children}
      </div>

      {splashVisible && (
        <SplashScreen onExit={handleExit} onComplete={handleComplete} />
      )}
    </>
  )
}
