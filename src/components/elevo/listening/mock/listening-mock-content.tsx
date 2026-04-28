"use client"

import React from "react"
import { Button } from "@/components/base/buttons/button"
import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ErrorCard } from "@/components/elevo/shared/error-card"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { useListeningMock } from "@/hooks/listening/mock/use-listening-mock"
import { ErrorCode, type AppError } from "@/lib/types/errors"
import { Volume2, Wind } from "@/lib/icons"
import { ListeningMockResult } from "./listening-mock-result"
import { ListeningMockReviewAccordion } from "./listening-mock-review-accordion"

// Reuse existing part UI components (like Reading Mock does)
import { ListeningPart1Mcq } from "@/components/elevo/listening/part-1/listening-part1-mcq"
import { ListeningPart2GapText } from "@/components/elevo/listening/part-2/listening-part2-gap-text"
import { ListeningPart3SpeakerCard } from "@/components/elevo/listening/part-3/listening-part3-speaker-card"
import { ListeningPart5Mcq } from "@/components/elevo/listening/part-5/listening-part5-mcq"
import { ListeningPart6GapText } from "@/components/elevo/listening/part-6/listening-part6-gap-text"

export function ListeningMockContent() {
  const {
    loading,
    submitting,
    error,
    examData,
    result,
    isAudioPlaying,
    currentAudioPhase,
    part1Answers,
    part2Answers,
    part3Matches,
    part4Matches,
    part5Answers,
    part6Answers,
    handlePart1Select,
    handlePart2Change,
    handlePart3Select,
    handlePart4Select,
    handlePart5Select,
    handlePart6Change,
    handleSubmit,
    retry,
    answeredCount,
    totalQuestionsCount,
    stopAudio, // Audio to'xtatish uchun
  } = useListeningMock()

  // Debug log - useEffect ichida
  React.useEffect(() => {
    console.log('🎯 ListeningMockContent rendered:', { 
      loading, 
      submitting, 
      hasError: !!error, 
      hasData: !!examData, 
      hasResult: !!result,
      handleSubmitType: typeof handleSubmit,
    })
  }, [loading, submitting, error, examData, result, handleSubmit])

  // Orqaga bosganda audio to'xtatish
  const handleBack = () => {
    stopAudio()
    window.history.back()
  }

  // Hook already handles cleanup on unmount - no need for duplicate useEffect

  // Loading state
  if (loading) {
    return (
      <>
        <PageHeaderWithBack title="Listening Full Mock" onBack={handleBack} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ExamLoading />
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    const appError: AppError = {
      message: error.includes("not enough parts") || error.includes("no questions") 
        ? "Listening Full Mock uchun yetarli savollar mavjud emas. Iltimos, admin panel orqali barcha 6 ta part uchun savollar qo'shing."
        : error,
      code: ErrorCode.UNKNOWN,
      retry: true,
    }
    return (
      <>
        <PageHeaderWithBack title="Listening Full Mock" onBack={handleBack} />
        <ErrorCard
          error={appError}
          onRetry={retry}
          onBack={handleBack}
        />
      </>
    )
  }

  // Submitting state
  if (submitting) {
    return (
      <>
        <PageHeaderWithBack title="Listening Full Mock" hideBackButton={true} />
        <CalculatingResults />
      </>
    )
  }

  // Result state
  if (result && examData) {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <PageHeaderWithBack title="Listening Full Mock Result" />
        
        {/* Result Component */}
        <ListeningMockResult result={result} onRetry={retry} />
        
        {/* Review Accordion */}
        <ListeningMockReviewAccordion 
          examData={examData} 
          result={result}
          userAnswers={{
            part1Answers,
            part2Answers,
            part3Matches,
            part4Matches,
            part5Answers,
            part6Answers,
          }}
        />
      </div>
    )
  }

  // No data
  if (!examData) {
    return (
      <>
        <PageHeaderWithBack title="Listening Full Mock" onBack={handleBack} />
        <div className="elevo-card elevo-card-border p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-on-surface-variant">
            No questions found. Try again later.
          </p>
        </div>
      </>
    )
  }

  const { listening } = examData

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-24">
      {/* Header */}
      <PageHeaderWithBack title="Listening Full Mock" onBack={handleBack} />

      {/* Audio Status Indicator - Sticky at top */}
      <div className="sticky top-0 z-50 elevo-card elevo-card-border p-3 bg-surface/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAudioPlaying ? (
              <Volume2 className="w-5 h-5 text-indigo-500 animate-pulse" />
            ) : (
              <Wind className="w-5 h-5 text-on-surface-variant" />
            )}
            <span className="text-xs font-medium text-on-surface">
              {currentAudioPhase || "Ready"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-highest/50 px-2.5 py-0.5 rounded-full border border-outline-variant/30">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                answeredCount === totalQuestionsCount
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-indigo-500 animate-pulse"
              }`}
            />
            <span className="text-[8px] sm:text-[9px] font-bold text-on-surface tracking-wider">
              ANSWERED {answeredCount}/{totalQuestionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* ── Part 1 Content ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 1
          </span>
          <span className="text-xs text-on-surface-variant">— Multiple Choice (1-8)</span>
        </div>
        {listening.part1.instruction && (
          <p className="text-xs text-on-surface-variant">{listening.part1.instruction}</p>
        )}
        
        {/* Group answers by position to create questions */}
        <div className="flex flex-col gap-4">
          {(() => {
            // Get unique positions
            const positions = Array.from(new Set(listening.part1.answers.map(a => a.position))).sort((a, b) => a - b)
            
            return positions.map((position) => {
              // Get all answers for this position
              const positionAnswers = listening.part1.answers.filter(a => a.position === position)
              const globalNumber = positionAnswers[0]?.global_number || position
              
              // Create question object for MCQ component
              const questionForComponent = {
                id: listening.part1.id * 1000 + position,
                title: listening.part1.title || "",
                instruction: "",
                question: `Question ${globalNumber}`,
                audio_url: listening.part1.audio_url || "",
                answers: positionAnswers,
              }
              
              return (
                <ListeningPart1Mcq
                  key={position}
                  question={questionForComponent}
                  questionNumber={globalNumber}
                  selectedAnswerId={part1Answers[position]}
                  onSelect={(_, answerId) => handlePart1Select(position, answerId)}
                  isLocked={false}
                />
              )
            })
          })()}
        </div>
      </div>

      {/* ── Part 2 Content ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 2
          </span>
          <span className="text-xs text-on-surface-variant">— Gap Filling (9-13)</span>
        </div>
        {listening.part2.instruction && (
          <p className="text-xs text-on-surface-variant">{listening.part2.instruction}</p>
        )}
        <div className="rounded-xl p-4 elevo-card-border bg-surface-container-low">
          <ListeningPart2GapText
            text={listening.part2.question}
            positions={listening.part2.positions.map(p => p.position)}
            answers={part2Answers}
            onAnswerChange={handlePart2Change}
            disabled={false}
          />
        </div>
      </div>

      {/* ── Part 3 Content ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 3
          </span>
          <span className="text-xs text-on-surface-variant">— Speaker Matching (14-18)</span>
        </div>
        {listening.part3.instruction && (
          <p className="text-xs text-on-surface-variant">{listening.part3.instruction}</p>
        )}
        
        {/* Options display */}
        <div className="p-3 rounded-lg bg-surface-container-low">
          <p className="text-xs font-bold text-on-surface-variant mb-2">OPTIONS:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {listening.part3.answers.map((ans, i) => (
              <div key={ans.id} className="text-xs text-on-surface">
                <span className="font-bold">{String.fromCharCode(65 + i)}.</span> {ans.text}
              </div>
            ))}
          </div>
        </div>

        {/* Speaker cards */}
        <div className="flex flex-col gap-3">
          {listening.part3.questions.map((speaker, idx) => (
            <ListeningPart3SpeakerCard
              key={speaker.id}
              speaker={speaker}
              speakerIndex={idx + 13} // Global numbering: 14-18
              options={listening.part3.answers}
              selectedAnswerId={part3Matches[speaker.id]}
              onSelect={handlePart3Select}
              isLocked={false}
            />
          ))}
        </div>
      </div>

      {/* ── Part 4 Content ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 4
          </span>
          <span className="text-xs text-on-surface-variant">— Place Matching (19-23)</span>
        </div>
        {listening.part4.instruction && (
          <p className="text-xs text-on-surface-variant">{listening.part4.instruction}</p>
        )}

        {/* Map image - smaller size like individual part */}
        {listening.part4.image_url && (
          <div className="elevo-card elevo-card-border overflow-hidden">
            <div className="px-4 py-3 bg-surface-container/60">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Map
              </p>
            </div>
            <div className="p-3">
              <img
                src={listening.part4.image_url}
                alt="Map"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full rounded-lg object-contain max-h-72 border border-outline-variant"
              />
            </div>
          </div>
        )}
        
        {/* Capital letter hint */}
        <div className="elevo-card elevo-card-border px-4 py-3">
          <p className="text-[11px] font-medium text-on-surface-variant">
            Write the letter that matches each place on the map.{" "}
            <span className="font-black text-on-surface tracking-wide">WRITE IN CAPITAL LETTERS.</span>
          </p>
        </div>

        {/* Place input cards - PLACES are in answers, LETTERS are in questions */}
        <div className="flex flex-col gap-2.5">
          {listening.part4.answers.map((place, idx) => {
            const letter = part4Matches[place.id] || ""
            const isEmpty = !letter
            const isValid = !!letter && listening.part4.questions.some(q => 
              q.text.toUpperCase() === letter.toUpperCase()
            )
            
            return (
              <div
                key={place.id}
                className={`elevo-card elevo-card-border flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  !isEmpty && isValid ? "border-green-500/60 bg-green-500/5" : ""
                } ${
                  !isEmpty && !isValid ? "border-error/60 bg-error/5" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-black text-white">{19 + idx}</span>
                </div>
                <p className="flex-1 text-sm font-semibold text-on-surface">{place.text}</p>
                <div
                  className={`relative w-11 h-11 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isEmpty
                      ? "border-outline-variant bg-surface hover:border-indigo-500/60"
                      : isValid
                      ? "border-green-500 bg-green-500/10"
                      : "border-error bg-error/10"
                  }`}
                >
                  <input
                    type="text"
                    maxLength={1}
                    value={letter}
                    onChange={(e) => handlePart4Select(place.id, e.target.value.toUpperCase())}
                    aria-label={`Question ${19 + idx}: ${place.text}. Enter matching letter`}
                    className="absolute inset-0 w-full h-full text-center text-lg font-black text-on-surface bg-transparent border-none outline-none uppercase caret-transparent"
                  />
                  {!letter && (
                    <span className="text-lg font-black text-on-surface-variant/40 pointer-events-none select-none">?</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Part 5 Content ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 5
          </span>
          <span className="text-xs text-on-surface-variant">— Extract MCQ (24-29)</span>
        </div>
        {listening.part5.instruction && (
          <p className="text-xs text-on-surface-variant">{listening.part5.instruction}</p>
        )}
        
        <div className="flex flex-col gap-6">
          {listening.part5.extracts.map((extract) => (
            <div key={extract.id} className="flex flex-col gap-3">
              {/* Extract label */}
              <div className="p-2 rounded-lg bg-indigo-500/10 border-l-4 border-indigo-500">
                <p className="text-xs font-bold text-indigo-600">{extract.extract}</p>
              </div>
              
              {/* Questions for this extract */}
              {extract.questions.map((q) => {
                const globalNum = q.global_number
                return (
                  <ListeningPart5Mcq
                    key={q.id}
                    question={q}
                    questionNumber={globalNum}
                    selectedAnswerId={part5Answers[q.id]}
                    onSelect={handlePart5Select}
                    isLocked={false}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Part 6 Content ─────────────────────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 6
          </span>
          <span className="text-xs text-on-surface-variant">— Gap Filling (30-35)</span>
        </div>
        {listening.part6.instruction && (
          <p className="text-xs text-on-surface-variant">{listening.part6.instruction}</p>
        )}
        <div className="rounded-xl p-4 elevo-card-border bg-surface-container-low">
          <ListeningPart6GapText
            text={listening.part6.question}
            positions={listening.part6.positions.map(p => p.position)}
            answers={part6Answers}
            onAnswerChange={handlePart6Change}
            disabled={false}
          />
        </div>
      </div>

      {/* ── Submit Button ─────────────────────────────────────────────────── */}
      {/* Not sticky in middle - just at the end of content */}
      <div className="mt-4">
        <div className="elevo-card elevo-card-border p-3 bg-surface/95 backdrop-blur-sm">
          <Button
            size="lg"
            color="primary"
            onClick={() => {
              console.log('🔥🔥🔥 BUTTON CLICKED IN COMPONENT 🔥🔥🔥')
              console.log('📊 Button state:', { submitting, answeredCount, totalQuestionsCount })
              handleSubmit()
            }}
            isDisabled={submitting}
            isLoading={submitting}
            className="w-full font-bold"
          >
            Submit All Answers
          </Button>
        </div>
      </div>
    </div>
  )
}
