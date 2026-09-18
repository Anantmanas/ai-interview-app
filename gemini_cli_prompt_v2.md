# Gemini CLI — Redesign `components/interview/interview-room.tsx`

## WHAT EXISTS (read this before writing anything)

The current file exports `InterviewRoom({ interview, profile })` — keep these exact props.

### Working API calls (do NOT change these endpoints or request shapes):

```ts
// 1. Generate all 5 questions at session start
POST /api/interview/chat
body: { mode: 'generate', interviewType, difficulty, resumeContext, count: 5 }
response: { questions: Question[] }

// 2. Evaluate each answer + persist to DB
POST /api/interviews/${interviewId}/evaluate
body: { currentQuestion, userAnswer, textAnswer, codeAnswer, answerType, language, elapsedSeconds, sequence_order }
response: { evaluation: EvaluationResult }

// 3. Mark interview complete
PUT /api/interviews/${interviewId}
body: { status: 'completed', overall_score, completed_at, duration_seconds }

// 4. AI coach chat (optional, currently unused in UI)
POST /api/interview/chat
body: { mode: 'chat', messages, resumeContext }
response: { content: string }
```

### Keep all existing state variables and handlers:
`questions, currentQIndex, answerMode, textAnswer, codeAnswer, selectedLanguage, evaluation, chatHistory, interviewStartTime, questionStartTime, isInterviewEnded, totalScore, answersCount, isGenerating, isEvaluating`

`handleSubmitAnswer, handleNextQuestion, handleEndInterview, handleChatSend, fetchInterviewApi`

**Only replace the JSX/UI. All logic stays identical.**

---

## WHAT TO FIX

### Bug 1 — Voice lang (line 102)
```ts
// CHANGE:
recognitionRef.current.lang = 'en-US'
// TO:
recognitionRef.current.lang = 'en-IN'   // Indian accent accuracy
```
Also add `recognition.maxAlternatives = 3` and sort by `confidence` to pick the best alternative before appending to transcript.

Auto-restart recognition on `onend` if still recording (handles 60s browser timeout):
```ts
recognitionRef.current.onend = () => {
  if (isRecordingRef.current) recognitionRef.current?.start()
}
```

### Bug 2 — Voice answer not sent to evaluate (line 251)
```ts
// CURRENT (loses voice answer):
const submittedAnswer = answerMode === 'code' ? codeAnswer : textAnswer

// FIX — voice transcript lives in textAnswer (VoiceRecorder calls onTranscript → setTextAnswer)
// No code change needed here — confirm VoiceRecorder calls onTranscript(finalTranscript)
// and that textAnswer is used in the body. Already correct — just verify.
```

### Bug 3 — Missing right panel (the AI feedback panel exists in state but has no UI)
The `evaluation` state is set on submit but only rendered inline under the answer box.
Move it to a persistent right panel that shows live as soon as `evaluation` is set.

---

## REDESIGN SPEC

### Visual direction
Dark cockpit. Background `#080C14`. Glassmorphic panels at `rgba(255,255,255,0.03)` with `border: rgba(255,255,255,0.06)`. Cyan `#22d3ee` + indigo `#818cf8` accent gradient. Monospace font for code/timer. Clean sans for body.

Background atmosphere:
```css
/* Two diffused blobs, no distractions */
.bg-blob-1: position fixed, top -120px, left 25%, w 500px h 500px, bg indigo-600/8, blur 120px, rounded-full
.bg-blob-2: position fixed, bottom 0, right 25%, w 400px h 400px, bg cyan-500/6, blur 100px, rounded-full
/* Subtle grid overlay at 1.2% opacity */
background-image: repeating-linear-gradient(0deg, transparent 39px, rgba(255,255,255,0.5) 40px),
                  repeating-linear-gradient(90deg, transparent 39px, rgba(255,255,255,0.5) 40px)
```

### Layout — full viewport height, no body scroll

```
┌──────── HEADER (h-14, border-b border-white/6) ────────────────┐
│ [⚡ InterviewAI]  Q1/5  [MEDIUM badge]        [02:01]  [End]  │
├──────── 2px gradient progress bar ─────────────────────────────┤
│                                                                  │
│ LEFT w-[320px]  │ CENTER flex-1 min-w-0  │ RIGHT w-[280px]     │
│ border-r        │                         │ border-l            │
│                 │ Mode tabs (top strip)   │                     │
│ Question text   │ [Text] [Code] [Voice]   │ AI Coach header     │
│ (skeleton while │                         │ (dot pulse)         │
│ isGenerating)   │ TEXT: <textarea>        │                     │
│                 │ CODE: Monaco editor     │ idle state:         │
│ Hint toggle     │ VOICE: waveform +       │ "Submit answer for  │
│                 │   transcript area       │  live feedback"     │
│ ─────────────── │                         │                     │
│ Session stats   │ Language select         │ ON evaluation set:  │
│ (answered / avg)│ (code mode only)        │ ScoreRing           │
│                 │                         │ 3 MiniBar sub-scores│
│                 │ ─────────────────────── │ Feedback text       │
│                 │ [Submit Answer] →       │ Strengths ✓         │
│                 │ [Next Question] →       │ Improvements ›      │
└─────────────────┴─────────────────────────┴─────────────────────┘
```

### Components to add inline (same file):

**ScoreRing** — SVG ring, animated stroke-dashoffset from 0 to final on mount
```tsx
function ScoreRing({ score }: { score: number }) {
  const size = 80, r = 35, circ = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle cx={40} cy={40} r={r} fill="none" stroke="url(#sg)" strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <defs>
          <linearGradient id="sg"><stop offset="0%" stopColor="#22d3ee"/>
          <stop offset="100%" stopColor="#818cf8"/></linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-lg">{score}</span>
      </div>
    </div>
  )
}
```

**MiniBar** — labeled progress bar for sub-scores
```tsx
function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-white/50">{label}</span>
        <span className="text-white/70">{value}%</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700"
          style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
```

**VoiceWaveform** — 20 bars animated while isRecording
```tsx
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  // 20 divs, width 3px, rounded-full
  // When isActive: animate height between random 8-32px with CSS animation
  // When inactive: all bars h-[8px] bg-white/20
  // Active bars: bg-cyan-400
}
```

**CountdownTimer** — keep existing logic, restyle only:
- Pill shape: `border border-white/10 bg-white/5 rounded-full px-4 py-1.5 font-mono text-sm text-white/80`
- Urgent (< 5min): `border-rose-500/40 bg-rose-500/10 text-rose-400`

### Voice mode UI
Replace current plain buttons with:
```
[ Waveform bars (20 bars, animated when recording) ]
[ Transcript scrollable area — text-white/75 text-sm ]
[ MicOff/Mic toggle button — rounded-full, cyan when inactive, rose when recording ]
[ Clear button — text-xs text-white/30 ]
```
Show "Optimized for Indian English accents" hint text below the mic button.

### Submit/Next bar (bottom of center panel)
```
border-t border-white/6 | bg-white/[0.01] | px-5 py-4
[char count text-white/25]         [Submit Answer CTA]
```
After evaluation is set, CTA changes to [Next Question →] or [Finish Interview] based on index.

### End confirm modal
On clicking End: show a centered overlay modal (not a browser confirm):
```
Dark overlay bg-black/70 backdrop-blur-sm
Card: bg-[#0f1623] border border-white/10 rounded-2xl p-6 w-[360px]
Content: AlertCircle icon + "End this session?" + answered count
Buttons: [Continue] ghost | [End & See Results] rose bg
```

### isInterviewEnded state
When true: do NOT redirect immediately. Instead render an inline result summary in the same viewport (no page navigation):
```
Center column expands to full width
Large score display: X% overall
Per-question list: question text | score badge | feedback (expandable)
[Start New Session] button → router.push('/dashboard/interviews/new')
[View Full History] button → router.push(`/dashboard/history/${interviewId}`)
```

---

## DEPENDENCIES

Already in package.json: `@monaco-editor/react`, `@/components/ui/button`, `@/components/ui/select`

Add if missing:
```bash
npx shadcn@latest add badge scroll-area separator tooltip
```

No new npm packages needed. Animate with CSS transitions, not Framer Motion (keep bundle lean).

---

## TYPESCRIPT

Keep all existing interfaces exactly as-is:
```ts
interface Question { id, text, type, difficulty, topic?, topicTag? }
interface EvaluationResult { score, feedback, improvement?, improvements?, technicalAccuracy?, topic? }
interface ChatMessage { role: 'user'|'assistant', content }
interface InterviewRoomProps { interview: any, profile: any }
```

Do not add `any` casts. Do not import types not already in the file.
Export stays: `export function InterviewRoom`

---

## DO NOT

- Change any fetch URL or request body shape
- Add Framer Motion (not in scope)
- Add new API routes
- Rename the export
- Import supabaseAdmin (server-only)
- Change `handleEndInterview` redirect logic — it already correctly goes to `/dashboard/history/${interviewId}`
