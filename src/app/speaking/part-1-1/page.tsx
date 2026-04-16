"use client"

/* ═══════════════════════════════════════
   Speaking Part 1.1 — Introduction
   Flow: Ready → Intro Modal → Questions
   ═══════════════════════════════════════ */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/elevo/layout/app-layout"
import { AppHeader } from "@/components/elevo/layout/app-header"
import { ReadyScreen } from "@/components/elevo/speaking/ready-screen"
import { IntroModal } from "@/components/elevo/speaking/intro-modal"
import { QuestionScreen } from "@/components/elevo/speaking/question-screen"

type Stage = "ready" | "intro" | "question" | "complete"

// Mock questions
const QUESTIONS = [
  "What is your name?",
  "Where are you from?",
  "What do you do for work or study?",
  "Do you enjoy your work/studies? Why?",
]

export default function Part11Page() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("ready")
  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Auto-close intro modal after 5 seconds
  useEffect(() => {
    if (stage === "intro") {
      const timer = setTimeout(() => {
        setStage("question")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  const handleStart = () => {
    setStage("intro")
  }

  const handleNextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setStage("complete")
      // Redirect to results or next part
      setTimeout(() => {
        router.push("/speaking")
      }, 2000)
    }
  }

  return (
    <AppLayout>
      <AppHeader />

      <main className="px-5 pt-[88px] pb-28">
        {stage === "ready" && (
          <ReadyScreen
            title="Part 1.1"
            subtitle="Introduction"
            duration="2 min"
            onStart={handleStart}
          />
        )}

        {stage === "intro" && (
          <IntroModal
            part="Part 1.1"
            title="Introduction"
            description="Javob vaqti: 30 sekund har bir savol uchun"
            totalQuestions={QUESTIONS.length}
          />
        )}

        {stage === "question" && (
          <QuestionScreen
            question={QUESTIONS[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={QUESTIONS.length}
            duration={30}
            onComplete={handleNextQuestion}
          />
        )}

        {stage === "complete" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">
                Barakalla!
              </h2>
              <p className="text-on-surface-variant">
                Part 1.1 yakunlandi
              </p>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  )
}
