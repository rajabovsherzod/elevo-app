"use client"

/* ═══════════════════════════════════════
   Speaking Part 1.1 — Introduction
   Flow: Ready → Intro Modal → Questions
   ═══════════════════════════════════════ */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReadyScreen } from "@/components/elevo/speaking/ready-screen"
import { IntroScreen } from "@/components/elevo/speaking/intro-modal"
import { QuestionScreen } from "@/components/elevo/speaking/question-screen"
import { SpeakingAnalysis } from "@/components/elevo/speaking/speaking-analysis"
import { speakingService } from "@/services/speaking.service"
import type { SpeakingEvaluateResponseSchema, SpeakingPart1_1ResponseSchema } from "@/schemas/speaking.schema"
import { Loader2 } from "lucide-react"

type Stage = "loading" | "ready" | "intro" | "question" | "evaluating" | "analysis"

export default function Part11Page() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("loading")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  
  const [examData, setExamData] = useState<SpeakingPart1_1ResponseSchema | null>(null)
  const [results, setResults] = useState<SpeakingEvaluateResponseSchema[]>([])

  // Fetch questions on mount
  useEffect(() => {
    speakingService.getPart1_1Questions()
      .then((data) => {
        setExamData(data)
        setStage("ready")
      })
      .catch((err) => {
        console.error("Failed to load questions", err)
        // Basic error handling
      })
  }, [])

  // Auto-close intro modal after 10 seconds
  useEffect(() => {
    if (stage === "intro") {
      const timer = setTimeout(() => {
        setStage("question")
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  const handleStart = () => {
    setStage("intro")
  }

  const handleNextQuestion = async (audioBlob: Blob | null) => {
    if (!examData) return

    if (audioBlob) {
      setStage("evaluating")
      try {
        const questionObj = examData.questions[currentQuestion]
        
        // Evaluate the answer
        const res = await speakingService.evaluate({
          part_id: questionObj.id,
          exam_id: examData.exam_id,
          part_type: examData.part_type,
          audio: audioBlob,
        })
        
        setResults(prev => [...prev, res])
      } catch (err: any) {
        console.error("Evaluation failed", err)
        if (err.response && err.response.data) {
          alert(`Server Error (400): ${JSON.stringify(err.response.data)}`)
        } else {
          alert("Server Error: Tahlil jarayonida xatolik yuz berdi.")
        }
      }
    }

    if (currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setStage("question")
    } else {
      setStage("analysis")
    }
  }

  return (
    <>
      
      {stage === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-bold text-on-surface-variant">Savollar yuklanmoqda...</p>
        </div>
      )}

      {stage === "ready" && examData && (
        <ReadyScreen
          title="Part 1.1"
          subtitle="Introduction"
          duration="2 min"
          onStart={handleStart}
          onBack={() => router.push("/speaking")}
        />
      )}

      {stage === "intro" && examData && (
        <IntroScreen
          part="Part 1.1"
          title="Introduction"
          description=""
          totalQuestions={examData.questions.length}
          onBack={() => setStage("ready")}
        />
      )}

      {stage === "question" && examData && (
        <QuestionScreen
          key={currentQuestion}
          question={examData.questions[currentQuestion].question || examData.questions[currentQuestion].title || "Question"}
          questionNumber={currentQuestion + 1}
          totalQuestions={examData.questions.length}
          duration={30}
          onComplete={handleNextQuestion}
        />
      )}

      {stage === "evaluating" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in text-center px-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-primary">AI</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface mb-2">Tahlil qilinmoqda</h2>
            <p className="text-sm text-on-surface-variant max-w-[250px]">
              Sizning javobingiz OpenAI tomonidan tekshirilmoqda. Iltimos kuting...
            </p>
          </div>
        </div>
      )}

      {stage === "analysis" && (
        <SpeakingAnalysis
          results={results}
          onFinish={() => router.push("/speaking")}
        />
      )}

    </>
  )
}
