"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import { AnimatePresence, motion } from "framer-motion"
import type { ReadingMockQuestionResponse, ReadingMockEvaluateResponse } from "@/lib/api/reading"

// Reuse existing part review components
import { ReadingPart1ReviewAccordion } from "@/components/elevo/reading/part-1/reading-part1-review-accordion"
import { ReadingPart2ReviewAccordion } from "@/components/elevo/reading/part-2/reading-part2-review-accordion"
import { ReadingPart3ReviewAccordion } from "@/components/elevo/reading/part-3/reading-part3-review-accordion"
import { ReadingPart4ReviewAccordion } from "@/components/elevo/reading/part-4/reading-part4-review-accordion"
import { ReadingPart5ReviewAccordion } from "@/components/elevo/reading/part-5/reading-part5-review-accordion"

interface Props {
  examData: ReadingMockQuestionResponse
  result: ReadingMockEvaluateResponse
}

// Accordion Section Component
function AccordionSection({ 
  title, 
  isOpen, 
  onToggle, 
  children 
}: { 
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="elevo-card elevo-card-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        <span className="text-xs font-bold text-on-surface">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-on-surface-variant" />
        ) : (
          <ChevronDown className="w-4 h-4 text-on-surface-variant" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ReadingMockReviewAccordion({ examData, result }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    part1: false,
    part2: false,
    part3: false,
    part4: false,
    part5: false,
  })

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const partDetails = result.part_details || {}

  // Helper functions to extract part-specific results from global results
  const getPart1Results = () => {
    const part1Results: Record<string, any> = {}
    for (let i = 1; i <= 6; i++) {
      if (result.results[i.toString()]) {
        part1Results[i.toString()] = result.results[i.toString()]
      }
    }
    return part1Results
  }

  const getPart2Results = () => {
    const part2Results: Record<string, any> = {}
    for (let i = 7; i <= 14; i++) {
      const localPos = i - 6  // Convert global to local (7->1, 8->2, ...)
      if (result.results[i.toString()]) {
        part2Results[localPos.toString()] = result.results[i.toString()]
      }
    }
    return part2Results
  }

  const getPart3Results = () => {
    const part3Results: Record<string, any> = {}
    for (let i = 15; i <= 20; i++) {
      const localPos = i - 14  // Convert global to local (15->1, 16->2, ...)
      if (result.results[i.toString()]) {
        part3Results[localPos.toString()] = result.results[i.toString()]
      }
    }
    return part3Results
  }

  const getPart4Results = () => {
    const part4Results: Record<string, any> = {}
    for (let i = 21; i <= 29; i++) {
      const localPos = i - 20  // Convert global to local (21->1, 22->2, ...)
      if (result.results[i.toString()]) {
        part4Results[localPos.toString()] = result.results[i.toString()]
      }
    }
    return part4Results
  }

  const getPart5Results = () => {
    const part5Results: Record<string, any> = {}
    for (let i = 30; i <= 35; i++) {
      const localPos = i - 29  // Convert global to local (30->1, 31->2, ...)
      if (result.results[i.toString()]) {
        part5Results[localPos.toString()] = result.results[i.toString()]
      }
    }
    return part5Results
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Part 1 Details ───────────────────────────────────────────────────── */}
      {partDetails.part1 && examData.part1 && (
        <AccordionSection
          title={`Part 1 - Gap Filling (${partDetails.part1.summary.correct_count}/${partDetails.part1.summary.total})`}
          isOpen={openSections.part1}
          onToggle={() => toggleSection("part1")}
        >
          <ReadingPart1ReviewAccordion
            questionData={{
              ...examData.part1,
              exam_id: examData.exam_id,
              part: 1,
              question_id: examData.resource_ids.part1_question_id,
            }}
            result={{
              question: partDetails.part1.question,
              results: getPart1Results(),  // Extract from global results (1-6)
              summary: partDetails.part1.summary,
              // Backward compatibility fields
              correct_count: partDetails.part1.summary.correct_count,
              total_questions: partDetails.part1.summary.total,
              score_percent: partDetails.part1.summary.score_percent,
              details: Object.entries(getPart1Results()).map(([pos, item]: [string, any]) => ({
                question_id: examData.resource_ids.part1_question_id,
                position: parseInt(pos),
                user_answer: item.user_answer,
                correct_answer: item.correct_answer,
                correct: item.is_correct,
              })),
            } as any}
          />
        </AccordionSection>
      )}

      {/* ── Part 2 Details ───────────────────────────────────────────────────── */}
      {partDetails.part2 && (
        <AccordionSection
          title={`Part 2 - Matching Headings (${partDetails.part2.summary.correct_count}/${partDetails.part2.summary.total})`}
          isOpen={openSections.part2}
          onToggle={() => toggleSection("part2")}
        >
          <ReadingPart2ReviewAccordion
            questionData={partDetails.part2.set}
            results={getPart2Results()}  // Extract from global results (7-14 -> 1-8)
          />
        </AccordionSection>
      )}

      {/* ── Part 3 Details ───────────────────────────────────────────────────── */}
      {partDetails.part3 && (
        <AccordionSection
          title={`Part 3 - Matching Headings (${partDetails.part3.summary.correct_count}/${partDetails.part3.summary.total})`}
          isOpen={openSections.part3}
          onToggle={() => toggleSection("part3")}
        >
          <ReadingPart3ReviewAccordion
            result={{
              set: partDetails.part3.set,
              results: getPart3Results(),  // Extract from global results (15-20 -> 1-6)
              summary: partDetails.part3.summary,
            }}
          />
        </AccordionSection>
      )}

      {/* ── Part 4 Details ───────────────────────────────────────────────────── */}
      {partDetails.part4 && (
        <AccordionSection
          title={`Part 4 - MCQ + T/F/NG (${partDetails.part4.summary.correct_count}/${partDetails.part4.summary.total})`}
          isOpen={openSections.part4}
          onToggle={() => toggleSection("part4")}
        >
          <ReadingPart4ReviewAccordion
            questionData={partDetails.part4.text}
            questions={partDetails.part4.text.questions}
            results={getPart4Results()}
          />
        </AccordionSection>
      )}

      {/* ── Part 5 Details ───────────────────────────────────────────────────── */}
      {partDetails.part5 && (
        <AccordionSection
          title={`Part 5 - Gap Filling + MCQ (${partDetails.part5.summary.correct_count}/${partDetails.part5.summary.total})`}
          isOpen={openSections.part5}
          onToggle={() => toggleSection("part5")}
        >
          <ReadingPart5ReviewAccordion
            questionData={partDetails.part5.text}
            result={{
              text: partDetails.part5.text,
              results: getPart5Results(),  // Extract from global results (30-35 -> 1-6)
              summary: partDetails.part5.summary,
            }}
          />
        </AccordionSection>
      )}
    </div>
  )
}
