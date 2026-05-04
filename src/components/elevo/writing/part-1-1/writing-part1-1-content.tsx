"use client"

import { CalculatingResults } from "@/components/elevo/shared/calculating-results"
import { ListeningLoading, ListeningError } from "@/components/elevo/listening/shared"
import { WritingPart1_1Editor } from "./writing-part1-1-editor"
import { WritingPart1_1Result } from "./writing-part1-1-result"
import { useWritingPart1_1 } from "./use-writing-part1-1"

export function WritingPart1_1Content() {
  const {
    phase, task, text, result, errorMsg,
    wordCount, canSubmit,
    setText, submit, retry,
  } = useWritingPart1_1()

  if (phase === "loading") {
    return <ListeningLoading title="Part 1.1 — Informal Letter" />
  }

  if (phase === "error") {
    return (
      <ListeningError
        title="Part 1.1 — Informal Letter"
        message={errorMsg ?? "Noma'lum xatolik. Qayta urinib ko'ring."}
        onRetry={retry}
      />
    )
  }

  if (phase === "submitting") {
    return <CalculatingResults />
  }

  if (phase === "result" && result) {
    return <WritingPart1_1Result response={result} onRetry={retry} />
  }

  if (!task) return null

  return (
    <WritingPart1_1Editor
      task={task}
      text={text}
      wordCount={wordCount}
      canSubmit={canSubmit}
      isLocked={false}
      onTextChange={setText}
      onSubmit={submit}
    />
  )
}
