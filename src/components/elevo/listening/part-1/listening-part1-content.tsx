"use client"

import { Button } from "@/components/base/buttons/button"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ListeningPart1Loading } from "./listening-part1-loading"
import { ListeningPart1Mcq } from "./listening-part1-mcq"
import { ListeningPart1Result } from "./listening-part1-result"
import { useListeningPart1 } from "./use-listening-part1"

// Animated waveform shown while audio plays
function AudioIndicator() {
  const heights = [3, 5, 7, 4, 6, 3, 5, 4, 7, 3, 5, 4]
  return (
    <div className="flex items-end gap-0.5 h-5" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] bg-primary rounded-full animate-pulse"
          style={{
            height: `${h * 3}px`,
            animationDelay: `${i * 0.08}s`,
            animationDuration: "0.7s",
          }}
        />
      ))}
    </div>
  )
}

// Instruction phase: compact banner with waveform
function InstructionBanner({ isPlaying }: { isPlaying: boolean }) {
  const heights = [2, 4, 6, 4, 7, 3, 5, 6, 7, 4, 2, 5, 3, 6, 4]
  return (
    <div className="elevo-card elevo-card-border w-full flex items-center gap-4 p-4 bg-primary/5 border-primary/20">
      {/* Microphone icon with pulse */}
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-0.5">
          Ko'rsatma eshitilmoqda
        </p>
        <p className="text-sm font-bold text-on-surface">
          Listening Part 1 — Savollarni o'qib turing
        </p>
      </div>

      {/* Waveform */}
      {isPlaying && (
        <div className="flex items-end justify-center gap-0.5 h-8 shrink-0">
          {heights.map((h, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${h * 3}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.9s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ListeningPart1Content() {
  const {
    phase,
    questions,
    currentIndex,
    currentQuestion,
    currentAnswerId,
    isLastQuestion,
    totalAnswered,
    result,
    isAudioPlaying,
    selectAnswer,
    goNext,
    submit,
    answers,
    error,
  } = useListeningPart1()

  // Loading
  if (phase === "loading") {
    return <ListeningPart1Loading />
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Short Conversations" hideBackButton />
        <div className="elevo-card elevo-card-border p-8 text-center">
          <p className="text-error text-sm font-medium">{error}</p>
          <p className="text-on-surface-variant text-xs mt-2">Sahifani yangilab qayta urinib ko'ring</p>
        </div>
      </div>
    )
  }

  // Instruction audio playing - show questions with instruction banner
  if (phase === "instruction") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Short Conversations" hideBackButton />
        <InstructionBanner isPlaying={isAudioPlaying} />
        
        {/* Questions visible but disabled during instruction */}
        {questions.length > 0 && (
          <div className="flex flex-col gap-4 opacity-50 pointer-events-none">
            {questions.map((question, index) => (
              <ListeningPart1Mcq
                key={question.id}
                question={question}
                questionNumber={index + 1}
                selectedAnswerId={answers[question.id]}
                onSelect={selectAnswer}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Result
  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-5 pb-6 animate-fade-in">
        <PageHeaderWithBack title="Part 1 — Results" />
        <ListeningPart1Result result={result} />
      </div>
    )
  }

  // Exam - show all questions at once
  if (questions.length === 0) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Short Conversations" hideBackButton />
        <div className="elevo-card elevo-card-border p-8 text-center">
          <p className="text-on-surface-variant text-sm">Savollar yuklanmadi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      {/* Header with audio indicator */}
      <PageHeaderWithBack
        title="Part 1 — Short Conversations"
        hideBackButton
        rightContent={
          isAudioPlaying ? <AudioIndicator /> : undefined
        }
      />

      {/* Progress */}
      <div className="elevo-card elevo-card-border p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {questions.length} ta savol
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {totalAnswered} javob
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* All Questions */}
      <div className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <ListeningPart1Mcq
            key={question.id}
            question={question}
            questionNumber={index + 1}
            selectedAnswerId={answers[question.id]}
            onSelect={selectAnswer}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          size="md"
          color="primary"
          isLoading={phase === "submitting"}
          isDisabled={totalAnswered < questions.length || phase === "submitting"}
          onClick={submit}
        >
          Topshirish
        </Button>
      </div>
    </div>
  )
}
