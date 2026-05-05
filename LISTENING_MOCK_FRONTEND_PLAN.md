# Listening Full Mock - Frontend Integration Plan

## CURRENT FRONTEND STRUCTURE (OLD - Complex State Management)

### Hook State
**File:** `elevo-app/src/hooks/listening/mock/use-listening-mock.ts`

**Current State (6 separate answer objects):**
```typescript
const [part1Answers, setPart1Answers] = useState<Record<number, number>>({}) // position -> answerId
const [part2Answers, setPart2Answers] = useState<Record<number, string>>({}) // position -> text
const [part3Matches, setPart3Matches] = useState<Record<number, number>>({}) // questionId -> answerId
const [part4Matches, setPart4Matches] = useState<Record<number, string>>({}) // questionId -> letter
const [part5Answers, setPart5Answers] = useState<Record<number, number>>({}) // questionId -> answerId
const [part6Answers, setPart6Answers] = useState<Record<number, string>>({}) // position -> text
```

**PROBLEMS:**
- ❌ 6 separate state objects (complex management)
- ❌ Different data types per part (number, string, etc.)
- ❌ Complex submit logic to build nested payload
- ❌ Not following Reading Mock simple pattern

### API Types
**File:** `elevo-app/src/lib/api/listening-mock.ts`

**Current Types (Complex Nested):**
```typescript
export interface ListeningFullMockQuestionsResponse {
  exam_id: number
  listening: {
    part1: {
      id: number
      title: string
      instruction: string
      question: string
      audio_url: string
      answers: Array<{
        id: number
        position: number
        answer: string
        global_number: number
      }>
    }
    // ... complex nested structure for all parts
  }
}

export interface ListeningFullMockEvaluateRequest {
  exam_id: number
  answers: {
    part1: Record<string, any>
    part2: Record<string, any>
    // ... nested per part
  }
}
```

**PROBLEMS:**
- ❌ Complex nested types
- ❌ No resource_ids
- ❌ Not matching Reading Mock pattern

---

## NEW FRONTEND STRUCTURE (Target - Simple Professional)

### Hook State (SIMPLIFIED - Single Answers Object)
**File:** `elevo-app/src/hooks/listening/mock/use-listening-mock.ts`

**NEW State (Single global answers object):**
```typescript
// ── Global answers (positions 1-35) ────────────────────────────────────────
const [answers, setAnswers] = useState<Record<string, string>>({})

// Refs for stable access in callbacks
const examDataRef = useRef(examData)
const answersRef = useRef(answers)

useEffect(() => { examDataRef.current = examData }, [examData])
useEffect(() => { answersRef.current = answers }, [answers])
```

**Benefits:**
- ✅ Single state object (simple management)
- ✅ All answers are strings (consistent type)
- ✅ Global numbering (1-35)
- ✅ Matches Reading Mock pattern exactly

### API Types (SIMPLIFIED)
**File:** `elevo-app/src/lib/api/listening-mock.ts`

**NEW Types (Following Reading Mock):**
```typescript
export interface ListeningMockResourceIds {
  part1_question_id: number
  part2_question_id: number
  part3_question_id: number
  part4_question_id: number
  part5_question_id: number
  part6_question_id: number
}

export interface ListeningMockQuestionResponse {
  exam_id: number
  resource_ids: ListeningMockResourceIds
  part1: {
    global_start: number  // 1
    global_end: number    // 8
    title: string
    instruction: string
    question: string
    audio_url: string
    questions: Array<{
      position: number
      question: string
      answers: Array<{
        letter: string  // A, B, C, D
        text: string
      }>
    }>
  }
  part2: {
    global_start: number  // 9
    global_end: number    // 13
    title: string
    instruction: string
    question: string  // Text with _1_, _2_, etc.
    audio_url: string
    positions: number[]  // [1, 2, 3, 4, 5]
  }
  part3: {
    global_start: number  // 14
    global_end: number    // 18
    title: string
    instruction: string
    audio_url: string
    speakers: Array<{
      position: number
      text: string
    }>
    options: Array<{
      letter: string  // A, B, C, D, E, F
      text: string
    }>
  }
  part4: {
    global_start: number  // 19
    global_end: number    // 23
    title: string
    instruction: string
    audio_url: string
    map_image_url: string
    places: Array<{
      position: number
      text: string
    }>
    options_count: number  // 6, 7, or 8
  }
  part5: {
    global_start: number  // 24
    global_end: number    // 29
    title: string
    instruction: string
    audio_url: string
    extracts: Array<{
      extract_number: number
      audio_url: string
      questions: Array<{
        position: number
        question: string
        answers: Array<{
          letter: string  // A, B, C
          text: string
        }>
      }>
    }>
  }
  part6: {
    global_start: number  // 30
    global_end: number    // 35
    title: string
    instruction: string
    question: string  // Text with _1_, _2_, etc.
    audio_url: string
    positions: number[]  // [1, 2, 3, 4, 5, 6]
  }
}

export interface ListeningMockEvaluateRequest {
  resource_ids: ListeningMockResourceIds
  answers: Record<string, string>  // {"1": "A", "2": "text", ...}
}

export interface ListeningMockResultItem {
  is_correct: boolean
  user_answer: string
  correct_answer: string
}

export interface ListeningMockPartDetail {
  question?: {
    id: number
    title: string
    instruction: string
    audio_url: string
  }
  summary: {
    correct_count: number
    total: number
    score_percent: number
  }
}

export interface ListeningMockEvaluateResponse {
  attempt_id: number
  overall_score_percent: number
  total_correct: number
  total_questions: number
  cefr_level: string
  results: Record<string, ListeningMockResultItem>  // {"1": {...}, "2": {...}, ..., "35": {...}}
  part_details: {
    part1?: ListeningMockPartDetail
    part2?: ListeningMockPartDetail
    part3?: ListeningMockPartDetail
    part4?: ListeningMockPartDetail
    part5?: ListeningMockPartDetail
    part6?: ListeningMockPartDetail
  }
}
```

---

## FRONTEND IMPLEMENTATION TASKS

### Task 1: Update API Types
**File:** `elevo-app/src/lib/api/listening-mock.ts`

**Changes:**
1. Replace old complex types with new simple types (shown above)
2. Update API functions to use new types
3. Add cache busting to GET request (like Reading Mock)

**Code:**
```typescript
export async function getListeningMockQuestion(): Promise<ListeningMockQuestionResponse> {
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || "1")
  const { data } = await apiClient.get<ListeningMockQuestionResponse>(
    `/api/multilevel/${examId}/listening/all/question/`,
    {
      params: { _t: Date.now() }  // Cache busting
    }
  )
  return data
}

export async function evaluateListeningMock(
  payload: ListeningMockEvaluateRequest
): Promise<ListeningMockEvaluateResponse> {
  const examId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EXAM_ID || "1")
  const { data } = await apiClient.post<ListeningMockEvaluateResponse>(
    `/api/multilevel/${examId}/listening/all/evaluate/`,
    payload
  )
  return data
}
```

### Task 2: Update Hook State Management
**File:** `elevo-app/src/hooks/listening/mock/use-listening-mock.ts`

**Changes:**
1. Replace 6 separate answer states with single `answers` object
2. Update handlers to use global positions (1-35)
3. Simplify submit logic (no complex payload building)
4. Keep audio sequence logic (no changes needed)

**Code Pattern:**
```typescript
export function useListeningMock() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<ListeningMockQuestionResponse | null>(null)
  const [result, setResult] = useState<ListeningMockEvaluateResponse | null>(null)

  // ── Global answers (positions 1-35) ────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Refs for stable access in callbacks
  const examDataRef = useRef(examData)
  const answersRef = useRef(answers)

  useEffect(() => { examDataRef.current = examData }, [examData])
  useEffect(() => { answersRef.current = answers }, [answers])

  // ── Audio state (NO CHANGES) ───────────────────────────────────────────────
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentAudioPhase, setCurrentAudioPhase] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const allAudiosRef = useRef<HTMLAudioElement[]>([])

  // ... audio functions (no changes)

  // ── Load questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getListeningMockQuestion()
      .then((data) => {
        if (cancelled) return
        setExamData(data)

        // Initialize empty answers for all 35 positions
        const initialAnswers: Record<string, string> = {}
        for (let i = 1; i <= 35; i++) {
          initialAnswers[i.toString()] = ""
        }
        setAnswers(initialAnswers)

        setLoading(false)
        startAudioSequence(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || "Failed to load")
        setLoading(false)
      })

    return () => {
      cancelled = true
      stopAudio()
    }
  }, [])

  // ── Answer handlers (global positions 1-35) ─────────────────────────────────
  const handleAnswerChange = useCallback((globalPosition: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [globalPosition.toString()]: value }))
  }, [])

  // ── Part-specific handlers (convert to global positions) ───────────────────
  // Part 1: positions 1-8 (MCQ with letters A/B/C/D)
  const handlePart1Select = useCallback((position: number, letter: string) => {
    const globalPosition = position  // Part 1: 1-8
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 2: positions 9-13 (text input)
  const handlePart2Change = useCallback((position: number, value: string) => {
    const globalPosition = 8 + position  // Part 2: 9-13
    handleAnswerChange(globalPosition, value)
  }, [handleAnswerChange])

  // Part 3: positions 14-18 (speaker matching with letters A-F)
  const handlePart3Select = useCallback((speakerPosition: number, letter: string) => {
    const globalPosition = 13 + speakerPosition  // Part 3: 14-18
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 4: positions 19-23 (map task with letters A-H)
  const handlePart4Select = useCallback((placePosition: number, letter: string) => {
    const globalPosition = 18 + placePosition  // Part 4: 19-23
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 5: positions 24-29 (MCQ with letters A/B/C)
  const handlePart5Select = useCallback((position: number, letter: string) => {
    const globalPosition = 23 + position  // Part 5: 24-29
    handleAnswerChange(globalPosition, letter)
  }, [handleAnswerChange])

  // Part 6: positions 30-35 (text input)
  const handlePart6Change = useCallback((position: number, value: string) => {
    const globalPosition = 29 + position  // Part 6: 30-35
    handleAnswerChange(globalPosition, value)
  }, [handleAnswerChange])

  // ── Submit (SIMPLIFIED) ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const data = examDataRef.current
    const currentAnswers = answersRef.current
    
    if (!data || submitting) return

    setSubmitting(true)
    stopAudio()

    try {
      const payload = {
        resource_ids: data.resource_ids,
        answers: currentAnswers,  // Simple format: {"1": "A", "2": "text", ...}
      }

      const res = await evaluateListeningMock(payload)
      setResult(res)
    } catch (err: any) {
      setError(err?.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }, [submitting, stopAudio])

  // ── Retry ───────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    stopAudio()
    setResult(null)
    setError(null)
    setAnswers({})
    setCurrentAudioPhase("")
    setLoading(true)

    getListeningMockQuestion()
      .then((data) => {
        setExamData(data)
        
        const initialAnswers: Record<string, string> = {}
        for (let i = 1; i <= 35; i++) {
          initialAnswers[i.toString()] = ""
        }
        setAnswers(initialAnswers)

        setLoading(false)
        startAudioSequence(data)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load")
        setLoading(false)
      })
  }, [startAudioSequence, stopAudio])

  // ── Computed ────────────────────────────────────────────────────────────────
  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length
  const totalQuestionsCount = 35

  // ── Convert global answers to part-specific format for UI ──────────────────
  // Part 1: positions 1-8
  const part1Answers: Record<number, string> = {}
  for (let i = 1; i <= 8; i++) {
    part1Answers[i] = answers[i.toString()] || ""
  }

  // Part 2: positions 9-13
  const part2Answers: Record<number, string> = {}
  for (let i = 1; i <= 5; i++) {
    const globalPos = 8 + i
    part2Answers[i] = answers[globalPos.toString()] || ""
  }

  // Part 3: positions 14-18
  const part3Matches: Record<number, string> = {}
  for (let i = 1; i <= 5; i++) {
    const globalPos = 13 + i
    const letter = answers[globalPos.toString()] || ""
    if (letter) part3Matches[i] = letter
  }

  // Part 4: positions 19-23
  const part4Matches: Record<number, string> = {}
  for (let i = 1; i <= 5; i++) {
    const globalPos = 18 + i
    const letter = answers[globalPos.toString()] || ""
    if (letter) part4Matches[i] = letter
  }

  // Part 5: positions 24-29
  const part5Answers: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    const globalPos = 23 + i
    part5Answers[i] = answers[globalPos.toString()] || ""
  }

  // Part 6: positions 30-35
  const part6Answers: Record<number, string> = {}
  for (let i = 1; i <= 6; i++) {
    const globalPos = 29 + i
    part6Answers[i] = answers[globalPos.toString()] || ""
  }

  return {
    // State
    loading,
    submitting,
    error,
    examData,
    result,

    // Audio state
    isAudioPlaying,
    currentAudioPhase,

    // Answers (part-specific format for UI compatibility)
    part1Answers,
    part2Answers,
    part3Matches,
    part4Matches,
    part5Answers,
    part6Answers,

    // Handlers
    handlePart1Select,
    handlePart2Change,
    handlePart3Select,
    handlePart4Select,
    handlePart5Select,
    handlePart6Change,

    // Submit
    handleSubmit,
    retry,

    // Computed
    answeredCount,
    totalQuestionsCount,
    
    // Audio control
    stopAudio,
  }
}
```

### Task 3: Update Content Component
**File:** `elevo-app/src/components/elevo/listening/mock/listening-mock-content.tsx`

**Changes:**
1. Update to use new data structure from hook
2. Update Part 1 to use letter-based selection (not answer ID)
3. Update Part 3 to use letter-based selection (not answer ID)
4. Update Part 4 to use letter-based selection (already correct)
5. Update Part 5 to use letter-based selection (not answer ID)
6. Keep Part 2 and Part 6 text input (no changes)

**Code Pattern (Part 1 Example):**
```typescript
{/* Part 1: MCQ with letters */}
{examData.part1.questions.map((q) => {
  const globalPosition = q.position  // 1-8
  const selectedLetter = part1Answers[q.position] || ""
  
  return (
    <div key={q.position} className="space-y-3">
      <p className="font-medium">Question {q.position}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.answers.map((ans) => (
          <Button
            key={ans.letter}
            variant={selectedLetter === ans.letter ? "default" : "outline"}
            onClick={() => handlePart1Select(q.position, ans.letter)}
            className="justify-start"
          >
            {ans.letter}. {ans.text}
          </Button>
        ))}
      </div>
    </div>
  )
})}
```

### Task 4: Update Result Component
**File:** `elevo-app/src/components/elevo/listening/mock/listening-mock-result.tsx`

**Changes:**
1. Update to use new result structure (global results 1-35)
2. Use shared `AnswerCard` component for answer review grid
3. Update accordion to use `part_details` from response

**Code Pattern:**
```typescript
export function ListeningMockResult({ result, onRetry }: Props) {
  // Build answer cards data (1-35)
  const answerCards = Object.entries(result.results).map(([position, item]) => ({
    position: parseInt(position),
    isCorrect: item.is_correct,
    userAnswer: item.user_answer,
    correctAnswer: item.correct_answer,
  }))

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {result.overall_score_percent.toFixed(1)}%
        </h2>
        <p className="text-muted-foreground">
          {result.total_correct} / {result.total_questions} correct
        </p>
        <Badge>{result.cefr_level}</Badge>
      </div>

      {/* Answer Cards Grid (1-35) */}
      <div className="grid grid-cols-5 gap-2">
        {answerCards.map((card) => (
          <AnswerCard
            key={card.position}
            position={card.position}
            isCorrect={card.isCorrect}
          />
        ))}
      </div>

      {/* Accordion with part details */}
      <Accordion type="single" collapsible>
        {result.part_details.part1 && (
          <AccordionItem value="part1">
            <AccordionTrigger>
              Part 1 ({result.part_details.part1.summary.correct_count}/
              {result.part_details.part1.summary.total})
            </AccordionTrigger>
            <AccordionContent>
              {/* Part 1 review content */}
            </AccordionContent>
          </AccordionItem>
        )}
        {/* ... other parts */}
      </Accordion>

      <Button onClick={onRetry} className="w-full">
        Try Again
      </Button>
    </div>
  )
}
```

### Task 5: Update Review Accordion Component
**File:** `elevo-app/src/components/elevo/listening/mock/listening-mock-review-accordion.tsx`

**Changes:**
1. Update to use new `part_details` structure
2. Display audio player for each part
3. Display questions with correct answers

**Code Pattern:**
```typescript
interface Props {
  partDetails: ListeningMockEvaluateResponse["part_details"]
  examData: ListeningMockQuestionResponse
}

export function ListeningMockReviewAccordion({ partDetails, examData }: Props) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {/* Part 1 */}
      {partDetails.part1 && (
        <AccordionItem value="part1">
          <AccordionTrigger>
            <div className="flex items-center justify-between w-full pr-4">
              <span>Part 1: Listening</span>
              <span className="text-sm text-muted-foreground">
                {partDetails.part1.summary.correct_count}/
                {partDetails.part1.summary.total} correct
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Audio Player */}
              {partDetails.part1.question.audio_url && (
                <ListeningAudioPlayer 
                  audioUrl={partDetails.part1.question.audio_url}
                />
              )}
              
              {/* Questions */}
              {examData.part1.questions.map((q) => (
                <div key={q.position} className="space-y-2">
                  <p className="font-medium">Question {q.position}</p>
                  {/* Show answers with correct indicator */}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
      
      {/* ... other parts */}
    </Accordion>
  )
}
```

---

## FRONTEND TESTING CHECKLIST

### Test 1: Data Loading
- [ ] GET request returns new structure with resource_ids
- [ ] All 6 parts have global_start and global_end
- [ ] Part 1 has questions array with letter-based answers
- [ ] Part 2 has positions array
- [ ] Part 3 has speakers and options arrays
- [ ] Part 4 has places array and map_image_url
- [ ] Part 5 has extracts array with questions
- [ ] Part 6 has positions array

### Test 2: Answer Input
- [ ] Part 1: Can select letters A/B/C/D
- [ ] Part 2: Can type text in inputs
- [ ] Part 3: Can select letters A-F for speakers
- [ ] Part 4: Can select letters A-H for places
- [ ] Part 5: Can select letters A/B/C for questions
- [ ] Part 6: Can type text in inputs
- [ ] All answers stored in single global object (1-35)

### Test 3: Submit
- [ ] Submit builds simple payload with resource_ids and answers
- [ ] POST request succeeds
- [ ] Response has global results (1-35)
- [ ] Response has part_details for accordion

### Test 4: Result Display
- [ ] Answer cards show all 35 positions
- [ ] Correct/incorrect colors display properly
- [ ] Accordion shows all 6 parts
- [ ] Each part shows correct count and total
- [ ] Audio players work in accordion

### Test 5: Audio Sequence
- [ ] Audio plays automatically on load
- [ ] Audio sequence goes through all 6 parts
- [ ] Audio stops when navigating away
- [ ] Audio stops when submitting

---

## SUMMARY

**Frontend Changes:**
1. ✅ Single answers state object (not 6 separate states)
2. ✅ Global numbering (1-35) throughout
3. ✅ Letter-based answers for MCQ parts (not IDs)
4. ✅ Simple submit payload (resource_ids + answers)
5. ✅ Global results display (1-35)
6. ✅ Part details accordion
7. ✅ Matches Reading Mock pattern exactly

**Benefits:**
- ✅ Simpler state management
- ✅ Consistent data types (all strings)
- ✅ Easier to debug
- ✅ Professional structure
- ✅ Reusable components (AnswerCard, etc.)
- ✅ Better UX (single scrollable page)
