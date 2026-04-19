"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

const SHOW = 2300  // ms before exit animation starts
const EXIT = 350   // ms for fade-out
// onComplete fires at SHOW + EXIT

interface SplashScreenProps {
  onExit: () => void     // called when exit animation starts — provider fades content in
  onComplete: () => void // called when exit animation ends — provider removes splash
}

export function SplashScreen({ onExit, onComplete }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Empty deps — onExit/onComplete are stable useCallback refs from provider
    const t1 = setTimeout(() => { setExiting(true); onExit() }, SHOW)
    const t2 = setTimeout(onComplete, SHOW + EXIT)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden"
      initial={false}
      animate={exiting ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
      transition={{ duration: EXIT / 1000, ease: [0.4, 0, 1, 1] }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--el-primary) 12%, transparent) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
        }}
      />

      {/* Icon box fades + scales in, SVG paths draw themselves */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mb-9"
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 104,
            height: 104,
            borderRadius: 28,
            background: "color-mix(in srgb, var(--el-primary) 10%, transparent)",
            border: "1.5px solid color-mix(in srgb, var(--el-primary) 22%, transparent)",
            boxShadow: "0 20px 60px -12px color-mix(in srgb, var(--el-primary) 25%, transparent)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--el-primary)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Mortarboard top — draws first */}
            <motion.path
              d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* Tassel stick — draws second */}
            <motion.path
              d="M22 10v6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7, ease: "easeOut" }}
            />
            {/* Graduation arc — draws last */}
            <motion.path
              d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.85, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Brand name — slides up while last path finishes */}
      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-[52px] font-extrabold tracking-tight text-on-surface leading-none"
      >
        Elevo
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 1.45 }}
        className="mt-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-on-surface-variant"
      >
        Multilevel Practice
      </motion.p>

      {/* Bottom progress line — fills linearly until onComplete */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 overflow-hidden"
        style={{ width: 48, height: 2, borderRadius: 2, background: "color-mix(in srgb, var(--el-primary) 15%, transparent)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <motion.div
          className="h-full"
          style={{ background: "var(--el-primary)", borderRadius: 2 }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: (SHOW - 1400) / 1000, delay: 1.4, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  )
}
