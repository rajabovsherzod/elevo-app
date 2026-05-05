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

// Reuse existing part UI components
import { ListeningPart2GapText } from "@/components/elevo/listening/part-2/listening-part2-gap-text"
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
    stopAudio,
  } = useListeningMock()

  // Orqaga bosganda audio to'xtatish
  const handleBack = () => {
    stopAudio()
    window.history.back()
  }

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

      {/* ── Part 1 Content (NEW STRUCTURE - Letter-based) ─────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 1
          </span>
          <span className="text-xs text-on-surface-variant">— Multiple Choice (1-8)</span>
        </div>
        {examData.part1.instruction && (
          <p className="text-xs text-on-surface-variant">{examData.part1.instruction}</p>
        )}
        
        <div className="flex flex-col gap-4">
          {examData.part1.questions.map((q) => {
            const selectedLetter = part1Answers[q.position] || ""
            
            return (
              <div key={q.position} className="elevo-card elevo-card-border p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs font-black text-white">{q.position}</span>
                  </span>
                  <p className="text-sm font-semibold text-on-surface">{q.question}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {q.answers.map((ans) => {
                    const isSelected = selectedLetter === ans.letter
                    return (
                      <button
                        key={ans.letter}
                        type="button"
                        onClick={() => handlePart1Select(q.position, ans.letter)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-left ${
                          isSelected
                            ? "bg-primary text-white shadow-md"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.98]"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-black ${
                          isSelected ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {ans.letter}
                        </span>
                        <span className="flex-1">{ans.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Part 2 Content (NEW STRUCTURE) ─────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 2
          </span>
          <span className="text-xs text-on-surface-variant">— Gap Filling (9-13)</span>
        </div>
        {examData.part2.instruction && (
          <p className="text-xs text-on-surface-variant">{examData.part2.instruction}</p>
        )}
        <div className="rounded-xl p-4 elevo-card-border bg-surface-container-low">
          <ListeningPart2GapText
            text={examData.part2.question}
            positions={examData.part2.positions}
            answers={part2Answers}
            onAnswerChange={handlePart2Change}
            disabled={false}
          />
        </div>
      </div>

      {/* ── Part 3 Content (NEW STRUCTURE - Letter-based) ─────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 3
          </span>
          <span className="text-xs text-on-surface-variant">— Speaker Matching (14-18)</span>
        </div>
        {examData.part3.instruction && (
          <p className="text-xs text-on-surface-variant">{examData.part3.instruction}</p>
        )}
        
        {/* Options display */}
        <div className="p-3 rounded-lg bg-surface-container-low">
          <p className="text-xs font-bold text-on-surface-variant mb-2">OPTIONS:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {examData.part3.options.map((opt) => (
              <div key={opt.letter} className="text-xs text-on-surface">
                <span className="font-bold">{opt.letter}.</span> {opt.text}
              </div>
            ))}
          </div>
        </div>

        {/* Speaker cards */}
        <div className="flex flex-col gap-3">
          {examData.part3.speakers.map((speaker) => {
            const selectedLetter = part3Matches[speaker.position] || ""
            
            return (
              <div key={speaker.position} className="elevo-card elevo-card-border p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs font-black text-white">{13 + speaker.position}</span>
                  </span>
                  <p className="text-sm font-semibold text-on-surface">{speaker.text}</p>
                </div>
                
                <div className="grid grid-cols-6 gap-1.5">
                  {examData.part3.options.map((opt) => {
                    const isSelected = selectedLetter === opt.letter
                    return (
                      <button
                        key={opt.letter}
                        type="button"
                        onClick={() => handlePart3Select(speaker.position, opt.letter)}
                        className={`h-10 rounded-lg text-xs font-black flex items-center justify-center transition-all duration-200 w-full ${
                          isSelected
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95"
                        }`}
                      >
                        {opt.letter}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Part 4 Content (Individual Part 4 Pattern) ────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 4
          </span>
          <span className="text-xs text-on-surface-variant">— Place Matching (19-23)</span>
        </div>
        {examData.part4.instruction && (
          <p className="text-xs text-on-surface-variant">{examData.part4.instruction}</p>
        )}

        {/* Map image */}
        {examData.part4.map_image_url && (
          <div className="elevo-card elevo-card-border overflow-hidden">
            <div className="px-4 py-3 bg-surface-container/60">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Map
              </p>
            </div>
            <div className="p-3">
              <img
                src={examData.part4.map_image_url}
                alt="Map"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full rounded-lg object-contain max-h-72 border border-outline-variant"
              />
            </div>
          </div>
        )}

        {/* Place cards with letter options */}
        <div className="flex flex-col gap-3">
          {examData.part4.places.map((place) => {
            const selectedLetter = part4Matches[place.position] || ""
            // Generate available letters based on options_count (A-F, A-G, or A-H)
            const availableLetters = Array.from(
              { length: examData.part4.options_count },
              (_, i) => String.fromCharCode(65 + i)
            )
            
            return (
              <div key={place.position} className="elevo-card elevo-card-border p-4 flex flex-col gap-3 transition-all">
                {/* Place label */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center bg-indigo-500 text-white shadow-sm flex-shrink-0">
                    {18 + place.position}
                  </span>
                  <span className="text-sm font-bold text-on-surface">{place.text}</span>
                </div>

                {/* Letter option chips — full width grid */}
                <div
                  className={`grid gap-1.5 ${
                    examData.part4.options_count === 6 ? "grid-cols-3 sm:grid-cols-6" :
                    examData.part4.options_count === 7 ? "grid-cols-4 sm:grid-cols-7" :
                    "grid-cols-4 sm:grid-cols-8"
                  }`}
                >
                  {availableLetters.map((letter) => {
                    const isSelected = selectedLetter === letter
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handlePart4Select(place.position, letter)}
                        className={`h-10 rounded-lg text-xs font-black flex items-center justify-center transition-all duration-200 w-full ${
                          isSelected
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105 active:scale-95"
                        }`}
                      >
                        {letter}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Part 5 Content (NEW STRUCTURE - Letter-based) ─────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 5
          </span>
          <span className="text-xs text-on-surface-variant">— Extract MCQ (24-29)</span>
        </div>
        {examData.part5.instruction && (
          <p className="text-xs text-on-surface-variant">{examData.part5.instruction}</p>
        )}
        
        <div className="flex flex-col gap-6">
          {examData.part5.extracts.map((extract) => (
            <div key={extract.extract_number} className="flex flex-col gap-3">
              {/* Extract label */}
              <div className="p-2 rounded-lg bg-indigo-500/10 border-l-4 border-indigo-500">
                <p className="text-xs font-bold text-indigo-600">Extract {extract.extract_number}</p>
              </div>
              
              {/* Questions for this extract */}
              {extract.questions.map((q) => {
                const selectedLetter = part5Answers[q.position] || ""
                
                return (
                  <div key={q.position} className="elevo-card elevo-card-border p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xs font-black text-white">{23 + q.position}</span>
                      </span>
                      <p className="text-sm font-semibold text-on-surface">{q.question}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {q.answers.map((ans) => {
                        const isSelected = selectedLetter === ans.letter
                        return (
                          <button
                            key={ans.letter}
                            type="button"
                            onClick={() => handlePart5Select(q.position, ans.letter)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-left ${
                              isSelected
                                ? "bg-primary text-white shadow-md"
                                : "bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-[0.98]"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-black ${
                              isSelected ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant"
                            }`}>
                              {ans.letter}
                            </span>
                            <span className="flex-1">{ans.text}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Part 6 Content (NEW STRUCTURE) ─────────────────────────────────── */}
      <div className="elevo-card elevo-card-border p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Part 6
          </span>
          <span className="text-xs text-on-surface-variant">— Gap Filling (30-35)</span>
        </div>
        {examData.part6.instruction && (
          <p className="text-xs text-on-surface-variant">{examData.part6.instruction}</p>
        )}
        <div className="rounded-xl p-4 elevo-card-border bg-surface-container-low">
          <ListeningPart6GapText
            text={examData.part6.question}
            positions={examData.part6.positions}
            answers={part6Answers}
            onAnswerChange={handlePart6Change}
            disabled={false}
          />
        </div>
      </div>

      {/* ── Progress + Submit Button (Card Wrapper) ──────────────────────────── */}
      <div className="elevo-card elevo-card-border p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                answeredCount === totalQuestionsCount 
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                  : "bg-primary animate-pulse"
              }`} />
              <span className="text-sm font-semibold text-on-surface">
                {answeredCount}/{totalQuestionsCount}
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">
              {answeredCount === totalQuestionsCount ? "All answered" : "answered"}
            </span>
          </div>

          {/* Submit Button */}
          <Button
            size="md"
            color="primary"
            onClick={handleSubmit}
            isDisabled={false}
            isLoading={submitting}
          >
            Submit Answers
          </Button>
        </div>
      </div>
    </div>
  )
}
