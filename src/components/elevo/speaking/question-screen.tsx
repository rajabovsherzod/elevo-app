"use client"

/* ═══════════════════════════════════════
   QuestionScreen — Question with audio recording
   Uses Canvas API for visualization
   ═══════════════════════════════════════ */

import { useEffect, useState, useRef } from "react"
import { Mic, MicOff, Play, Pause, RotateCcw } from "lucide-react"

interface QuestionScreenProps {
  question: string
  questionNumber: number
  totalQuestions: number
  duration: number // seconds
  onComplete: () => void
}

export function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  duration,
  onComplete,
}: QuestionScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [useMockWaveform, setUseMockWaveform] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Stop recording function
  const stopRecording = () => {
    if (useMockWaveform) {
      // Mock mode
      setIsRecording(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Create dummy blob
      const dummyBlob = new Blob(["mock audio"], { type: "audio/webm" })
      setAudioBlob(dummyBlob)
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      // Real recording
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && isRecording) {
      const timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => window.clearTimeout(timer)
    } else if (timeLeft === 0 && isRecording) {
      stopRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRecording])

  // Visualize audio
  const visualize = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (analyserRef.current) {
      // Real audio visualization
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw)
        
        analyserRef.current!.getByteFrequencyData(dataArray)

        ctx.fillStyle = "transparent"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

          // Gradient color
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
          gradient.addColorStop(0, "#6366f1")
          gradient.addColorStop(1, "#4f46e5")

          ctx.fillStyle = gradient
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }
      }

      draw()
    } else {
      // Mock waveform animation (when mic not available)
      let frame = 0
      const draw = () => {
        animationRef.current = requestAnimationFrame(draw)
        
        ctx.fillStyle = "transparent"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const barCount = 60
        const barWidth = canvas.width / barCount - 1

        for (let i = 0; i < barCount; i++) {
          // Create wave effect with sine
          const barHeight = Math.abs(
            Math.sin((i + frame) * 0.1) * 
            Math.cos((i - frame) * 0.05) * 
            canvas.height * 0.6
          ) + 10

          const x = i * (barWidth + 1)

          // Gradient color
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
          gradient.addColorStop(0, "#6366f1")
          gradient.addColorStop(1, "#4f46e5")

          ctx.fillStyle = gradient
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        }

        frame += 0.5
      }

      draw()
    }
  }

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      // Start visualization
      visualize()
      
      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        
        // Stop visualization
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTimeLeft(duration)
      setUseMockWaveform(false)
    } catch (error) {
      console.error("Microphone access denied:", error)
      
      // Use mock waveform instead
      setUseMockWaveform(true)
      setIsRecording(true)
      setTimeLeft(duration)
      visualize()
      
      // Simulate recording completion
      setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        // Create a dummy blob for demo
        const dummyBlob = new Blob(["mock audio"], { type: "audio/webm" })
        setAudioBlob(dummyBlob)
        setIsRecording(false)
      }, duration * 1000)
    }
  }

  // Play recorded audio
  const playAudio = () => {
    if (useMockWaveform) {
      // Mock playback - just toggle state
      setIsPlaying(!isPlaying)
      if (!isPlaying) {
        // Auto-stop after 2 seconds
        setTimeout(() => setIsPlaying(false), 2000)
      }
    } else if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  // Reset recording
  const resetRecording = () => {
    setAudioBlob(null)
    setAudioURL(null)
    setTimeLeft(duration)
    setIsPlaying(false)
    setUseMockWaveform(false)
  }

  // Progress percentage
  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Savol {questionNumber} / {totalQuestions}
          </span>
          <span className="text-xs font-bold text-primary">
            {timeLeft}s
          </span>
        </div>
        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="elevo-card p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 border border-primary/15 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-primary">
              {questionNumber}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-on-surface leading-relaxed">
              {question}
            </h2>
          </div>
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="elevo-card p-6 mb-6 relative">
        {useMockWaveform && isRecording && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary">
              Demo Mode
            </span>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full h-[120px] rounded-lg"
        />
        
        {!isRecording && !audioBlob && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-on-surface-variant">
              Yozuvni boshlash uchun mikrofon tugmasini bosing
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!audioBlob ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 bg-primary hover:bg-primary-dim rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <Mic className="w-7 h-7 text-white" strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-16 h-16 bg-error hover:bg-error-dim rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 animate-pulse"
              >
                <MicOff className="w-7 h-7 text-white" strokeWidth={2.5} />
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={resetRecording}
              className="w-12 h-12 bg-surface-container-high hover:bg-surface-container-highest rounded-full flex items-center justify-center transition-all hover:scale-110"
            >
              <RotateCcw className="w-5 h-5 text-on-surface-variant" />
            </button>

            <button
              onClick={playAudio}
              className="w-16 h-16 bg-primary hover:bg-primary-dim rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white fill-white" strokeWidth={2.5} />
              ) : (
                <Play className="w-7 h-7 text-white fill-white" strokeWidth={2.5} />
              )}
            </button>

            <button
              onClick={onComplete}
              className="px-6 py-3 elevo-btn-primary rounded-xl font-bold transition-all hover:scale-105"
            >
              Keyingi
            </button>
          </>
        )}
      </div>

      {/* Hidden audio element */}
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  )
}
