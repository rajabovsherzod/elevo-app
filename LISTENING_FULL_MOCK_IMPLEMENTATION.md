# Listening Full Mock Implementation Plan

## Overview
Listening Full Mock tizimini Reading Mock ga o'xshash professional tarzda implement qilish. Asosiy farqlar:
- **Stepper yo'q** - bitta scrollable page
- **Audio flow** - har bir part uchun intro → content → end audio ketma-ketligi
- **Global numbering** - 1-35 gacha raqamlash
- **Question distribution**: Part 1 (8q), Part 2 (5q), Part 3 (5q), Part 4 (5q), Part 5 (6q), Part 6 (6q) = 35 total

---

## TASK 1: Backend - Listening Questions API (listening_questions.py) ✅ COMPLETED

### 1.1 Create ListeningFullMockQuestionViewSet ✅ COMPLETED
**Maqsad**: Random 6 ta partni tanlab, global_number bilan qaytarish

**Qilish kerak**:
- [x] `ListeningAllPartsQuestionViewSet` ni yangilash yoki yangi `ListeningFullMockQuestionViewSet` yaratish
- [x] Har bir part uchun random question/set tanlash
- [x] Global numbering qo'shish:
  - Part 1: 1-8 (8 questions)
  - Part 2: 9-13 (5 positions)
  - Part 3: 14-18 (5 questions)
  - Part 4: 19-23 (5 questions)
  - Part 5: 24-29 (6 questions from extracts)
  - Part 6: 30-35 (6 positions)

**Response structure**:
```python
{
  "exam_id": 1,
  "listening": {
    "part1": {
      "id": 10,
      "title": "...",
      "instruction": "...",
      "question": "...",
      "audio_url": "...",
      "intro_audio_url": "/sounds/listening-part1.mp3",
      "end_audio_url": "/sounds/end-part1.mp3",
      "answers": [
        {"id": 1, "position": 1, "answer": "...", "global_number": 1},
        {"id": 2, "position": 2, "answer": "...", "global_number": 2},
        ...
      ]
    },
    "part2": {
      "id": 20,
      "title": "...",
      "instruction": "...",
      "question": "...",
      "audio_url": "...",
      "intro_audio_url": "/sounds/listening-part2.mp3",
      "end_audio_url": "/sounds/end-part2.mp3",
      "positions": [
        {"position": 1, "global_number": 9},
        {"position": 2, "global_number": 10},
        ...
      ]
    },
    "part3": {
      "title": "...",
      "instruction": "...",
      "audio_url": "...",
      "intro_audio_url": "/sounds/listening-part3.mp3",
      "end_audio_url": "/sounds/end-part3.mp3",
      "questions": [
        {"id": 1, "text": "...", "global_number": 14},
        {"id": 2, "text": "...", "global_number": 15},
        ...
      ],
      "answers": [
        {"id": 10, "text": "..."},
        {"id": 11, "text": "..."},
        ...
      ]
    },
    "part4": {
      "title": "...",
      "instruction": "...",
      "audio_url": "...",
      "image_url": "...",
      "intro_audio_url": "/sounds/listening-part4.mp3",
      "end_audio_url": "/sounds/end-part4.mp3",
      "questions": [
        {"id": 1, "text": "...", "global_number": 19},
        {"id": 2, "text": "...", "global_number": 20},
        ...
      ],
      "answers": [
        {"id": 10, "text": "..."},
        {"id": 11, "text": "..."},
        ...
      ]
    },
    "part5": {
      "instruction": "...",
      "intro_audio_url": "/sounds/listening-part5.mp3",
      "end_audio_url": "/sounds/end-part5.mp3",
      "extracts": [
        {
          "id": 1,
          "extract": "Extract 1",
          "title": "...",
          "instruction": "...",
          "audio_url": "...",
          "questions": [
            {
              "id": 100,
              "question": "...",
              "global_number": 24,
              "answers": [
                {"id": 1, "answer": "A", "is_correct": false},
                {"id": 2, "answer": "B", "is_correct": true},
                ...
              ]
            },
            ...
          ]
        },
        ...
      ]
    },
    "part6": {
      "id": 60,
      "title": "...",
      "instruction": "...",
      "question": "...",
      "audio_url": "...",
      "intro_audio_url": "/sounds/listening-part6.mp3",
      "end_audio_url": "/sounds/end-part6.mp3",
      "finish_audio_url": "/sounds/finish-mock.mp3",
      "positions": [
        {"position": 1, "global_number": 30},
        {"position": 2, "global_number": 31},
        ...
      ]
    }
  }
}
```

**Files to modify**:
- `smartexam/backend/multilevel/apis/listening_questions.py`

---

## TASK 2: Backend - Listening Evaluation API (listening.py) ✅ COMPLETED

### 2.1 Update ListeningAllPartsEvaluateViewSet ✅ COMPLETED
**Maqsad**: Full mock evaluation qilish, global_number bilan ishlash

**Qilish kerak**:
- [x] Payload structure ni Reading Mock ga moslashtirish
- [x] Global numbering support qo'shish
- [x] Har bir part uchun `correct_answer` yoki `correct_answer_id` qaytarish
- [x] Part-by-part breakdown va overall score hisoblash

**Expected payload**:
```python
{
  "exam_id": 1,
  "answers": {
    "part1": {
      "1": {"question_id": 10, "answer_id": 55, "global_number": 1},
      "2": {"question_id": 10, "answer_id": 56, "global_number": 2},
      ...
    },
    "part2": {
      "9": {"question_id": 20, "position": 1, "answer": "Paris", "global_number": 9},
      "10": {"question_id": 20, "position": 2, "answer": "London", "global_number": 10},
      ...
    },
    "part3": {
      "14": {"question_id": 30, "answer_question_id": 77, "global_number": 14},
      "15": {"question_id": 31, "answer_question_id": 78, "global_number": 15},
      ...
    },
    "part4": {
      "19": {"question_id": 40, "answer_question_id": 88, "global_number": 19},
      ...
    },
    "part5": {
      "24": {"question_id": 50, "answer_id": 100, "global_number": 24},
      ...
    },
    "part6": {
      "30": {"question_id": 60, "position": 1, "answer": "Monday", "global_number": 30},
      ...
    }
  }
}
```

**Expected response**:
```python
{
  "attempt_id": 123,
  "overall_score_percent": 85.71,
  "total_correct": 30,
  "total_questions": 35,
  "cefr_level": "C1",
  "parts": {
    "part1": {
      "correct_count": 7,
      "total_questions": 8,
      "score_percent": 87.5,
      "details": [
        {
          "question_id": 10,
          "answer_id": 55,
          "correct": true,
          "global_number": 1,
          "user_answer_text": "A",
          "correct_answer_id": 55,
          "correct_answer_text": "A"
        },
        ...
      ]
    },
    "part2": {
      "correct_count": 4,
      "total_questions": 5,
      "score_percent": 80.0,
      "details": [
        {
          "question_id": 20,
          "position": 1,
          "answer": "Paris",
          "correct": true,
          "global_number": 9,
          "correct_answer": "Paris"
        },
        ...
      ]
    },
    "part3": {
      "correct_count": 5,
      "total_questions": 5,
      "score_percent": 100.0,
      "details": [
        {
          "question_id": 30,
          "answer_question_id": 77,
          "correct": true,
          "global_number": 14,
          "correct_answer_id": 77
        },
        ...
      ]
    },
    "part4": {
      "correct_count": 4,
      "total_questions": 5,
      "score_percent": 80.0,
      "details": [
        {
          "question_id": 40,
          "answer_question_id": 88,
          "correct": true,
          "global_number": 19,
          "correct_answer_id": 88
        },
        ...
      ]
    },
    "part5": {
      "correct_count": 5,
      "total_questions": 6,
      "score_percent": 83.33,
      "details": [
        {
          "question_id": 50,
          "answer_id": 100,
          "correct": true,
          "global_number": 24,
          "correct_answer_id": 100
        },
        ...
      ]
    },
    "part6": {
      "correct_count": 5,
      "total_questions": 6,
      "score_percent": 83.33,
      "details": [
        {
          "question_id": 60,
          "position": 1,
          "answer": "Monday",
          "correct": true,
          "global_number": 30,
          "correct_answer": "Monday"
        },
        ...
      ]
    }
  }
}
```

**Files to modify**:
- `smartexam/backend/multilevel/apis/listening.py`

---

## TASK 3: Frontend - API Types and Functions ✅ COMPLETED

### 3.1 Create listening-mock.ts API file ✅ COMPLETED
**Maqsad**: Backend bilan ishlash uchun types va functions

**Qilish kerak**:
- [x] `ListeningFullMockQuestionsResponse` type yaratish
- [x] `ListeningFullMockEvaluatePayload` type yaratish
- [x] `ListeningFullMockEvaluateResponse` type yaratish
- [x] `getListeningFullMockQuestions()` function
- [x] `evaluateListeningFullMock()` function

**Files to create**:
- [x] `elevo-app/src/lib/api/listening-mock.ts`

**Files to modify**:
- [x] `elevo-app/src/lib/api/endpoints.ts` (endpoints already exist - listening.all.question and listening.all.evaluate)

---

## TASK 4: Frontend - Custom Hook (use-listening-mock.ts) ✅ COMPLETED

### 4.1 Create useListeningMock hook ✅ COMPLETED
**Maqsad**: Listening mock state management va audio playback logic

**Qilish kerak**:
- [x] State management (loading, submitting, error, examData, result)
- [x] Audio playback state (currentAudio, isPlaying, currentPart)
- [x] Answer states (part1Answers, part2Answers, ..., part6Answers)
- [x] Audio sequence logic:
  - Part intro → Part content → Part end → Next part intro
  - Last part: Part 6 end → finish_mock.mp3
- [x] Submit handler (payload construction with global_number)
- [x] Retry handler
- [x] Computed values (answeredCount, totalQuestionsCount = 35)

**Files to create**:
- [x] `elevo-app/src/hooks/listening/mock/use-listening-mock.ts`

**Audio Flow Logic**:
```typescript
// Example flow for Part 1:
playAudio("/sounds/listening-part1.mp3", () => {
  playAudio(part1.audio_url, () => {
    playAudio("/sounds/end-part1.mp3", () => {
      // Move to Part 2
      playAudio("/sounds/listening-part2.mp3", () => {
        // ... continue
      })
    })
  })
})

// Last part (Part 6):
playAudio("/sounds/listening-part6.mp3", () => {
  playAudio(part6.audio_url, () => {
    playAudio("/sounds/end-part6.mp3", () => {
      playAudio("/sounds/finish-mock.mp3", () => {
        // Enable submit button
        setCanSubmit(true)
      })
    })
  })
})
```

**Files to create**:
- `elevo-app/src/hooks/listening/mock/use-listening-mock.ts`

---

## TASK 5: Frontend - Main Content Component ✅ COMPLETED

### 5.1 Create ListeningMockContent component ✅ COMPLETED
**Maqsad**: Single scrollable page with all 6 parts

**Qilish kerak**:
- [x] Loading state (ExamLoading)
- [x] Error state (ErrorCard)
- [x] Submitting state (CalculatingResults)
- [x] Result state (ListeningMockResult + ListeningMockReviewAccordion) - Placeholder
- [x] Exam state:
  - PageHeaderWithBack
  - Audio status indicator (playing/paused)
  - All 6 parts in single scrollable container
  - Submit button (always enabled - user can submit anytime)
- [x] Reuse existing part components:
  - Part 1: Similar to individual part 1
  - Part 2: Gap filling inputs
  - Part 3: Matching questions
  - Part 4: Matching questions with image
  - Part 5: MCQ questions (multiple extracts)
  - Part 6: Gap filling inputs
- [x] Global numbering display (1-35)
- [x] Smooth scroll to top on mount

**IMPORTANT CHANGE**: Submit button is ALWAYS enabled. User can submit anytime without waiting for audio to finish. This gives user freedom to work at their own pace.

**Files created**:
- `elevo-app/src/components/elevo/listening/mock/listening-mock-content.tsx`

---

## TASK 6: Frontend - Result Component ✅ COMPLETED

### 6.1 Create ListeningMockResult component ✅ COMPLETED
**Maqsad**: Professional result display like Reading Mock

**Qilish kerak**:
- [x] Overall score card (CEFR level, percentage, correct/total)
- [x] Part-by-part breakdown cards (6 parts)
- [x] Retry button
- [x] Framer Motion animations (progress bar animation)
- [x] Responsive design (mobile + desktop)

**Design**:
- Indigo gradient for Listening (vs Primary for Reading)
- Headphones icon for hero card
- Individual part cards with icons
- Professional typography
- Animated progress bar

**Files created**:
- `elevo-app/src/components/elevo/listening/mock/listening-mock-result.tsx`

**Files modified**:
- `elevo-app/src/components/elevo/listening/mock/listening-mock-content.tsx` (imported and used ListeningMockResult)

---

## TASK 7: Frontend - Review Accordion Component ✅ COMPLETED

### 7.1 Create ListeningMockReviewAccordion component ✅ COMPLETED
**Maqsad**: Answer review with comparison (user vs correct)

**Qilish kerak**:
- [x] Answer Review section:
  - 35 answer cards in 2-3 column grid
  - Green checkmark / Red X icons
  - User answer vs Correct answer comparison
  - Global numbering (1-35)
  - Part info labels (Part 1 MCQ, Part 2 Gap, etc.)
- [x] All Audio & Questions section:
  - Accordion for each part (6 parts)
  - Part number badge + title
  - Audio player for each part (HTML5 audio controls)
  - Questions and correct answers display
  - Part 3 & 4: Options list + Questions
  - Part 5: Extracts with individual audio players + MCQ questions
- [x] Smooth animations (Framer Motion)

**Design**:
- Indigo theme (matching Listening brand)
- Professional accordion with `bg-indigo-500/10` headers
- Answer cards with indigo question numbers
- Responsive grid layout (2 cols mobile, 3 cols desktop)
- Audio players with Volume2 icon

**Files created**:
- `elevo-app/src/components/elevo/listening/mock/listening-mock-review-accordion.tsx`

**Files modified**:
- `elevo-app/src/components/elevo/listening/mock/listening-mock-content.tsx` (imported and used ListeningMockReviewAccordion)

---

## TASK 8: Frontend - Page Component ✅ COMPLETED

### 8.1 Create listening mock page ✅ COMPLETED
**Maqsad**: Route setup

**Qilish kerak**:
- [x] Create page at `elevo-app/src/app/listening/mock/page.tsx`
- [x] Import and render `ListeningMockContent`
- [x] No lazy loading (prevent flickering)

**Files created**:
- `elevo-app/src/app/listening/mock/page.tsx`

---

## TASK 9: Frontend - Navigation Integration ✅ ALREADY COMPLETED

### 9.1 Add Full Mock card to listening page ✅ ALREADY COMPLETED
**Maqsad**: User can access full mock from listening page

**Status**: 
- ✅ `ListeningFullMockCard` already exists
- ✅ Already added to listening page
- ✅ Links to `/listening/mock`
- ✅ Exported from `shared/index.ts`

**Files checked**:
- `elevo-app/src/app/listening/page.tsx` (already using ListeningFullMockCard)
- `elevo-app/src/components/elevo/listening/shared/listening-full-mock-card.tsx` (already exists)
- `elevo-app/src/components/elevo/listening/shared/index.ts` (already exported)

---

## TASK 10: Testing and Polish ✅ COMPLETED

### 10.1 Backend Testing ✅ COMPLETED
- ✅ Random part selection implemented
- ✅ Global numbering in response (1-35)
- ✅ Evaluation with all 35 questions
- ✅ Partial answers support (null handling)
- ✅ CEFR level calculation
- ✅ Correct answer details in response

### 10.2 Frontend Testing ✅ COMPLETED
- ✅ Audio sequence flow (intro → content → end)
- ✅ Answer submission with global numbering
- ✅ Result display (score, CEFR, breakdown)
- ✅ Review accordion (35 answer cards + 6 parts)
- ✅ Retry functionality
- ✅ Responsive design (mobile + desktop)
- ✅ Error handling (loading, error states)
- ✅ Loading states (ExamLoading, CalculatingResults)

### 10.3 Polish ✅ COMPLETED
- ✅ Smooth animations (Framer Motion for accordion, progress bar)
- ✅ Professional typography (Material Design 3)
- ✅ Consistent spacing (gap-3, gap-4, gap-5)
- ✅ Accessibility (ARIA labels via Input component)
- ✅ Performance optimization (no lazy loading to prevent flicker)

---

## ✅ IMPLEMENTATION COMPLETE

All tasks (1-10) have been successfully completed. The Listening Full Mock system is now fully functional with:

### Backend (Tasks 1-2):
- ✅ Question fetching with global numbering (1-35)
- ✅ Evaluation with correct answer details
- ✅ Part-by-part breakdown
- ✅ CEFR level calculation

### Frontend (Tasks 3-9):
- ✅ API types and functions
- ✅ Custom hook with audio playback
- ✅ Main content component (all 6 parts)
- ✅ Result component (professional display)
- ✅ Review accordion (35 answers + 6 parts with audio)
- ✅ Page component
- ✅ Navigation integration

### Key Features:
- 🎵 Audio sequence: intro → content → end (Part 1-5), Part 6 → finish-mock.mp3
- 📝 35 questions across 6 parts (8+5+5+5+6+6)
- 🔢 Global numbering (1-35)
- 🎨 Indigo theme for Listening
- 📱 Responsive design
- ♿ Accessible
- 🚀 Performant

### User Experience Improvements:
- ✅ Submit button always enabled (user freedom)
- ✅ Audio status indicator (sticky at top)
- ✅ Answered count display
- ✅ Professional result display with animations
- ✅ Comprehensive review with audio players

---

## Next Steps (Optional Enhancements):

1. **Analytics**: Track user performance, time spent per part
2. **Offline Support**: Cache audio files for offline playback
3. **Audio Speed Control**: Allow users to adjust playback speed
4. **Keyboard Shortcuts**: Add keyboard navigation for power users
5. **Progress Save**: Auto-save answers to localStorage
6. **Detailed Feedback**: Add explanations for correct answers

---

## Implementation Order

1. **Backend First** (TASK 1, 2)
   - Implement question fetching with global numbering
   - Implement evaluation with correct answer details

2. **Frontend API Layer** (TASK 3)
   - Create types and API functions

3. **Frontend Hook** (TASK 4)
   - Implement state management and audio logic

4. **Frontend Components** (TASK 5, 6, 7, 8)
   - Main content component
   - Result component
   - Review accordion
   - Page setup

5. **Integration** (TASK 9)
   - Add navigation card

6. **Testing & Polish** (TASK 10)
   - Comprehensive testing
   - Final polish

---

## Key Differences from Reading Mock

| Feature | Reading Mock | Listening Mock |
|---------|-------------|----------------|
| Navigation | Stepper (5 parts) | Single scroll (6 parts) |
| Timer | 60 minutes | No timer (audio-driven) |
| Audio | None | Intro → Content → End for each part |
| Submit | Always enabled | Enabled after finish_mock.mp3 |
| Parts | 5 parts (35q) | 6 parts (35q) |
| Question Distribution | 6+8+6+9+6 | 8+5+5+5+6+6 |

---

## Notes

- **Audio files** already exist in `elevo-app/public/sounds/`:
  - `listening-part1.mp3` to `listening-part6.mp3` (intros)
  - `end-part1.mp3` to `end-part5.mp3` (endings)
  - `finish-mock.mp3` (final audio)
  - Part content audio comes from backend

- **No stepper** - user scrolls through all parts in one page

- **Submit button** - disabled until finish_mock.mp3 completes

- **Global numbering** - 1-35 across all parts (like Reading Mock)

- **Reuse components** - leverage existing part components where possible

- **Professional design** - match Reading Mock quality and style
