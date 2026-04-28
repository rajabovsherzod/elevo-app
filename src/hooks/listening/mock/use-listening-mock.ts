"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  getListeningFullMockQuestions,
  evaluateListeningFullMock,
  type ListeningFullMockQuestionsResponse,
  type ListeningFullMockEvaluateResponse,
} from "@/lib/api/listening-mock"

export function useListeningMock() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<ListeningFullMockQuestionsResponse | null>(null)
  const [result, setResult] = useState<ListeningFullMockEvaluateResponse | null>(null)

  // ── Audio state ─────────────────────────────────────────────────────────────
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentAudioPhase, setCurrentAudioPhase] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // CRITICAL: Barcha yaratilgan audio elementlarni saqlash uchun array
  const allAudiosRef = useRef<HTMLAudioElement[]>([])

  // ── Per-part answers ────────────────────────────────────────────────────────
  const [part1Answers, setPart1Answers] = useState<Record<number, number>>({}) // position -> answerId
  const [part2Answers, setPart2Answers] = useState<Record<number, string>>({}) // position -> text
  const [part3Matches, setPart3Matches] = useState<Record<number, number>>({}) // questionId -> answerId
  const [part4Matches, setPart4Matches] = useState<Record<number, string>>({}) // questionId -> letter
  const [part5Answers, setPart5Answers] = useState<Record<number, number>>({}) // questionId -> answerId
  const [part6Answers, setPart6Answers] = useState<Record<number, string>>({}) // position -> text

  // Refs for stable access in callbacks
  const examDataRef = useRef(examData)
  const part1AnswersRef = useRef(part1Answers)
  const part2AnswersRef = useRef(part2Answers)
  const part3MatchesRef = useRef(part3Matches)
  const part4MatchesRef = useRef(part4Matches)
  const part5AnswersRef = useRef(part5Answers)
  const part6AnswersRef = useRef(part6Answers)

  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { part1AnswersRef.current = part1Answers }, [part1Answers])
  useEffect(() => { part2AnswersRef.current = part2Answers }, [part2Answers])
  useEffect(() => { part3MatchesRef.current = part3Matches }, [part3Matches])
  useEffect(() => { part4MatchesRef.current = part4Matches }, [part4Matches])
  useEffect(() => { part5AnswersRef.current = part5Answers }, [part5Answers])
  useEffect(() => { part6AnswersRef.current = part6Answers }, [part6Answers])

  // ── Audio playback helpers ──────────────────────────────────────────────────
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

  // ── Audio sequence logic ────────────────────────────────────────────────────
  const startAudioSequence = useCallback((data: ListeningFullMockQuestionsResponse) => {
    const { listening } = data
    
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
      if (!listening.part1.audio_url) {
        // Skip to end if no content audio
        setCurrentAudioPhase("Part 1 - Ending")
        playAudio("/sounds/end-part1.mp3", () => {
          if (sequenceCancelled) return
          startPart2()
        })
        return
      }
      setCurrentAudioPhase("Part 1 - Listening")
      playAudio(listening.part1.audio_url, () => {
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
        if (!listening.part2.audio_url) {
          setCurrentAudioPhase("Part 2 - Ending")
          playAudio("/sounds/end-part2.mp3", () => {
            if (sequenceCancelled) return
            startPart3()
          })
          return
        }
        setCurrentAudioPhase("Part 2 - Listening")
        playAudio(listening.part2.audio_url, () => {
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
        if (!listening.part3.audio_url) {
          setCurrentAudioPhase("Part 3 - Ending")
          playAudio("/sounds/end-part3.mp3", () => {
            if (sequenceCancelled) return
            startPart4()
          })
          return
        }
        setCurrentAudioPhase("Part 3 - Listening")
        playAudio(listening.part3.audio_url, () => {
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
        if (!listening.part4.audio_url) {
          setCurrentAudioPhase("Part 4 - Ending")
          playAudio("/sounds/end-part4.mp3", () => {
            if (sequenceCancelled) return
            startPart5()
          })
          return
        }
        setCurrentAudioPhase("Part 4 - Listening")
        playAudio(listening.part4.audio_url, () => {
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
      const extracts = listening.part5.extracts
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

      setCurrentAudioPhase(`Part 5 - ${extract.extract}`)
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
        if (!listening.part6.audio_url) {
          // No content audio, go straight to finish
          playFinish()
          return
        }
        setCurrentAudioPhase("Part 6 - Listening")
        playAudio(listening.part6.audio_url, () => {
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

    getListeningFullMockQuestions()
      .then((data) => {
        if (cancelled) return
        setExamData(data)

        // Initialize answers
        const p1Init: Record<number, number> = {}
        data.listening.part1.answers.forEach((a) => { p1Init[a.position] = 0 })
        setPart1Answers(p1Init)

        const p2Init: Record<number, string> = {}
        data.listening.part2.positions.forEach((p) => { p2Init[p.position] = "" })
        setPart2Answers(p2Init)

        const p6Init: Record<number, string> = {}
        data.listening.part6.positions.forEach((p) => { p6Init[p.position] = "" })
        setPart6Answers(p6Init)

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
  }, []) // Empty deps - only run on mount/unmount (like Part 1)

  // ── Part 1 handlers ─────────────────────────────────────────────────────────
  const handlePart1Select = useCallback((position: number, answerId: number) => {
    setPart1Answers((prev) => ({ ...prev, [position]: answerId }))
  }, [])

  // ── Part 2 handlers ─────────────────────────────────────────────────────────
  const handlePart2Change = useCallback((position: number, value: string) => {
    setPart2Answers((prev) => ({ ...prev, [position]: value }))
  }, [])

  // ── Part 3 handlers ─────────────────────────────────────────────────────────
  const handlePart3Select = useCallback((questionId: number, answerId: number) => {
    setPart3Matches((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  // ── Part 4 handlers ─────────────────────────────────────────────────────────
  const handlePart4Select = useCallback((questionId: number, letter: string) => {
    setPart4Matches((prev) => ({ ...prev, [questionId]: letter }))
  }, [])

  // ── Part 5 handlers ─────────────────────────────────────────────────────────
  const handlePart5Select = useCallback((questionId: number, answerId: number) => {
    setPart5Answers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  // ── Part 6 handlers ─────────────────────────────────────────────────────────
  const handlePart6Change = useCallback((position: number, value: string) => {
    setPart6Answers((prev) => ({ ...prev, [position]: value }))
  }, [])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    console.log('🔥🔥🔥 BUTTON CLICKED - handleSubmit START 🔥🔥🔥')
    console.log('🚀 handleSubmit called')
    console.log('📊 Current state:', { 
      hasData: !!examDataRef.current, 
      submitting,
      part1Count: Object.keys(part1AnswersRef.current).length,
      part2Count: Object.keys(part2AnswersRef.current).length,
      part3Count: Object.keys(part3MatchesRef.current).length,
      part4Count: Object.keys(part4MatchesRef.current).length,
      part5Count: Object.keys(part5AnswersRef.current).length,
      part6Count: Object.keys(part6AnswersRef.current).length,
    })
    
    const data = examDataRef.current
    if (!data || submitting) {
      console.log('❌ Submit blocked:', { hasData: !!data, submitting })
      return
    }

    console.log('✅ Starting submission...')
    setSubmitting(true)
    stopAudio()

    try {
      const p1Ans = part1AnswersRef.current
      const p2Ans = part2AnswersRef.current
      const p3Mat = part3MatchesRef.current
      const p4Mat = part4MatchesRef.current
      const p5Ans = part5AnswersRef.current
      const p6Ans = part6AnswersRef.current

      console.log('📊 Current answers:', {
        part1: p1Ans,
        part2: p2Ans,
        part3: p3Mat,
        part4: p4Mat,
        part5: p5Ans,
        part6: p6Ans,
      })

      // Build payload with global numbers
      const part1Payload: Record<string, any> = {}
      // Part 1: Group answers by position, each position is a question
      const part1ByPosition: Record<number, any[]> = {}
      data.listening.part1.answers.forEach((a) => {
        if (!part1ByPosition[a.position]) {
          part1ByPosition[a.position] = []
        }
        part1ByPosition[a.position].push(a)
      })
      
      // Create payload for each position (question)
      Object.entries(part1ByPosition).forEach(([position, answers]) => {
        const pos = parseInt(position)
        const answerId = p1Ans[pos]
        const globalNumber = answers[0]?.global_number || pos
        part1Payload[globalNumber.toString()] = {
          question_id: data.listening.part1.id,
          answer_id: answerId || null,
          global_number: globalNumber,
        }
      })

      const part2Payload: Record<string, any> = {}
      data.listening.part2.positions.forEach((p) => {
        part2Payload[p.global_number.toString()] = {
          question_id: data.listening.part2.id,
          position: p.position,
          answer: (p2Ans[p.position] || "").trim(),
          global_number: p.global_number,
        }
      })

      const part3Payload: Record<string, any> = {}
      data.listening.part3.questions.forEach((q) => {
        part3Payload[q.global_number.toString()] = {
          question_id: q.id,
          answer_question_id: p3Mat[q.id] || null,
          global_number: q.global_number,
        }
      })

      const part4Payload: Record<string, any> = {}
      // Part 4: answers = PLACES, questions = LETTERS
      // User: place ga letter tanlaydi
      // Backend: question_id = place ID, answer_question_id = letter ID
      data.listening.part4.answers.forEach((place, idx) => {
        const letter = p4Mat[place.id] || ""
        // Convert letter to letter question ID
        let letterQuestionId: number | null = null
        if (letter) {
          // Find the question (letter) that matches this letter text
          const letterQuestion = data.listening.part4.questions.find(
            q => q.text.toUpperCase() === letter.toUpperCase()
          )
          if (letterQuestion) {
            letterQuestionId = letterQuestion.id
          }
        }
        const globalNumber = 19 + idx // Part 4 starts at 19
        part4Payload[globalNumber.toString()] = {
          question_id: place.id,  // Place ID
          answer_question_id: letterQuestionId,  // Letter ID
          global_number: globalNumber,
        }
      })

      const part5Payload: Record<string, any> = {}
      data.listening.part5.extracts.forEach((extract) => {
        extract.questions.forEach((q) => {
          part5Payload[q.global_number.toString()] = {
            question_id: q.id,
            answer_id: p5Ans[q.id] || null,
            global_number: q.global_number,
          }
        })
      })

      const part6Payload: Record<string, any> = {}
      data.listening.part6.positions.forEach((p) => {
        part6Payload[p.global_number.toString()] = {
          question_id: data.listening.part6.id,
          position: p.position,
          answer: (p6Ans[p.position] || "").trim(),
          global_number: p.global_number,
        }
      })

      const payload = {
        exam_id: data.exam_id,
        answers: {
          part1: part1Payload,
          part2: part2Payload,
          part3: part3Payload,
          part4: part4Payload,
          part5: part5Payload,
          part6: part6Payload,
        },
      }

      console.log('📤 Listening Mock Payload:', JSON.stringify(payload, null, 2))

      const res = await evaluateListeningFullMock(payload)
      console.log('📥 Listening Mock Result:', JSON.stringify(res, null, 2))
      setResult(res)
    } catch (err: any) {
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
    setPart1Answers({})
    setPart2Answers({})
    setPart3Matches({})
    setPart4Matches({})
    setPart5Answers({})
    setPart6Answers({})
    setCurrentAudioPhase("")
    setLoading(true)

    getListeningFullMockQuestions()
      .then((data) => {
        setExamData(data)

        const p1Init: Record<number, number> = {}
        data.listening.part1.answers.forEach((a) => { p1Init[a.position] = 0 })
        setPart1Answers(p1Init)

        const p2Init: Record<number, string> = {}
        data.listening.part2.positions.forEach((p) => { p2Init[p.position] = "" })
        setPart2Answers(p2Init)

        const p6Init: Record<number, string> = {}
        data.listening.part6.positions.forEach((p) => { p6Init[p.position] = "" })
        setPart6Answers(p6Init)

        setLoading(false)
        startAudioSequence(data)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load")
        setLoading(false)
      })
  }, [startAudioSequence, stopAudio])

  // ── Computed ────────────────────────────────────────────────────────────────
  const answeredCount =
    Object.values(part1Answers).filter((a) => a > 0).length +
    Object.values(part2Answers).filter((a) => a.trim().length > 0).length +
    Object.keys(part3Matches).length +
    Object.keys(part4Matches).length +
    Object.keys(part5Answers).length +
    Object.values(part6Answers).filter((a) => a.trim().length > 0).length

  const totalQuestionsCount = 35 // Hardcoded for Full Mock

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

    // Answers
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
