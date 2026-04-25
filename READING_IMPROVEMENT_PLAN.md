# 📚 ELEVO READING TIZIMI - YAXSHILASH REJASI

> **Maqsad:** Reading tizimini production-ready holatga keltirish
> **Sana:** 2026-04-25
> **Status:** 🟡 In Progress

---

## 🔴 PRIORITY 1: KRITIK MUAMMOLAR (Darhol hal qilish kerak)

### ✅ Task 1.1: Error Handling Tizimini Qo'shish
**Muammo:** Barcha hooklar faqat `console.error` ishlatadi, user xatoliklarni ko'rmaydi.

**Qilish kerak:**
- [ ] Error state qo'shish barcha hooklarga
- [ ] User-friendly error messages
- [ ] Retry mexanizmi
- [ ] Network timeout handling (30s)
- [ ] Backend error parsing

**Fayllar:**
- `elevo-app/src/components/elevo/reading/use-reading-part1.ts`
- `elevo-app/src/components/elevo/reading/use-reading-part2.ts`
- `elevo-app/src/components/elevo/reading/use-reading-part3.ts`
- `elevo-app/src/components/elevo/reading/use-reading-part4.ts`
- `elevo-app/src/components/elevo/reading/use-reading-part5.ts`

**Kutilayotgan natija:**
```typescript
// Error state bilan
const [error, setError] = useState<{
  message: string
  code?: string
  retry?: boolean
} | null>(null)

// User ko'radigan error UI
{error && (
  <ErrorCard 
    message={error.message}
    onRetry={error.retry ? loadQuestion : undefined}
  />
)}
```

---

### ✅ Task 1.2: Timer Memory Leak Tuzatish
**Muammo:** Timer cleanup to'g'ri ishlamaydi, memory leak xavfi bor.

**Qilish kerak:**
- [ ] Cleanup function'ni to'g'rilash
- [ ] Component unmount'da timer to'xtatish
- [ ] Timer pause/resume funksiyalari

**Fayllar:**
- Barcha `use-reading-part*.ts` fayllar

**Kutilayotgan natija:**
```typescript
useEffect(() => {
  if (result || loading) return
  
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        handleSubmitRef.current()
        return 0
      }
      return prev - 1
    })
  }, 1000)
  
  return () => clearInterval(timer) // ✅ Har doim cleanup
}, [result, loading])
```

---

### ✅ Task 1.3: Data Validation Qo'shish
**Muammo:** Backend'dan kelgan data validate qilinmaydi.

**Qilish kerak:**
- [ ] Zod schema yaratish har bir part uchun
- [ ] Runtime validation
- [ ] Type guards
- [ ] Fallback values

**Yangi fayllar:**
- `elevo-app/src/lib/schemas/reading.ts`

**Kutilayotgan natija:**
```typescript
import { z } from 'zod'

export const ReadingPart1Schema = z.object({
  exam_id: z.number(),
  part: z.number(),
  question: z.object({
    id: z.number(),
    title: z.string().nullable(),
    instruction: z.string().nullable(),
    text: z.string(),
    positions: z.array(z.number())
  })
})

// Usage
const validated = ReadingPart1Schema.parse(data)
```

---

### ✅ Task 1.4: Loading State Optimization
**Muammo:** Har safar page ochilganda loading, caching yo'q.

**Qilish kerak:**
- [ ] React Query o'rnatish
- [ ] Query keys yaratish
- [ ] Cache configuration
- [ ] Stale-while-revalidate

**Yangi fayllar:**
- `elevo-app/src/lib/queries/reading.ts`

**Kutilayotgan natija:**
```typescript
export function useReadingPart1Question() {
  return useQuery({
    queryKey: ['reading', 'part1'],
    queryFn: getReadingPart1Question,
    staleTime: 5 * 60 * 1000, // 5 min
    cacheTime: 30 * 60 * 1000, // 30 min
    retry: 3
  })
}
```

---

## 🟡 PRIORITY 2: MUHIM YAXSHILASHLAR (1-2 hafta ichida)

### ✅ Task 2.1: Cache Busting Strategiyasini O'zgartirish
**Muammo:** `_t: Date.now()` har safar yangi request yuboradi.

**Qilish kerak:**
- [ ] Cache busting'ni olib tashlash
- [ ] React Query'ga o'tish
- [ ] Smart invalidation

**Fayllar:**
- `elevo-app/src/lib/api/reading.ts`

---

### ✅ Task 2.2: Shared Hooks Yaratish (DRY)
**Muammo:** 5 ta hookda bir xil kod takrorlanadi.

**Qilish kerak:**
- [ ] `useExamTimer` hook yaratish
- [ ] `useExamState` hook yaratish
- [ ] Generic `useReadingExam` hook

**Yangi fayllar:**
- `elevo-app/src/lib/hooks/useExamTimer.ts`
- `elevo-app/src/lib/hooks/useExamState.ts`

**Kutilayotgan natija:**
```typescript
// Shared timer hook
export function useExamTimer(duration: number, onTimeout: () => void) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isPaused, setIsPaused] = useState(false)
  
  // ... timer logic
  
  return {
    timeLeft,
    isPaused,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    reset: () => setTimeLeft(duration),
    formatTime: (secs: number) => {
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `${m}:${s.toString().padStart(2, "0")}`
    }
  }
}
```

---

### ✅ Task 2.3: Accessibility (A11y) Qo'shish
**Muammo:** Screen reader support yo'q, keyboard navigation zaif.

**Qilish kerak:**
- [ ] ARIA labels qo'shish
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Skip links
- [ ] Semantic HTML

**Fayllar:**
- Barcha component fayllar

**Kutilayotgan natija:**
```typescript
<button
  aria-label="Submit answers"
  aria-disabled={!allFilled}
  aria-describedby="submit-help"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSubmit()
    }
  }}
>
  Submit
</button>
```

---

### ✅ Task 2.4: Analytics Integration
**Muammo:** User behavior track qilinmaydi.

**Qilish kerak:**
- [ ] Event tracking setup
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] User session recording

**Yangi fayllar:**
- `elevo-app/src/lib/analytics/events.ts`
- `elevo-app/src/lib/analytics/tracking.ts`

**Kutilayotgan natija:**
```typescript
// Track events
trackEvent('reading_part1_started', {
  exam_id: examId,
  timestamp: Date.now()
})

trackEvent('reading_part1_submitted', {
  exam_id: examId,
  time_taken: duration,
  score: result.score_percent
})
```

---

## 🟢 PRIORITY 3: PROFESSIONAL YAXSHILASHLAR (Long-term)

### ✅ Task 3.1: Performance Optimization
**Qilish kerak:**
- [ ] React.memo() qo'shish
- [ ] useCallback/useMemo optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size optimization

---

### ✅ Task 3.2: Testing Infrastructure
**Qilish kerak:**
- [ ] Unit tests (Vitest)
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests

**Yangi fayllar:**
- `elevo-app/src/components/elevo/reading/__tests__/`

---

### ✅ Task 3.3: Offline Support (PWA)
**Qilish kerak:**
- [ ] Service Worker
- [ ] Cache API
- [ ] Offline-first architecture
- [ ] Background sync

---

### ✅ Task 3.4: State Management Refactoring
**Qilish kerak:**
- [ ] useReducer pattern
- [ ] State machine (XState)
- [ ] Centralized state

**Kutilayotgan natija:**
```typescript
type State = {
  status: 'idle' | 'loading' | 'submitting' | 'success' | 'error'
  data: QuestionData | null
  error: ErrorType | null
  timeLeft: number
}

type Action = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS', payload: QuestionData }
  | { type: 'LOAD_ERROR', payload: ErrorType }
  | { type: 'SUBMIT_START' }
  | { type: 'TICK' }

const [state, dispatch] = useReducer(reducer, initialState)
```

---

### ✅ Task 3.5: Internationalization (i18n)
**Qilish kerak:**
- [ ] i18next setup
- [ ] Translation files
- [ ] Language switcher
- [ ] RTL support

---

## 📊 PROGRESS TRACKING

### Sprint 1 (Hafta 1-2): Priority 1
- [ ] Task 1.1: Error Handling ⏳
- [ ] Task 1.2: Timer Memory Leak ⏳
- [ ] Task 1.3: Data Validation ⏳
- [ ] Task 1.4: Loading State ⏳

### Sprint 2 (Hafta 3-4): Priority 2
- [ ] Task 2.1: Cache Strategy ⏳
- [ ] Task 2.2: Shared Hooks ⏳
- [ ] Task 2.3: Accessibility ⏳
- [ ] Task 2.4: Analytics ⏳

### Sprint 3 (Hafta 5-8): Priority 3
- [ ] Task 3.1: Performance ⏳
- [ ] Task 3.2: Testing ⏳
- [ ] Task 3.3: Offline Support ⏳
- [ ] Task 3.4: State Management ⏳
- [ ] Task 3.5: i18n ⏳

---

## 🎯 SUCCESS METRICS

### Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 200KB (gzipped)

### Quality
- [ ] Test coverage > 80%
- [ ] Zero console errors
- [ ] Lighthouse score > 90

### User Experience
- [ ] Error rate < 1%
- [ ] Retry success rate > 95%
- [ ] User satisfaction > 4.5/5

---

## 📝 NOTES

- Har bir task uchun alohida branch yaratish
- PR review majburiy
- Testing har bir task uchun
- Documentation yangilash

---

**Oxirgi yangilanish:** 2026-04-25
**Keyingi review:** Har hafta dushanba
