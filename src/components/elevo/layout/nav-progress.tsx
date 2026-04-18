"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function NavProgress() {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef<number>(0)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const start = () => {
    const el = ref.current
    if (!el) return
    clearTimeout(timer.current)
    cancelAnimationFrame(raf.current)
    el.style.transition = "none"
    el.style.opacity = "1"
    el.style.width = "0%"
    raf.current = requestAnimationFrame(() => {
      el.style.transition = "width 1.8s cubic-bezier(0.1, 0.05, 0, 1)"
      el.style.width = "85%"
    })
  }

  const finish = () => {
    const el = ref.current
    if (!el) return
    clearTimeout(timer.current)
    cancelAnimationFrame(raf.current)
    el.style.transition = "width 0.12s ease-out, opacity 0.25s ease 0.15s"
    el.style.width = "100%"
    timer.current = setTimeout(() => {
      if (ref.current) ref.current.style.opacity = "0"
    }, 120)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]")
      if (!a?.href) return
      try {
        const url = new URL(a.href)
        if (url.origin === location.origin && url.pathname !== location.pathname) {
          start()
        }
      } catch {}
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  useEffect(() => {
    finish()
  }, [pathname])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: "0",
        opacity: 0,
        zIndex: 9999,
        background: "var(--el-primary, #6366f1)",
        borderRadius: "0 1px 1px 0",
        pointerEvents: "none",
      }}
    />
  )
}
