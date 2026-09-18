# Gemini CLI — InterviewAI Critical Fix Prompt
# Apply all 4 fixes in order. No new features. No refactoring beyond what's specified.

---

## CONTEXT

Next.js 16 + Turbopack, Supabase, pdf-parse, Web Speech API.
Dev server crashes with: `FATAL ERROR: JavaScript heap out of memory`
Secondary issues: 2.3s middleware delay per request, VoiceRecorder infinite loop, interview_questions never written to DB.

---

## FIX 1 — OOM CRASH: pdf-parse dynamic import (HIGHEST PRIORITY)

**File:** `app/api/resume/route.ts`

**Problem:** `await import('pdf-parse')` inside a request handler causes Turbopack to re-evaluate the module on every request. `pdf-parse` reads test PDF fixtures from disk at load time — repeated allocation crashes the heap within seconds. Additionally, `(mod as any).PDFParse` is wrong — the package has no named `PDFParse` export.

**Change — remove dynamic import, replace with static import + correct call:**

```ts
// REMOVE this entire function:
async function extractRawText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)
    const mod = await import('pdf-parse')          // ← DELETE
    const PDFParse = (mod as any).PDFParse         // ← DELETE (wrong export)
    const parser = new PDFParse({ data: buf })     // ← DELETE
    const parsed = await parser.getText()          // ← DELETE
    await parser.destroy()                         // ← DELETE
    return parsed?.text || ''
  }
  return await file.text()
}

// REPLACE WITH:
import pdfParse from 'pdf-parse'  // ← ADD at top of file, static import

async function extractRawText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)
    try {
      const result = await pdfParse(buf)
      return result?.text || ''
    } catch (e) {
      console.warn('[resume] pdf-parse failed:', e instanceof Error ? e.message : e)
      return ''
    }
  }
  return await file.text()
}
```

`next.config.mjs` already has `serverExternalPackages: ['pdf-parse']` — do not touch it.

---

## FIX 2 — 2.3s DELAY: middleware not registered by Next.js

**Problem:** The middleware file is named `proxy.ts`. Next.js only auto-registers middleware from `middleware.ts` (project root or `src/`). With the wrong filename, Next.js ignores it entirely and something imports it manually on every request — causing `updateSession` to run synchronously in the request path at 2.3s per call.

**Change:**

```bash
# Run in project root:
mv proxy.ts middleware.ts
```

The file content is correct — `export async function proxy` should be renamed to `export async function middleware`, and the `export const config` matcher stays identical:

```ts
// middleware.ts (was proxy.ts) — rename the function only:
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {   // ← rename: proxy → middleware
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

Find and remove any manual import of `proxy.ts` / `proxy` anywhere in the codebase:
```bash
grep -rn "from.*proxy\|import.*proxy" --include="*.ts" --include="*.tsx" .
# Delete every match that imports the old proxy.ts
```

---

## FIX 3 — RENDER LOOP: VoiceRecorder useEffect recreates recognition on every transcript change

**File:** wherever `VoiceRecorder` component is defined (search: `function VoiceRecorder`)

**Problem:** `useEffect` depends on `[transcript, onTranscript]`. `transcript` changes on every speech result → effect fires → recognition is aborted and recreated → triggers another result → infinite loop. Leaks SpeechRecognition instances until tab freezes.

**Replace the entire VoiceRecorder component with:**

```ts
function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [displayTranscript, setDisplayTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef(false)          // stable ref — no re-render on change
  const accumulatedRef = useRef('')             // stable ref for transcript accumulation

  const stopRecognition = () => {
    isRecordingRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.onend = null       // prevent auto-restart
      recognitionRef.current.abort()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'                 // Indian accent — higher accuracy than en-US
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Pick highest-confidence alternative
        const alternatives = Array.from(
          { length: event.results[i].length },
          (_, j) => event.results[i][j]
        ).sort((a: any, b: any) => b.confidence - a.confidence)
        const best = alternatives[0]

        if (event.results[i].isFinal) {
          accumulatedRef.current += best.transcript + ' '
        } else {
          interim += best.transcript
        }
      }
      const full = accumulatedRef.current + interim
      setDisplayTranscript(full)
      onTranscript(accumulatedRef.current)      // send only final text upstream
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions.')
        stopRecognition()
      }
      // Ignore 'no-speech' — it's benign
    }

    // Auto-restart on 60s browser timeout
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start() } catch { /* already started */ }
      }
    }

    recognitionRef.current = recognition
    isRecordingRef.current = true
    setIsRecording(true)
    recognition.start()
  }

  const toggleRecording = () => {
    if (isRecordingRef.current) {
      stopRecognition()
    } else {
      startRecognition()
    }
  }

  const clearTranscript = () => {
    accumulatedRef.current = ''
    setDisplayTranscript('')
    onTranscript('')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRecognition()
  }, [])                                        // ← empty deps — runs once only

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            isRecording
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
          }`}
        >
          {isRecording ? '⏹ Stop' : '🎤 Record'}
        </button>
        {displayTranscript && (
          <button
            type="button"
            onClick={clearTranscript}
            className="px-3 py-2 rounded-full text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Clear
          </button>
        )}
        {isRecording && (
          <span className="text-xs text-cyan-400/70">Listening… (en-IN)</span>
        )}
      </div>
      {displayTranscript && (
        <div className="text-sm text-white/70 leading-relaxed bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 max-h-40 overflow-y-auto">
          {displayTranscript}
        </div>
      )}
    </div>
  )
}
```

---

## FIX 4 — DATA LOSS: interview_questions never written to DB

**File:** `app/api/interviews/[id]/evaluate/route.ts`

**Problem:** The evaluate route returns a score (visible as 81% in the UI) but never inserts into `interview_questions`. History page shows "No questions recorded" because the table is empty.

**Find the POST handler. After the AI evaluation call succeeds, add this insert block:**

```ts
// ADD: import at top of file
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ADD: admin client (service role bypasses RLS — required for server-side writes)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ADD: inside the POST handler, immediately after evaluation is returned from AI:
// (interviewId comes from params.id, body fields below)

const { error: insertError } = await supabaseAdmin
  .from('interview_questions')
  .insert({
    interview_id: params.id,
    question_text: body.questionText ?? body.currentQuestion?.text ?? '',
    question_type: body.questionType ?? body.currentQuestion?.type ?? 'technical',
    topic: evaluation.topic ?? body.topic ?? 'general',
    difficulty: body.difficulty ?? 'medium',
    user_answer: body.userAnswer ?? body.textAnswer ?? '',
    ai_evaluation: evaluation,                           // full JSON blob
    time_taken_seconds: body.elapsedSeconds ?? body.timeTakenSeconds ?? 0,
    sequence_order: body.sequence_order ?? body.sequenceOrder ?? 0,
  })

if (insertError) {
  // Log but don't fail the response — user still gets their score
  console.error('[evaluate] interview_questions insert failed:', insertError.message, insertError.code)
}
```

**Also run in Supabase SQL editor — verify RLS policy exists:**

```sql
-- Check if policy exists
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'interview_questions';

-- If no rows returned, create it:
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_via_interview_owner" ON interview_questions
  FOR ALL USING (
    interview_id IN (
      SELECT id FROM interviews WHERE user_id = auth.uid()
    )
  );
```

---

## SECURITY HARDENING (apply alongside fixes above)

### A. Input validation on /api/resume

In `route.ts` POST handler, add at the start of the try block:

```ts
// File type allowlist — reject non-PDF/text before processing
const ALLOWED_TYPES = ['application/pdf', 'text/plain']
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md']
const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
  return NextResponse.json({ error: 'Only PDF and text files are supported' }, { status: 415 })
}

// Size cap — 10MB hard limit
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json({ error: 'File must be under 10MB' }, { status: 413 })
}
```

### B. Sanitise AI output before DB write

In the evaluate route, before inserting `ai_evaluation`:

```ts
// Clamp score to valid range — prevents AI from returning 9999 or -1
if (typeof evaluation.score === 'number') {
  evaluation.score = Math.max(0, Math.min(100, Math.round(evaluation.score)))
}
if (typeof evaluation.technicalAccuracy === 'number') {
  evaluation.technicalAccuracy = Math.max(0, Math.min(100, Math.round(evaluation.technicalAccuracy)))
}
```

### C. Rate limiting on AI routes

In `app/api/interviews/[id]/evaluate/route.ts` and `app/api/interview/chat/route.ts`, add at the top of the handler before any AI call:

```ts
// Simple Supabase-backed rate limit — no extra service needed
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const today = new Date().toISOString().split('T')[0]
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('plan, daily_ai_calls, last_call_reset')
  .eq('id', user.id)
  .single()

const limit = profile?.plan === 'pro' ? 25 : 3
const calls = profile?.last_call_reset === today ? (profile?.daily_ai_calls ?? 0) : 0

if (calls >= limit) {
  return NextResponse.json(
    { error: `Daily limit of ${limit} AI sessions reached. Upgrade to Pro for more.` },
    { status: 429 }
  )
}

// Increment counter
await supabaseAdmin.from('profiles').update({
  daily_ai_calls: calls + 1,
  last_call_reset: today,
}).eq('id', user.id)
```

### D. client.ts — remove console.log leaking provider/key info

```ts
// In lib/ai/client.ts — REMOVE this line entirely:
console.log(`[AI Client] Provider: ${isOpenRouter ? 'OpenRouter' : isGemini ? 'Gemini' : 'OpenAI'} | Model: ${GENERATION_MODEL}`)
```

This logs to stdout in production, leaking which AI provider and model you're using.

---

## VERIFICATION

After applying all fixes, run in order:

```bash
# 1. Confirm middleware registered
grep -rn "from.*proxy\|import.*proxy" --include="*.ts" --include="*.tsx" .
# Expected: zero results

# 2. Confirm no dynamic pdf-parse import remains
grep -rn "await import.*pdf-parse\|dynamic.*pdf-parse" --include="*.ts" .
# Expected: zero results

# 3. Start dev server — should be stable, no OOM
npm run dev

# 4. Upload a PDF resume → check Terminal: no heap error, no [resume] warning
# 5. Start interview → submit 1 answer → check Supabase Table Editor:
#    interview_questions should have 1 new row
# 6. Navigate to /dashboard/history/[id] → should show question + score
# 7. Try voice mode → speak for 90 seconds → should NOT stop after 60s
```

---

## DO NOT

- Do not change any API endpoint URLs or request body shapes
- Do not add new npm packages (all fixes use existing deps)
- Do not modify `next.config.mjs` — `serverExternalPackages: ['pdf-parse']` is already correct
- Do not change `lib/ai/client.ts` provider logic — it's correct
- Do not add Stripe/billing in this session
