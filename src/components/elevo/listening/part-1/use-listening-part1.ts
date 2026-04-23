"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getListeningPart1Questions,
  evaluateListeningPart1,
  type ListeningPart1Question,
  type ListeningPart1EvaluateResponse,
} from "@/lib/api/listening"

export type ListeningPhase = "loading" | "instruction" | "exam" | "submitting" | "result"

export function useListeningPart1() {
  const [phase, setPhase] = useState<ListeningPhase>("loading")
  const [questions, setQuestions] = useState<ListeningPart1Question[]>([])
  const [examId, setExamId] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionId → answerId
  const [result, setResult] = useState<ListeningPart1EvaluateResponse | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const examIdRef = useRef<number | null>(null)
  const questionsRef = useRef<ListeningPart1Question[]>([])

  useEffect(() => { examIdRef.current = examId }, [examId])
  useEffect(() => { questionsRef.current = questions }, [questions])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current = null
    }
    setIsAudioPlaying(false)
  }, [])

  const playAudio = useCallback((src: string, onEnd?: () => void) => {
    stopAudio()
    const audio = new Audio(src)
    audioRef.current = audio
    setIsAudioPlaying(true)
    audio.addEventListener("ended", () => {
      setIsAudioPlaying(false)
      onEnd?.()
    })
    audio.addEventListener("error", () => {
      setIsAudioPlaying(false)
      onEnd?.()
    })
    audio.play().catch(() => {
      setIsAudioPlaying(false)
      onEnd?.()
    })
  }, [stopAudio])

  // Play question audio when index changes during exam phase
  useEffect(() => {
    if (phase !== "exam" || questions.length === 0) return
    const q = questions[currentIndex]
    if (q?.audio_url) {
      playAudio(q.audio_url)
    }
    return () => stopAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex])

  // Fetch questions on mount, then play instruction audio
  useEffect(() => {
    ;(async () => {
      try {
        console.log('🔍 [LISTENING DEBUG] Starting fetch...')
        console.log('🔍 [LISTENING DEBUG] API Base:', process.env.NEXT_PUBLIC_API_URL)
        console.log('🔍 [LISTENING DEBUG] Token exists:', typeof window !== 'undefined' && !!localStorage.getItem('elevo_access'))
        
        const data = await getListeningPart1Questions()
        
        console.log('✅ [LISTENING DEBUG] Success!')
        console.log('=== LISTENING PART 1 DATA ===')
        console.log('Exam ID:', data.exam_id)
        console.log('Total questions:', data.questions.length)
        
        // Transform: 1 question with 24 answers → 8 questions with 3 answers each
        let transformedQuestions = data.questions
        if (data.questions.length === 1 && data.questions[0].answers.length > 3) {
          const singleQuestion = data.questions[0]
          const answers = singleQuestion.answers
          
          // Group answers by position
          const positionMap = new Map<number, typeof answers>()
          answers.forEach(answer => {
            const pos = answer.position
            if (!positionMap.has(pos)) {
              positionMap.set(pos, [])
            }
            positionMap.get(pos)!.push(answer)
          })
          
          // Fix audio_url: HTTP → HTTPS (mixed content fix)
          let fixedAudioUrl = singleQuestion.audio_url
          if (fixedAudioUrl && fixedAudioUrl.startsWith('http://')) {
            fixedAudioUrl = fixedAudioUrl.replace('http://', 'https://')
          }
          
          // Create 8 separate questions
          transformedQuestions = Array.from(positionMap.entries())
            .sort(([posA], [posB]) => posA - posB)
            .map(([position, positionAnswers], index) => ({
              id: singleQuestion.id * 1000 + position, // Unique ID for each question
              title: singleQuestion.title,
              instruction: singleQuestion.instruction,
              question: `Question ${position}`,
              audio_url: fixedAudioUrl, // Use HTTPS URL
              answers: positionAnswers.map(a => ({
                id: a.id,
                position: a.position,
                answer: a.answer
              }))
            }))
          
          console.log('Transformed to', transformedQuestions.length, 'questions')
          console.log('Audio URL (fixed):', fixedAudioUrl)
        }
        
        data.questions.forEach((q, i) => {
          console.log(`Question ${i + 1} (ID: ${q.id}):`, {
            title: q.title,
            question: q.question,
            answers_count: q.answers.length,
            answers: q.answers.map(a => ({ id: a.id, position: a.position, answer: a.answer }))
          })
        })
        console.log('===========================')
        
        setQuestions(transformedQuestions)
        setExamId(data.exam_id)
        setError(null)
        setPhase("instruction")
        // Play instruction audio; when done → start exam
        playAudio("/sounds/listening-part1.mp3", () => setPhase("exam"))
      } catch (err: any) {
        console.error('❌ [LISTENING DEBUG] FAILED!')
        console.error('❌ Error type:', err?.constructor?.name)
        console.error('❌ Error message:', err?.message)
        console.error('❌ Error code:', err?.code)
        
        if (err?.config) {
          console.error('❌ Request URL:', err.config.baseURL + err.config.url)
          console.error('❌ Request method:', err.config.method?.toUpperCase())
          console.error('❌ Has token:', !!err.config.headers?.Authorization)
          console.error('❌ Request params:', err.config.params)
        }
        
        if (err?.response) {
          console.error('❌ Response status:', err.response.status)
          console.error('❌ Response data:', err.response.data)
        } else {
          console.error('❌ No response received - Network/CORS/Timeout issue')
          console.error('💡 TIP: Check if backend is running and CORS is configured')
        }
        
        console.error('❌ Full error:', err)
        setError('Savollarni yuklashda xatolik yuz berdi: ' + (err?.message || 'Unknown error'))
        setPhase("exam") // fallback: skip instruction
      }
    })()
    return () => stopAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectAnswer = useCallback((questionId: number, answerId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => i + 1)
  }, [])

  const submit = useCallback(async () => {
    const eid = examIdRef.current
    if (!eid) return
    setPhase("submitting")
    stopAudio()
    try {
      const res = await evaluateListeningPart1({
        exam_id: eid,
        answers: Object.entries(answers).map(([qid, aid]) => ({
          question_id: Number(qid),
          answer_id: Number(aid),
        })),
      })
      setResult(res)
      setPhase("result")
    } catch {
      setPhase("exam")
    }
  }, [answers, stopAudio])

  const currentQuestion = questions[currentIndex] ?? null
  const currentAnswerId = currentQuestion ? answers[currentQuestion.id] : undefined
  const isLastQuestion = currentIndex === questions.length - 1
  const totalAnswered = Object.keys(answers).length

  return {
    phase,
    questions,
    currentIndex,
    currentQuestion,
    currentAnswerId,
    answers,
    isLastQuestion,
    totalAnswered,
    result,
    isAudioPlaying,
    error,
    selectAnswer,
    goNext,
    submit,
  }
}
