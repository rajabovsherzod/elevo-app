"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  getListeningMockQuestion,
  evaluateListeningMock,
  type ListeningMockQuestionResponse,
  type ListeningMockEvaluateResponse,
} from "@/lib/api/listening-mock"

export function useListeningMock() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<ListeningMockQuestionResponse | null>(null)
  const [result, setResult] = useState<ListeningMockEvaluateResponse | null>(null)

  // ── Global answers (positions 1-35) ────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Refs for stable access in callbacks
  const examDataRef = useRef(examData)
  const answersRef = useRef(answers)

  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ── Audio state (NO CHANGES - CRITICAL!) ───────────────────────────────────
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentAudioPhase, setCurrentAudioPhase] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // CRITICAL: Barcha yaratilgan audio elementlarni saqlash uchun array
  const allAudiosRef = useRef<HTMLAudioElement[]>([])

  // ── Audio playback helpers (NO CHANGES - CRITICAL!) ────────────────────────
  const stopAudio = useCallback(() => {
    // 0. CRITICAL: Cancel audio sequence callbacks
    if (typeof window !== 'undefined' && (window as any).__listeningMockCancelSequence) {
      (window as any).__listeningMockCancelSequence()
      delete (window as any).__listeningMockCancelSequence
    }
    
    // 1. Hozirgi audio ni to'xtatish
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
      a.src = ""
      audioRef.current = null
    }
    
    // 2. CRITICAL: Barcha yaratilgan audio elementlarni to'xtatish
    allAudiosRef.current.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
        audio.src = ""
      } catch (e) {
        // Ignore errors
      }
    })
    allAudiosRef.current = [] // Array ni tozalash
    
    setIsAudioPlaying(false)
    
    // 3. Document dagi barcha audio elementlarni ham to'xtatish (backup)
    if (typeof window !== 'undefined') {
      const allAudios = document.querySelectorAll('audio')
      allAudios.forEach(audio => {
        try {
          audio.pause()
          audio.currentTime = 0
          audio.src = ""
        } catch (e) {
          // Ignore errors
        }
      })
    }
  }, [])

  const playAudio = useCallback((src: string, onEnd?: () => void) => {
    // Avval to'xtatish
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
      a.src = ""
    }
    
    const audio = new Audio(src)
    audioRef.current = audio
    
    // CRITICAL: Yangi yaratilgan audio ni array ga qo'shish
    allAudiosRef.current.push(audio)
    
    setIsAudioPlaying(true)

    let done = false
    const finish = () => {
      if (done) return
      done = true
      audio.removeEventListener("ended", finish)
      audio.removeEventListener("error", finish)
      setIsAudioPlaying(false)
      onEnd?.()
    }

    audio.addEventListener("ended", finish)
    audio.addEventListener("error", finish)
    audio.play().catch(() => finish())
  }, [])

  // ── Audio sequence logic (NO CHANGES - CRITICAL!) ──────────────────────────
  const startAudioSequence = useCallback((data: ListeningMockQuestionResponse) => {
    // CRITICAL: Cancelled flag - orqaga chiqqanda callback chain to'xtatish uchun
    let sequenceCancelled = false
    
    // CRITICAL: Cleanup function - faqat flag ni o'zgartirish (stopAudio chaqirmaslik!)
    const cancelSequence = () => {
      sequenceCancelled = true
    }
    
    // Store cancel function globally
    if (typeof window !== 'undefined') {
      (window as any).__listeningMockCancelSequence = cancelSequence
    }

    // Part 1: intro → content → end
    setCurrentAudioPhase("Part 1 - Introduction")
    playAudio("/sounds/listening-part1.mp3", () => {
      if (sequenceCancelled) return // CRITICAL: Check before continuing
      if (!data.part1.audio_url) {
        // Skip to end if no content audio
        setCurrentAudioPhase("Part 1 - Ending")
        playAudio("/sounds/end-part1.mp3", () => {
          if (sequenceCancelled) return
          startPart2()
        })
        return
      }
      setCurrentAudioPhase("Part 1 - Listening")
      playAudio(data.part1.audio_url, () => {
        if (sequenceCancelled) return
        setCurrentAudioPhase("Part 1 - Ending")
        playAudio("/sounds/end-part1.mp3", () => {
          if (sequenceCancelled) return
          startPart2()
        })
      })
    })

    function startPart2() {
      if (sequenceCancelled) return
      setCurrentAudioPhase("Part 2 - Introduction")
      playAudio("/sounds/listening-part2.mp3", () => {
        if (sequenceCancelled) return
        if (!data.part2.audio_url) {
          setCurrentAudioPhase("Part 2 - Ending")
          playAudio("/sounds/end-part2.mp3", () => {
            if (sequenceCancelled) return
            startPart3()
          })
          return
        }
        setCurrentAudioPhase("Part 2 - Listening")
        playAudio(data.part2.audio_url, () => {
          if (sequenceCancelled) return
          setCurrentAudioPhase("Part 2 - Ending")
          playAudio("/sounds/end-part2.mp3", () => {
            if (sequenceCancelled) return
            startPart3()
          })
        })
      })
    }

    function startPart3() {
      if (sequenceCancelled) return
      setCurrentAudioPhase("Part 3 - Introduction")
      playAudio("/sounds/listening-part3.mp3", () => {
        if (sequenceCancelled) return
        if (!data.part3.audio_url) {
          setCurrentAudioPhase("Part 3 - Ending")
          playAudio("/sounds/end-part3.mp3", () => {
            if (sequenceCancelled) return
            startPart4()
          })
          return
        }
        setCurrentAudioPhase("Part 3 - Listening")
        playAudio(data.part3.audio_url, () => {
          if (sequenceCancelled) return
          setCurrentAudioPhase("Part 3 - Ending")
          playAudio("/sounds/end-part3.mp3", () => {
            if (sequenceCancelled) return
            startPart4()
          })
        })
      })
    }

    function startPart4() {
      if (sequenceCancelled) return
      setCurrentAudioPhase("Part 4 - Introduction")
      playAudio("/sounds/listening-part4.mp3", () => {
        if (sequenceCancelled) return
        if (!data.part4.audio_url) {
          setCurrentAudioPhase("Part 4 - Ending")
          playAudio("/sounds/end-part4.mp3", () => {
            if (sequenceCancelled) return
            startPart5()
          })
          return
        }
        setCurrentAudioPhase("Part 4 - Listening")
        playAudio(data.part4.audio_url, () => {
          if (sequenceCancelled) return
          setCurrentAudioPhase("Part 4 - Ending")
          playAudio("/sounds/end-part4.mp3", () => {
            if (sequenceCancelled) return
            startPart5()
          })
        })
      })
    }

    function startPart5() {
      if (sequenceCancelled) return
      setCurrentAudioPhase("Part 5 - Introduction")
      playAudio("/sounds/listening-part5.mp3", () => {
        if (sequenceCancelled) return
        // Part 5 has multiple extracts with their own audio
        playPart5Extracts(0)
      })
    }

    function playPart5Extracts(index: number) {
      if (sequenceCancelled) return
      const extracts = data.part5.extracts
      if (index >= extracts.length) {
        // All extracts done, play part 5 end
        setCurrentAudioPhase("Part 5 - Ending")
        playAudio("/sounds/end-part5.mp3", () => {
          if (sequenceCancelled) return
          startPart6()
        })
        return
      }

      const extract = extracts[index]
      if (!extract.audio_url) {
        // Skip to next extract
        playPart5Extracts(index + 1)
        return
      }

      setCurrentAudioPhase(`Part 5 - Extract ${extract.extract_number}`)
      playAudio(extract.audio_url, () => {
        if (sequenceCancelled) return
        playPart5Extracts(index + 1)
      })
    }

    function startPart6() {
      if (sequenceCancelled) return
      setCurrentAudioPhase("Part 6 - Introduction")
      playAudio("/sounds/listening-part6.mp3", () => {
        if (sequenceCancelled) return
        if (!data.part6.audio_url) {
          // No content audio, go straight to finish
          playFinish()
          return
        }
        setCurrentAudioPhase("Part 6 - Listening")
        playAudio(data.part6.audio_url, () => {
          if (sequenceCancelled) return
          // After Part 6 content, go straight to finish (no end-part6.mp3)
          playFinish()
        })
      })
    }

    function playFinish() {
      if (sequenceCancelled) return
      setCurrentAudioPhase("Exam Complete")
      playAudio("/sounds/finish-mock.mp3", () => {
        if (sequenceCancelled) return
        setCurrentAudioPhase("All Audio Finished")
        setIsAudioPlaying(false)
      })
    }
  }, [playAudio])

  // ── Load questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getListeningMockQuestion()
      .then((data) => {
        if (cancelled) return
        setExamData(data)

        // Initialize empty answers for all 35 positions
        const initialAnswers: Record<string, string> = {}
        for (let i = 1; i <= 35; i++) {
          initialAnswers[i.toString()] = ""
        }
        setAnswers(initialAnswers)

        setLoading(false)

        // Start audio sequence
        startAudioSequence(data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('❌ Failed to load listening mock:', err)
        const errorMsg = err?.response?.data?.detail || err?.message || "Failed to load full mock questions"
        setError(errorMsg)
        setLoading(false)
      })

    // Cleanup function - CRITICAL: Barcha audio elementlarni to'xtatish
    return () => {
      cancelled = true
      
      // CRITICAL: Cancel audio sequence callbacks
      if (typeof window !== 'undefined' && (window as any).__listeningMockCancelSequence) {
        (window as any).__listeningMockCancelSequence()
        delete (window as any).__listeningMockCancelSequence
      }
      
      // 1. Hozirgi audio
      const a = audioRef.current
      if (a) {
        a.pause()
        a.currentTime = 0
        a.src = ""
        audioRef.current = null
      }
      
      // 2. CRITICAL: Barcha yaratilgan audio elementlar
      allAudiosRef.current.forEach(audio => {
        try {
          audio.pause()
          audio.currentTime = 0
          audio.src = ""
        } catch (e) {
          // Ignore errors
        }
      })
      allAudiosRef.current = []
      
      setIsAudioPlaying(false)
      
      // 3. Document dagi barcha audio elementlar (backup)
      if (typeof window !== 'undefined') {
        const allAudios = document.querySelectorAll('audio')
        allAudios.forEach(audio => {
          try {
            audio.pause()
            audio.currentTime = 0
            audio.src = ""
          } catch (e) {
            // Ignore errors
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run on mount/unmount

  // ── Answer handlers (global positions 1-35) ─────────────────────────────────
  const handleAnswerChange = useCallback((globalPosition: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [globalPosition.toString()]: value }))
  }, [])

  // ── Part-specific handlers (convert to global positions) ───────────────────
  // Part 1: positions 1-8 (MCQ with letters A/B/C/D)
  const handlePart1Select = useCallback((position: number, letter: string) => {
    const globalPosition = position  // Part 1: 1-8
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 2: positions 9-13 (text input)
  const handlePart2Change = useCallback((position: number, value: string) => {
    const globalPosition = 8 + position  // Part 2: 9-13
    handleAnswerChange(globalPosition, value)
  }, [handleAnswerChange])

  // Part 3: positions 14-18 (speaker matching with letters A-F)
  const handlePart3Select = useCallback((speakerPosition: number, letter: string) => {
    const globalPosition = 13 + speakerPosition  // Part 3: 14-18
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 4: positions 19-23 (map task with letters A-H)
  const handlePart4Select = useCallback((placePosition: number, letter: string) => {
    const globalPosition = 18 + placePosition  // Part 4: 19-23
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 5: positions 24-29 (MCQ with letters A/B/C)
  const handlePart5Select = useCallback((position: number, letter: string) => {
    const globalPosition = 23 + position  // Part 5: 24-29
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 6: positions 30-35 (text input)
  const handlePart6Change = useCallback((position: number, value: string) => {
    const globalPosition = 29 + position  // Part 6: 30-35
    handleAnswerChange(globalPosition, value)
  }, [handleAnswerChange])

  // ── Submit (SIMPLIFIED) ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    console.log('🔥 handleSubmit START')
    console.log('📊 Current state:', { 
      hasData: !!examDataRef.current, 
      submitting,
      answersCount: Object.keys(answersRef.current).length,
    })
    
    const data = examDataRef.current
    const currentAnswers = answersRef.current
    
    if (!data || submitting) {
      console.log('❌ Submit blocked:', { hasData: !!data, submitting })
      return
    }

    console.log('✅ Starting submission...')
    setSubmitting(true)
    stopAudio()

    try {
      const payload = {
        resource_ids: data.resource_ids,
        answers: currentAnswers,  // Simple format: {"1": "A", "2": "text", ...}
      }

      console.log('📤 Listening Mock Payload:', JSON.stringify(payload, null, 2))

      const res = await evaluateListeningMock(payload)
      console.log('📥 Listening Mock Result:', JSON.stringify(res, null, 2))
      setResult(res)
    } catch (err: any) {
      console.error('❌ Submit error:', err)
      setError(err?.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }, [submitting, stopAudio])

  // ── Retry ───────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    // CRITICAL: Avval barcha audio ni to'xtatish
    stopAudio()
    
    setResult(null)
    setError(null)
    setAnswers({})
    setCurrentAudioPhase("")
    setLoading(true)

    getListeningMockQuestion()
      .then((data) => {
        setExamData(data)
        
        const initialAnswers: Record<string, string> = {}
        for (let i = 1; i <= 35; i++) {
          initialAnswers[i.toString()] = ""
        }
        setAnswers(initialAnswers)

        setLoading(false)
        startAudioSequence(data)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load")
        setLoading(false)
      })
  }, [startAudioSequence, stopAudio])

  // ── Computed ────────────────────────────────────────────────────────────────
  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length
  const totalQuestionsCount = 35

  // ── Convert global answers to part-specific format for UI ──────────────────
  // Part 1: positions 1-8
  const part1Answers: Record<number, string> = {}
  for (let i = 1; i <= 8; i++) {
    part1Answers[i] = answers[i.toString()] || ""
  }

  // Part 2: positions 9-13
  const part2Answers: Record<number, string> = {}
  for (let i = 1; i <= 5; i++) {
    const globalPos = 8 + i
    part2Answers[i] = answers[globalPos.toString()] || ""
  }

  // Part 3: positions 14-18
  const part3Matches: Record<number, string> = {}
  for (let i = 1; i <= 5; i++) {
    const globalPos = 13 + i
    const letter = answers[globalPos.toString()] || ""
    if (letter) part3Matches[i] = letter
  }

  // Part 4: positions 19-23
  const part4Matches: Record<number, string> = {}
  for (let i = 1; i <= 5; i++) {
    const globalPos = 18 + i
    const letter = answers[globalPos.toString()] || ""
    if (letter) part4Matches[i] = letter
  }

  // Part 5: positions 24-29
  const part5Answers: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    const globalPos = 23 + i
    part5Answers[i] = answers[globalPos.toString()] || ""
  }

  // Part 6: positions 30-35
  const part6Answers: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    const globalPos = 29 + i
    part6Answers[i] = answers[globalPos.toString()] || ""
  }

  return {
    // State
    loading,
    submitting,
    error,
    examData,
    result,

    // Audio state
    isAudioPlaying,
    currentAudioPhase,

    // Answers (part-specific format for UI compatibility)
    part1Answers,
    part2Answers,
    part3Matches,
    part4Matches,
    part5Answers,
    part6Answers,

    // Handlers
    handlePart1Select,
    handlePart2Change,
    handlePart3Select,
    handlePart4Select,
    handlePart5Select,
    handlePart6Change,

    // Submit
    handleSubmit,
    retry,

    // Computed
    answeredCount,
    totalQuestionsCount,
    
    // Audio control - orqaga chiqqanda to'xtatish uchun
    stopAudio,
  }
}
