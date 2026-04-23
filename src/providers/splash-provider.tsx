"use client"

import { useState, useCallback, useEffect } from "react"
import { SplashScreen } from "@/components/elevo/splash/splash-screen"
import { usePathname } from "next/navigation"

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [splashVisible, setSplashVisible] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  // Check if splash already shown in this session
  useEffect(() => {
    const hasShown = sessionStorage.getItem("elevo-splash-shown")
    if (hasShown) {
      // Skip splash on subsequent navigations
      setSplashVisible(false)
      setContentVisible(true)
    }
  }, [])

  // When route changes, keep content visible, don't show splash again
  useEffect(() => {
    if (contentVisible) {
      setSplashVisible(false)
    }
  }, [pathname, contentVisible])

  // useCallback — stable refs so SplashScreen's useEffect never re-runs
  const handleExit = useCallback(() => {
    sessionStorage.setItem("elevo-splash-shown", "true")
    setContentVisible(true)
  }, [])
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
