# Interview Room Refactor & RetroUI Redesign

Refactor the interview API route to remove dead code, fix model routing (DeepSeek for chat, Gemini for question gen + evaluation), and completely redesign the InterviewRoom component with RetroUI/NeoBrutalism aesthetics. Add countdown timer and end interview button.

## User Review Required

> [!IMPORTANT]
> **Model Routing Change**: The current code routes ALL requests through a single Gemini RapidAPI proxy (`gemini-2.5-pro.p.rapidapi.com`). The plan splits this into:
> - **DeepSeek (NVIDIA API)** via OpenAI SDK → Chat/companion mode (`mode: 'chat'`)
> - **Gemini (RapidAPI proxy)** → Question generation (`mode: 'generate'`) + Answer evaluation (`mode: 'evaluate'`) + Report generation (`mode: 'report'`)
>
> This matches how the evaluate route already uses DeepSeek via the OpenAI SDK.

> [!WARNING]
> **RetroUI Integration**: RetroUI is a shadcn-compatible registry. Rather than installing it as an npm package, we'll build the NeoBrutalist components **inline** (RetroButton, RetroCard, RetroProgressBar) directly in the codebase using the visual patterns from the [reference template](https://brutstack-retroui-template.vercel.app/). This avoids adding external dependencies while still achieving the exact look. The design features:
> - **Thick 2px black borders** on all cards and elements
> - **Layered shadow effect** (offset colored layers behind cards)
> - **Bold uppercase typography** with Space Grotesk-inspired fonts
> - **Vibrant accent colors**: `#FCBA28` (yellow), `#0CA95B` (green), `#FF3344` (red), `#14b6e5` (cyan)
> - **Dark background**: `#1a1a1a` / `#F9F4DA` cream text

## Open Questions

✅ **Interview Duration**: Defaulting to **30 minutes**.

✅ **End Interview Redirect**: Will call evaluate endpoint and redirect.

✅ **Voice Mode**: Using **WebSpeech API** (`SpeechRecognition`) for real-time speech-to-text. The transcript populates an editable textarea so users can review and edit before submitting.

## Proposed Changes

### API Route – Model Routing Fix & Cleanup

#### [MODIFY] [route.ts](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/app/api/interview/chat/route.ts)

**Remove dead code (~100 lines)**:
- Delete `TECHNICAL_QUESTIONS` array (lines 11-17)
- Delete `BEHAVIORAL_QUESTIONS` array (lines 19-25)
- Delete `SYSTEM_DESIGN_QUESTIONS` array (lines 27-33)
- Delete `checkAnswerRelevance()` function (lines 39-102)
- Simplify `getFallbackResponse()` to not rely on hardcoded question arrays

**Fix model routing** – Split `callModel()` into two providers:

```diff
-const INTERVIEW_MODEL = 'gemini-2.5-pro'
-const CHAT_MODEL = 'gemini-2.5-pro'
-const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
-const RAPIDAPI_HOST = 'gemini-2.5-pro.p.rapidapi.com'
+import OpenAI from 'openai'
+
+const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
+const GEMINI_HOST = process.env.GEMINI_HOST || 'google-gemini-pro.p.rapidapi.com'
```

**New `callGemini()`** – For question gen, evaluation, reports (uses existing RapidAPI Gemini proxy from `.env.local`):
```typescript
async function callGemini(systemPrompt: string, userContent: string): Promise<string> {
  const response = await fetch(`https://${GEMINI_HOST}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': GEMINI_HOST,
    },
    body: JSON.stringify({
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      max_tokens: 1000,
    }),
  })
  // ... parse response
}
```

**New `callDeepSeek()`** – For chat/companion mode (matches existing evaluate route pattern):
```typescript
async function callDeepSeek(systemPrompt: string, userContent: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEAK_API_KEY,
    baseURL: process.env.DEEPSEAK_API_URL || 'https://integrate.api.nvidia.com/v1',
  })
  const completion = await openai.chat.completions.create({
    model: 'deepseek-ai/deepseek-v4-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 1000,
  })
  return completion.choices[0].message.content || ''
}
```

**Route calls**:
| Mode | Provider | Rationale |
|------|----------|-----------|
| `generate` | `callGemini()` | Question generation |
| `evaluate` | `callGemini()` | Answer evaluation |
| `report` | `callGemini()` | Report generation |
| `chat` | `callDeepSeek()` | Companion coach chat |

---

### RetroUI Component Library

#### [NEW] [retro-button.tsx](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/components/ui/retro-button.tsx)

NeoBrutalist button with layered shadow effect matching the reference template. Supports variants: `primary`, `secondary`, `destructive`, `outline`. Uses the characteristic 3-layer stack with colored bottom, dark middle, and interactive top layer.

#### [NEW] [retro-card.tsx](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/components/ui/retro-card.tsx)

NeoBrutalist card with thick 2px black border and colored shadow offset layers. Supports `accentColor` prop for the shadow layer color.

#### [NEW] [retro-progress.tsx](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/components/ui/retro-progress.tsx)

---

### Voice Transcription Hook

#### [NEW] [use-speech-recognition.ts](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/hooks/use-speech-recognition.ts)

Custom React hook wrapping the browser WebSpeech API (`SpeechRecognition` / `webkitSpeechRecognition`):
- `startListening()` / `stopListening()` controls
- `transcript` state updated in real-time via `onresult` events
- `interimTranscript` for live preview while speaking
- `isListening` boolean for UI feedback
- `isSupported` check for browser compatibility
- Continuous mode with interim results for real-time feedback
- The transcript feeds into the same editable textarea used by text mode, so users can freely edit before submitting

Step progress bar for question navigation (e.g., "Question 2 of 5") with NeoBrutalist styling – thick borders, filled segments.

---

### Interview Room Redesign

#### [MODIFY] [interview-room.tsx](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/components/interview/interview-room.tsx)

**Complete rewrite** with the following layout and features:

**Layout (3-column grid)**:
```
┌──────────────────────────────────────────────────────────┐
│ HEADER BAR                                               │
│ [Interview Title] [Timer: 28:45] [Question 2/5] [END]    │
├────────────────────────┬─────────────────────────────────┤
│ QUESTION PANEL         │ COACH SIDEBAR                   │
│ ┌────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ RetroCard          │ │ │ Alex - Your Coach           │ │
│ │ Question text      │ │ │                             │ │
│ │ [Topic Badge]      │ │ │ Chat messages...            │ │
│ │ [Difficulty Badge]  │ │ │                             │ │
│ └────────────────────┘ │ │                             │ │
│                        │ │                             │ │
│ ANSWER AREA            │ │ [Send message]              │ │
│ [text] [code] [voice]  │ └─────────────────────────────┘ │
│ ┌────────────────────┐ │                                 │
│ │ textarea / Monaco  │ │                                 │
│ └────────────────────┘ │                                 │
│                        │                                 │
│ EVALUATION RESULT      │                                 │
│ ┌────────────────────┐ │                                 │
│ │ Score: 8/10        │ │                                 │
│ │ Feedback...        │ │                                 │
│ │ [Next Question]    │ │                                 │
│ └────────────────────┘ │                                 │
└────────────────────────┴─────────────────────────────────┘
```

**Key features**:
1. **Countdown Timer** – 30-minute countdown displayed in the header. Visual warning at 5 minutes (turns red). Auto-triggers end interview when time runs out.

2. **End Interview Button** – RetroButton in `destructive` variant. Shows confirmation dialog. On confirm:
   - Saves all session data to Supabase
   - Calls `/api/interviews/[id]/evaluate` to evaluate all answers
   - Redirects to results page

3. **Question Progress** – RetroProgress bar showing "Question X of Y" with filled segments

4. **NeoBrutalist Styling** – Dark `#1a1a1a` background, cream `#F9F4DA` text, thick borders, layered card shadows, uppercase headings with Space Grotesk font

5. **Answer Mode Tabs** – Styled as RetroButtons in a toggle group (text/code/voice)

6. **Evaluation Cards** – Score displayed in large bold text with color coding (green ≥7, yellow 5-6, red <5)

7. **Uses `interviewSession.ts` helpers** – Replace inline API calls with the existing `fetchQuestions()`, `evaluateAnswer()`, `sendChatMessage()` from [interviewSession.ts](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/lib/interviewSession.ts)

---

### CSS Updates

#### [MODIFY] [globals.css](file:///c:/Users/anant/Downloads/$PROJECT/tech-stack-overview/styles/globals.css)

Add RetroUI design tokens and utilities:
- CSS custom properties for RetroUI colors (`--retro-yellow`, `--retro-green`, `--retro-red`, `--retro-cyan`, `--retro-cream`, `--retro-dark`)
- `.retro-btn` layered button styles  
- `@keyframes float` for subtle animations
- Import Space Grotesk font via `@import`

## Verification Plan

### Automated Tests
1. Run `npx tsc --noEmit` to verify TypeScript compiles without errors
2. Run `npm run build` to verify production build succeeds
3. Verify the dev server starts with `npm run dev`

### Manual Verification
- Navigate to an existing interview page and confirm the new RetroUI design renders
- Verify countdown timer starts and counts down
- Verify "End Interview" button redirects to evaluation
- Test the coach chat still works (DeepSeek)
- Test question generation still works (Gemini)
- Test answer evaluation still works (Gemini)
