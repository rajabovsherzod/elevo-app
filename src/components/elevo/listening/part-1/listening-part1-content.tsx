"use client"

import { Button }             from "@/components/base/buttons/button"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"
import { ExamLoading }        from "@/components/elevo/shared/exam-loading"
import { ListeningPart1Mcq }  from "./listening-part1-mcq"
import { ListeningPart1Result } from "./listening-part1-result"
import { useListeningPart1 }  from "./use-listening-part1"

// ── Audio waveform indicator ───────────────────────────────────────────────────
function AudioBar({ isPlaying, label }: { isPlaying: boolean; label: string }) {
  const bars = [3, 5, 4, 7, 5, 3, 6, 4]
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant">
      <div className="flex items-end gap-[3px] h-5 flex-shrink-0">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-primary"
            style={{
              height: isPlaying ? `${h * 3}px` : "4px",
              transition: "height 0.2s ease",
              animation: isPlaying ? `pulse 0.9s ease-in-out ${i * 0.1}s infinite` : "none",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
    </div>
  )
}

// ── Loading block ──────────────────────────────────────────────────────────────
function LoadingBlock() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1 — Short Conversations" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <ExamLoading />
      </div>
    </div>
  )
}

// ── Error block ────────────────────────────────────────────────────────────────
function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1 — Short Conversations" />
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
          <span className="text-error text-xl">!</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface mb-1">Yuklashda xatolik</p>
          <p className="text-xs text-on-surface-variant">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" color="secondary" onClick={() => window.location.reload()}>
            Sahifani yangilash
          </Button>
          <Button size="sm" color="primary" onClick={onRetry}>
            Qayta urinish
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ListeningPart1Content() {
  const {
    phase,
    questions,
    audioUrl,
    answers,
    result,
    isAudioPlaying,
    errorMsg,
    totalAnswered,
    selectAnswer,
    submit,
    retry,
  } = useListeningPart1()

  // ── Phase: loading ───────────────────────────────────────────────────────────
  if (phase === "loading") return <LoadingBlock />

  // ── Phase: error ─────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <ErrorBlock
        message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
        onRetry={retry}
      />
    )
  }

  // ── Phase: result ────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <PageHeaderWithBack title="Part 1 — Results" />
        <ListeningPart1Result result={result} questions={questions} audioUrl={audioUrl} />
      </div>
    )
  }

  // ── Phases: instruction / question-audio / exam / submitting ─────────────────
  const instructionOnly = phase === "instruction"
  const canAnswer       = phase === "question-audio" || phase === "exam" || phase === "submitting"
  const canSubmit       = phase === "exam"

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeaderWithBack title="Part 1 — Short Conversations" />

      {/* Static instructions */}
      <div className="elevo-card elevo-card-border px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
          Instructions
        </p>
        <p className="text-sm text-on-surface leading-relaxed">
          You will hear some sentences. You will hear each sentence twice.
          Choose the correct reply to each sentence (A, B or C).
        </p>
      </div>

      {/* Audio status — shown while audio is playing */}
      {(phase === "instruction" || phase === "question-audio") && (
        <AudioBar
          isPlaying={isAudioPlaying}
          label={phase === "instruction" ? "Instructions" : "Question audio"}
        />
      )}

      {/* Progress bar — shown during answer phase */}
      {canAnswer && questions.length > 0 && (
        <div className="elevo-card elevo-card-border px-4 py-3 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {questions.length} ta savol
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {totalAnswered} / {questions.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Question cards */}
      {questions.length > 0 && (
        <div className="relative">
          <div className="flex flex-col gap-4">
            {questions.map((question, index) => (
              <ListeningPart1Mcq
                key={question.id}
                question={question}
                questionNumber={index + 1}
                selectedAnswerId={answers[question.id]}
                onSelect={selectAnswer}
                isLocked={instructionOnly}
              />
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      {(canSubmit || phase === "submitting") && questions.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="md"
            color="primary"
            isLoading={phase === "submitting"}
            isDisabled={phase === "submitting" || totalAnswered < questions.length}
            onClick={submit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
