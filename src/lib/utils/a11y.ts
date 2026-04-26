/**
 * Accessibility (A11y) Utilities
 * 
 * Professional ARIA label generators for WCAG 2.1 AA compliance.
 * 
 * Features:
 * - Screen reader friendly labels
 * - Keyboard navigation support
 * - Live region announcements
 * - Semantic HTML helpers
 */

/**
 * Generate ARIA label for exam question
 * 
 * @example
 * getQuestionAriaLabel(1, "What is the capital of France?")
 * // Returns: "Question 1: What is the capital of France?"
 */
export function getQuestionAriaLabel(questionNumber: number, questionText?: string): string {
  if (questionText) {
    return `Question ${questionNumber}: ${questionText}`
  }
  return `Question ${questionNumber}`
}

/**
 * Generate ARIA label for answer option
 * 
 * @example
 * getAnswerAriaLabel("A", "Paris", true)
 * // Returns: "Option A: Paris, selected"
 */
export function getAnswerAriaLabel(
  optionLabel: string,
  optionText: string,
  isSelected: boolean
): string {
  const selectedText = isSelected ? ", selected" : ""
  return `Option ${optionLabel}: ${optionText}${selectedText}`
}

/**
 * Generate ARIA label for gap filling input
 * 
 * @example
 * getGapFillingAriaLabel(1, 5, "The capital of France is ___")
 * // Returns: "Gap 1 of 5: Fill in the blank after 'The capital of France is'"
 */
export function getGapFillingAriaLabel(
  position: number,
  totalGaps: number,
  contextText?: string
): string {
  const baseLabel = `Gap ${position} of ${totalGaps}`
  
  if (contextText) {
    // Extract context around the gap (20 chars before)
    const context = contextText.slice(Math.max(0, contextText.length - 20))
    return `${baseLabel}: Fill in the blank after '${context}'`
  }
  
  return `${baseLabel}: Fill in the blank`
}

/**
 * Generate ARIA label for progress indicator
 * 
 * @example
 * getProgressAriaLabel(3, 10, "questions")
 * // Returns: "3 of 10 questions completed"
 */
export function getProgressAriaLabel(
  current: number,
  total: number,
  unit: string = "items"
): string {
  return `${current} of ${total} ${unit} completed`
}

/**
 * Generate ARIA label for timer
 * 
 * @example
 * getTimerAriaLabel(125)
 * // Returns: "Time remaining: 2 minutes and 5 seconds"
 */
export function getTimerAriaLabel(secondsLeft: number): string {
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  
  if (minutes === 0) {
    return `Time remaining: ${seconds} second${seconds !== 1 ? 's' : ''}`
  }
  
  if (seconds === 0) {
    return `Time remaining: ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  
  return `Time remaining: ${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
}

/**
 * Generate ARIA label for score/result
 * 
 * @example
 * getScoreAriaLabel(8, 10, 80)
 * // Returns: "Your score: 8 out of 10 correct, 80 percent"
 */
export function getScoreAriaLabel(
  correct: number,
  total: number,
  percentage: number
): string {
  return `Your score: ${correct} out of ${total} correct, ${percentage} percent`
}

/**
 * Generate ARIA label for matching question
 * 
 * @example
 * getMatchingAriaLabel("Paragraph A", "Heading 3", true)
 * // Returns: "Paragraph A matched with Heading 3"
 */
export function getMatchingAriaLabel(
  sourceLabel: string,
  targetLabel: string | null,
  isMatched: boolean
): string {
  if (!isMatched || !targetLabel) {
    return `${sourceLabel}: No match selected`
  }
  return `${sourceLabel} matched with ${targetLabel}`
}

/**
 * Generate ARIA live region announcement
 * 
 * @example
 * getLiveRegionAnnouncement("success", "Answer submitted successfully")
 * // Returns: "Success: Answer submitted successfully"
 */
export function getLiveRegionAnnouncement(
  type: "success" | "error" | "warning" | "info",
  message: string
): string {
  const prefix = type.charAt(0).toUpperCase() + type.slice(1)
  return `${prefix}: ${message}`
}

/**
 * Generate ARIA label for navigation button
 * 
 * @example
 * getNavigationAriaLabel("next", "Part 2")
 * // Returns: "Go to next section: Part 2"
 */
export function getNavigationAriaLabel(
  direction: "next" | "previous" | "back",
  destination?: string
): string {
  const directionText = {
    next: "next section",
    previous: "previous section",
    back: "previous page"
  }[direction]
  
  if (destination) {
    return `Go to ${directionText}: ${destination}`
  }
  
  return `Go to ${directionText}`
}

/**
 * Generate ARIA description for exam instructions
 * 
 * @example
 * getInstructionAriaDescription("Read the text and answer questions")
 * // Returns: "Instructions: Read the text and answer questions"
 */
export function getInstructionAriaDescription(instruction: string): string {
  return `Instructions: ${instruction}`
}

/**
 * Generate ARIA label for submit button
 * 
 * @example
 * getSubmitAriaLabel(8, 10, false)
 * // Returns: "Submit answers: 8 of 10 questions answered"
 */
export function getSubmitAriaLabel(
  answered: number,
  total: number,
  isDisabled: boolean
): string {
  if (isDisabled) {
    return `Submit answers: ${answered} of ${total} questions answered. Please answer all questions to submit.`
  }
  return `Submit answers: ${answered} of ${total} questions answered`
}

/**
 * Generate ARIA label for error message
 * 
 * @example
 * getErrorAriaLabel("Failed to load exam")
 * // Returns: "Error: Failed to load exam"
 */
export function getErrorAriaLabel(errorMessage: string): string {
  return `Error: ${errorMessage}`
}

/**
 * Generate ARIA label for loading state
 * 
 * @example
 * getLoadingAriaLabel("exam")
 * // Returns: "Loading exam, please wait"
 */
export function getLoadingAriaLabel(resource: string = "content"): string {
  return `Loading ${resource}, please wait`
}
