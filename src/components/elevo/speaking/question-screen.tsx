"use client"

/* ═══════════════════════════════════════
   QuestionScreen — Question with audio recording
   Uses Canvas API for visualization
   ═══════════════════════════════════════ */

import { useEffect, useState, useRef } from "react"

interface QuestionScreenProps {
  question: string
  questionNumber: number
  totalQuestions: number
  duration: number // seconds
  onComplete: (audioBlob: Blob | null) => void
}

type Phase = "prep" | "recording" | "done"

export function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  duration,
  onComplete,
}: QuestionScreenProps) {
  const [phase, setPhase] = useState<Phase>("prep")
  const [isMicReady, setIsMicReady] = useState(false)
  const [prepTime, setPrepTime] = useState(5)
  const [recordTime, setRecordTime] = useState(duration)
  
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // 1. On Mount: Request Microphone Permission silently
  useEffect(() => {
    let isMounted = true

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        setIsMicReady(true)
      })
      .catch((err) => {
        console.error("Mic access denied or error:", err)
        if (!isMounted) return
        setIsMicReady(true) // Fallback: continue even if denied
      })

    return () => {
      isMounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close().catch(() => {})
      }
    }
  }, [])

  // 2. Preparation Timer (only starts after mic is ready)
  useEffect(() => {
    if (phase === "prep" && isMicReady) {
      if (prepTime > 0) {
        const t = setTimeout(() => setPrepTime(prepTime - 1), 1000)
        return () => clearTimeout(t)
      } else {
        startRecording()
      }
    }
  }, [phase, prepTime, isMicReady])

  // 3. Recording Timer
  useEffect(() => {
    if (phase === "recording") {
      if (recordTime > 0) {
        const t = setTimeout(() => setRecordTime(recordTime - 1), 1000)
        return () => clearTimeout(t)
      } else {
        stopRecording()
      }
    }
  }, [phase, recordTime])

  // Professional Visualization
  const visualize = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw)
        analyserRef.current!.getByteFrequencyData(dataArray)

        ctx.clearRect(0, 0, rect.width, rect.height)

        const barCount = 45
        const barWidth = (rect.width / barCount) * 0.5
        const gap = (rect.width / barCount) * 0.5
        
        const centerY = rect.height / 2
        let x = gap / 2

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.3))
          const value = dataArray[dataIndex] || 0
          
          const percent = value / 255
          const heightFactor = Math.pow(percent, 1.5)
          const minHeight = 4
          const barHeight = Math.max(minHeight, heightFactor * rect.height * 0.8)

          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barWidth / 2)
          } else {
            ctx.rect(x, centerY - barHeight / 2, barWidth, barHeight)
          }

          const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2)
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)")
          gradient.addColorStop(0.5, "rgba(99, 102, 241, 1)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.3)")
          
          ctx.fillStyle = gradient
          ctx.fill()

          x += barWidth + gap
        }
      }
      draw()
    } else {
      let frame = 0
      const drawMock = () => {
        animationRef.current = requestAnimationFrame(drawMock)
        ctx.clearRect(0, 0, rect.width, rect.height)

        const barCount = 45
        const barWidth = (rect.width / barCount) * 0.5
        const gap = (rect.width / barCount) * 0.5
        const centerY = rect.height / 2
        let x = gap / 2

        for (let i = 0; i < barCount; i++) {
          const heightFactor = Math.abs(Math.sin((i + frame) * 0.15) * Math.cos((i - frame) * 0.05))
          const barHeight = Math.max(4, heightFactor * rect.height * 0.5)

          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barWidth / 2)
          } else {
            ctx.rect(x, centerY - barHeight / 2, barWidth, barHeight)
          }
          ctx.fillStyle = "rgba(99, 102, 241, 0.4)"
          ctx.fill()
          x += barWidth + gap
        }
        frame += 0.5
      }
      drawMock()
    }
  }

  const startRecording = () => {
    setPhase("recording")
    
    if (streamRef.current) {
      try {
        audioContextRef.current = new window.AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        analyserRef.current.smoothingTimeConstant = 0.8
        
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
        source.connect(analyserRef.current)
        
        visualize()
        
        const mediaRecorder = new MediaRecorder(streamRef.current)
        mediaRecorderRef.current = mediaRecorder
        const chunks: Blob[] = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: "audio/webm" })
          if (animationRef.current) cancelAnimationFrame(animationRef.current)
          if (audioContextRef.current?.state !== "closed") audioContextRef.current?.close().catch(()=>{})
          onComplete(audioBlob)
        }

        mediaRecorder.start(100)
      } catch (error) {
        console.error("Recording setup failed", error)
        visualize()
      }
    } else {
      visualize()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop() // This will trigger onstop which calls onComplete
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      onComplete(null)
    }
  }

  // Timer circle calculation
  const circumference = 2 * Math.PI * 24 // r=24
  let strokeDashoffset = 0
  if (phase === "prep") {
    strokeDashoffset = circumference - (prepTime / 5) * circumference
  } else if (phase === "recording") {
    strokeDashoffset = circumference - (recordTime / duration) * circumference
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full pt-4 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6 px-1">
        <span className="text-[12px] font-black uppercase tracking-[0.15em] text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          Q {questionNumber} / {totalQuestions}
        </span>
        
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-primary shadow-md shadow-primary/20">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28" cy="28" r="24"
              fill="transparent"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            <circle
              cx="28" cy="28" r="24"
              fill="transparent"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="relative z-10 text-base font-black text-white">
            {phase === "prep" ? prepTime : recordTime}
          </span>
        </div>
      </div>

      {/* Progress Bar (Global Question Progress) */}
      <div className="h-1 bg-surface-container-high rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text — neon corner borders */}
      <div className="relative mb-3">
        {/* Top-left corner */}
        <span className="pointer-events-none absolute -top-[2px] -left-[2px] w-7 h-7 rounded-tl-xl"
          style={{
            borderTop: "2.5px solid",
            borderLeft: "2.5px solid",
            borderColor: "rgb(99 102 241)",
            boxShadow: "inset 2px 2px 6px rgba(99,102,241,0.25), -2px -2px 10px rgba(99,102,241,0.35)",
          }}
        />
        {/* Bottom-right corner */}
        <span className="pointer-events-none absolute -bottom-[2px] -right-[2px] w-7 h-7 rounded-br-xl"
          style={{
            borderBottom: "2.5px solid",
            borderRight: "2.5px solid",
            borderColor: "rgb(99 102 241)",
            boxShadow: "inset -2px -2px 6px rgba(99,102,241,0.25), 2px 2px 10px rgba(99,102,241,0.35)",
          }}
        />

        <div className="elevo-card px-6 py-10 text-center flex items-center justify-center min-h-[160px] border border-outline-variant/50">
          <h2 className="text-xl font-bold text-on-surface leading-snug">
            {question}
          </h2>
        </div>
      </div>

      {/* Visualizer Area — directly below card */}
      <div className="flex flex-col items-center justify-start relative">
        <div className="w-full relative h-[120px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className={`w-full h-full transition-opacity duration-500 ${phase === "prep" ? "opacity-30" : "opacity-100"}`}
          />

          {/* Prep State Overlay */}
          {phase === "prep" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[15px] font-bold tracking-wide text-amber-500">Tayyorlaning...</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
