"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  getWritingTask,
  evaluateWriting,
  type WritingTaskResponse,
  type WritingEvaluateResponse,
} from "@/lib/api/writing"

export type WritingPhase =
  | "loading"
  | "writing"
  | "submitting"
  | "result"
  | "error"

export const MIN_WORDS = 50
export const TASK_TYPE = "TASK1_1" as const

const LOAD_TIMEOUT_MS = 30_000

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length
}

export function useWritingPart1_1() {
  const [phase, setPhase]   = useState<WritingPhase>("loading")
  const [task, setTask]     = useState<WritingTaskResponse | null>(null)
  const [text, setText]     = useState("")
  const [result, setResult] = useState<WritingEvaluateResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setPhase("loading")
    setTask(null)
    setText("")
    setResult(null)
    setErrorMsg(null)

    let cancelled = false

    const timeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        setErrorMsg("So'rov juda uzoq davom etdi. Internet aloqasini tekshiring.")
        setPhase("error")
      }
    }, LOAD_TIMEOUT_MS)

    ;(async () => {
      try {
        const examId = parseInt(new URLSearchParams(window.location.search).get("exam_id") ?? "1") || 1
        const data = await getWritingTask(examId, TASK_TYPE)
        clearTimeout(timeout)
        if (cancelled) return
        setTask(data)
        setPhase("writing")
      } catch (err: any) {
        clearTimeout(timeout)
        if (cancelled) return
        setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
        setPhase("error")
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [retryKey])

  const submit = useCallback(async () => {
    if (!task) return
    setPhase("submitting")
    try {
      const [res] = await Promise.all([
        evaluateWriting({
          task_id: task.task_id,
          exam_id: task.exam_id,
          task_type: task.task_type,
          student_text: text,
        }),
        sleep(2000),
      ])
      setResult(res)
      setPhase("result")
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? err?.message ?? "Noma'lum xatolik")
      setPhase("error")
    }
  }, [task, text])

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  const wordCount = useMemo(() => countWords(text), [text])
  const canSubmit = wordCount >= MIN_WORDS

  return {
    phase,
    task,
    text,
    result,
    errorMsg,
    wordCount,
    canSubmit,
    setText,
    submit,
    retry,
  }
}
