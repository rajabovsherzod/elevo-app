"use client"
import { useEffect } from "react"

export function BodyHydration() {
  useEffect(() => {
    document.body.classList.add("hydrated")
  }, [])
  return null
}
