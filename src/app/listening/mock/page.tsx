"use client"

import { useState, useEffect } from "react"
import { ListeningMockContent } from "@/components/elevo/listening/mock/listening-mock-content"

// CRITICAL: Global audio cleanup function
const stopAllAudios = () => {
  // 1. Cancel audio sequence callbacks
  if (typeof window !== 'undefined' && (window as any).__listeningMockCancelSequence) {
    (window as any).__listeningMockCancelSequence()
    delete (window as any).__listeningMockCancelSequence
  }
  
  // 2. Stop all audio elements
  if (typeof window !== 'undefined') {
    const allAudios = document.querySelectorAll('audio')
    allAudios.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
        audio.src = ""
        audio.remove() // DOM dan ham olib tashlash
      } catch (e) {
        // Ignore errors
      }
    })
  }
}

export default function ListeningMockPage() {
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    // Force remount on page load
    setMountKey((prev) => prev + 1)
    
    // CRITICAL: Listen for browser back/forward navigation
    const handlePopState = () => {
      stopAllAudios()
    }
    
    // CRITICAL: Listen for page visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab - stop audio
        stopAllAudios()
      }
    }
    
    // CRITICAL: Listen for beforeunload (page close/refresh)
    const handleBeforeUnload = () => {
      stopAllAudios()
    }
    
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Final cleanup when page unmounts
      stopAllAudios()
    }
  }, [])

  return (
    <div className="flex flex-col gap-5 pb-6">
      <ListeningMockContent key={mountKey} />
    </div>
  )
}
