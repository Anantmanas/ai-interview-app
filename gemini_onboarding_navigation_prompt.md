# Gemini CLI — Onboarding Wizard + Navigation Fix
# Problem: Users can't find their way from sign-up → dashboard → first interview
# Stack: Next.js 16, Supabase, Tailwind, shadcn/ui, motion/react
# Read every file before editing. No commands. Stop after each block and report.

---

## SYSTEM DESIGN CONTEXT

### User activation funnel (current — broken)
```
Sign up
  ↓
Dashboard (cold, empty, no direction)
  ↓ [users confused, leave]
```

### Target activation funnel (after this prompt)
```
Sign up
  ↓
Onboarding wizard (3 steps, <90 seconds)
  ↓
Dashboard with "Next Step" banner (single clear action)
  ↓
First interview started
  ↓
Results → Roadmap generated
  ↓ [user retained]
```

### Data model for onboarding state
Track progress in `profiles` table. Add column if missing:
```sql
-- Run in Supabase SQL editor:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 0;
```

---

## BLOCK 1 — Onboarding Wizard

### 1A. Create `app/onboarding/page.tsx`

This is a standalone full-page wizard. NOT inside the dashboard layout.
Users land here automatically after their first sign-up, before seeing the dashboard.

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

// Step definitions
const STEPS = [
  { id: 1, key: 'resume',  label: 'Resume',      title: 'Ground your AI interviewer' },
  { id: 2, key: 'role',    label: 'Target role',  title: 'Set your target' },
  { id: 3, key: 'ready',   label: 'Launch',       title: "You're ready" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [targetRole, setTargetRole] = useState('Frontend Engineer')
  const [uploading, setUploading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const ROLES = [
    'Frontend Engineer', 'Full Stack Developer', 'Backend Engineer',
    'AI / ML Engineer', 'DevOps Engineer', 'Mobile Developer',
    'Data Engineer', 'Cloud Architect', 'System Design Engineer',
  ]

  const handleSkipResume = () => setStep(2)

  const handleRoleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        target_role: targetRole,
        onboarding_step: 2,
      }).eq('id', user.id)
    }
    setSaving(false)
    setStep(3)
  }

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_step: 3,
      }).eq('id', user.id)
    }
    router.push('/interview/new')   // go straight to interview, not empty dashboard
  }

  const handleGoToDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #00D4AA, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #7B6FFF, transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[520px]">

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold border transition-all duration-300 ${
                  step > s.id
                    ? 'bg-[#00D4AA] border-[#00D4AA] text-[#080810]'
                    : step === s.id
                    ? 'border-[#00D4AA] text-[#00D4AA] bg-transparent'
                    : 'border-[#3A3A5C] text-[#6B6B8A] bg-transparent'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-[11px] font-mono uppercase tracking-[0.06em] hidden sm:block transition-colors ${
                  step >= s.id ? 'text-[#B8B8D4]' : 'text-[#3A3A5C]'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-all duration-500 ${
                  step > s.id ? 'bg-[#00D4AA]' : 'bg-[#1C1C36]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">

          {/* Step 1 — Resume */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-[#0E0E1A]/80 backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>

                <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.12em] mb-3">
                  Step 1 of 3
                </p>
                <h1 className="font-display text-[28px] font-bold text-[#F0F0FF] leading-tight mb-3">
                  Ground your AI interviewer
                </h1>
                <p className="text-[#6B6B8A] text-[14px] leading-relaxed mb-8">
                  Upload your resume and every question gets calibrated to your actual background, tech stack, and experience level. Takes 30 seconds.
                </p>

                {/* Upload zone */}
                <div className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all cursor-pointer ${
                  resumeUploaded
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#3A3A5C] hover:border-[#6B6B8A] bg-[#14142A]/50'
                }`}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  {resumeUploaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#00D4AA]/20 flex items-center justify-center">
                        <span className="text-[#00D4AA] text-lg">✓</span>
                      </div>
                      <p className="text-[#00D4AA] text-[13px] font-medium">Resume uploaded and parsed</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#1C1C36] flex items-center justify-center mb-1">
                        <span className="text-[#6B6B8A] text-xl">↑</span>
                      </div>
                      <p className="text-[#B8B8D4] text-[13px] font-medium">
                        {uploading ? 'Parsing your resume...' : 'Drop your PDF here or click to browse'}
                      </p>
                      <p className="text-[#6B6B8A] text-[11px]">PDF only · Max 10MB</p>
                    </div>
                  )}
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(true)
                      const form = new FormData()
                      form.append('file', file)
                      try {
                        await fetch('/api/resume', { method: 'POST', body: form })
                        setResumeUploaded(true)
                      } catch (err) {
                        console.error('Upload error:', err)
                      } finally {
                        setUploading(false)
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!resumeUploaded}
                    className="flex-1 bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold border-0 h-11 disabled:opacity-30"
                  >
                    Continue →
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSkipResume}
                    className="text-[#6B6B8A] hover:text-[#B8B8D4] h-11 px-4"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Target role */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-[#0E0E1A]/80 backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>

                <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.12em] mb-3">
                  Step 2 of 3
                </p>
                <h1 className="font-display text-[28px] font-bold text-[#F0F0FF] leading-tight mb-3">
                  What are you targeting?
                </h1>
                <p className="text-[#6B6B8A] text-[14px] leading-relaxed mb-6">
                  Your target role shapes the difficulty, topics, and question types the AI generates in every session.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-2 rounded-lg text-[12px] font-mono border transition-all ${
                        targetRole === role
                          ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]'
                          : 'border-[#3A3A5C] text-[#6B6B8A] hover:border-[#6B6B8A] hover:text-[#B8B8D4]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Custom role input */}
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Or type a custom role..."
                  className="w-full bg-[#14142A] border border-[#3A3A5C] rounded-lg px-4 py-2.5 text-[13px] text-[#F0F0FF] placeholder:text-[#3A3A5C] focus:outline-none focus:border-[#00D4AA] transition-colors mb-6"
                />

                <Button
                  onClick={handleRoleSave}
                  disabled={!targetRole || saving}
                  className="w-full bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold border-0 h-11"
                >
                  {saving ? 'Saving...' : 'Set target →'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Launch */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-[#0E0E1A]/80 backdrop-blur-md border border-[rgba(0,212,170,0.2)] rounded-2xl p-8 text-center"
                style={{ boxShadow: 'inset 0 1px 0 rgba(0,212,170,0.1), 0 0 40px rgba(0,212,170,0.06)' }}>

                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#7B6FFF] flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-[#080810] text-2xl font-bold">✓</span>
                </motion.div>

                <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.12em] mb-3">
                  Setup complete
                </p>
                <h1 className="font-display text-[28px] font-bold text-[#F0F0FF] leading-tight mb-3">
                  Your session is calibrated
                </h1>
                <p className="text-[#6B6B8A] text-[14px] leading-relaxed mb-8">
                  Target: <span className="text-[#B8B8D4] font-medium">{targetRole}</span>.
                  Your AI interviewer is ready. The first session will establish your baseline score and identify improvement areas.
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleFinish}
                    className="w-full bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold border-0 h-12 text-[15px]"
                  >
                    Start first interview →
                  </Button>
                  <button
                    onClick={handleGoToDashboard}
                    className="text-[#6B6B8A] text-[12px] hover:text-[#B8B8D4] transition-colors py-2"
                  >
                    Go to dashboard instead
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

### 1B. Redirect new users to onboarding after sign-up

**File:** `app/auth/callback/route.ts` or wherever OAuth/email confirmation redirects

Find the redirect after successful auth. Add logic to check if onboarding is completed:

```ts
// After successful auth, before redirecting to /dashboard:
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', user.id)
  .single()

// New user: go to onboarding
if (!profile?.onboarding_completed) {
  return NextResponse.redirect(new URL('/onboarding', request.url))
}

// Returning user: go to dashboard
return NextResponse.redirect(new URL('/dashboard', request.url))
```

Also apply same check in `app/dashboard/layout.tsx` server-side guard:

```ts
// After confirming user is authenticated:
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', user.id)
  .single()

if (!profile?.onboarding_completed) {
  redirect('/onboarding')
}
```

---

## BLOCK 2 — "Next Step" Banner on Dashboard

### 2A. Create `components/dashboard/next-step-banner.tsx`

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

interface NextStepBannerProps {
  hasResume: boolean
  interviewCount: number
  avgScore: number
  hasRoadmap: boolean
  weaknessCount: number
}

interface Step {
  label: string
  description: string
  cta: string
  href: string
  color: string
  glowColor: string
}

export function NextStepBanner({
  hasResume,
  interviewCount,
  avgScore,
  hasRoadmap,
  weaknessCount,
}: NextStepBannerProps) {
  const router = useRouter()

  // Determine the single most important next action
  const getNextStep = (): Step => {
    if (!hasResume) return {
      label: 'SETUP',
      description: 'Upload your resume to get questions tailored to your background.',
      cta: 'Upload Resume →',
      href: '/dashboard/resume',
      color: '#FFD700',
      glowColor: 'rgba(255,215,0,0.08)',
    }
    if (interviewCount === 0) return {
      label: 'GET STARTED',
      description: 'Run your first mock interview to establish your baseline score.',
      cta: 'Start first interview →',
      href: '/interview/new',
      color: '#00D4AA',
      glowColor: 'rgba(0,212,170,0.08)',
    }
    if (weaknessCount > 0 && !hasRoadmap) return {
      label: 'ACTION REQUIRED',
      description: `${weaknessCount} weak areas identified. Generate your personalized study plan.`,
      cta: 'Generate roadmap →',
      href: '/dashboard/roadmap',
      color: '#FF6B9D',
      glowColor: 'rgba(255,107,157,0.08)',
    }
    if (avgScore < 50 && interviewCount > 0) return {
      label: 'KEEP PRACTICING',
      description: `Average score is ${avgScore}%. Practice more sessions to improve.`,
      cta: 'Practice now →',
      href: '/interview/new',
      color: '#7B6FFF',
      glowColor: 'rgba(123,111,255,0.08)',
    }
    if (hasRoadmap) return {
      label: 'CONTINUE LEARNING',
      description: 'Your study plan is ready. Pick up where you left off.',
      cta: 'Open study plan →',
      href: '/dashboard/roadmap',
      color: '#00D4AA',
      glowColor: 'rgba(0,212,170,0.08)',
    }
    return {
      label: 'READY',
      description: 'Keep your streak going with another practice session.',
      cta: 'Start interview →',
      href: '/interview/new',
      color: '#00D4AA',
      glowColor: 'rgba(0,212,170,0.08)',
    }
  }

  const step = getNextStep()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative rounded-xl border overflow-hidden mb-6 cursor-pointer group"
      style={{
        background: step.glowColor,
        borderColor: `${step.color}30`,
      }}
      onClick={() => router.push(step.href)}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${step.color}60, transparent)` }} />

      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{ background: step.color }} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-0.5"
              style={{ color: step.color }}>
              {step.label}
            </p>
            <p className="text-[13px] text-[#B8B8D4] leading-snug">{step.description}</p>
          </div>
        </div>
        <span
          className="font-mono text-[12px] whitespace-nowrap ml-4 group-hover:translate-x-0.5 transition-transform"
          style={{ color: step.color }}
        >
          {step.cta}
        </span>
      </div>
    </motion.div>
  )
}
```

### 2B. Wire banner into dashboard page

**File:** `app/dashboard/page.tsx`

Import and add the banner at the top of the content area, passing real data:

```tsx
import { NextStepBanner } from '@/components/dashboard/next-step-banner'

// In the page JSX, immediately after the header row:
<NextStepBanner
  hasResume={!!profile?.resume_text}
  interviewCount={totalInterviews}
  avgScore={Math.round(averageScore)}
  hasRoadmap={roadmapItems.length > 0}
  weaknessCount={activeWeaknesses}
/>
```

---

## BLOCK 3 — Sidebar Navigation Rename

**File:** `components/dashboard/sidebar.tsx`

Read the file. Find the nav items array (likely an array of objects with `href`, `label`, `icon`).

Make ONLY these label changes — do not change hrefs, icons, or any logic:

```ts
// FIND → REPLACE (labels only):
'Dashboard'          → 'Home'
'Start Interview'    → 'Practice Now'
'Interview History'  → 'Past Sessions'
'Analytics'          → 'My Progress'
'Learning Roadmap'   → 'Study Plan'
'Resume'             → 'My Resume'
```

Section group headers — rename to task-oriented language:
```ts
'MAIN'     → 'PRACTICE'
'PROGRESS' → 'INSIGHTS'
'ACCOUNT'  → 'ACCOUNT'   // keep as-is
```

Also find the sidebar logo/brand area where it says "NEO v2.0" and confirm it reads "CONSOLE v2.0" — if still "NEO", change it.

---

## BLOCK 4 — Empty State Improvements

### 4A. Dashboard "Past Sessions" empty state

**File:** wherever the recent interviews list renders

Find the empty state (when `recentInterviews.length === 0`). Replace generic text with action-directed copy:

```tsx
// Replace existing empty state with:
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-10 h-10 rounded-full bg-[#1C1C36] border border-[#3A3A5C] flex items-center justify-center mb-4">
    <span className="text-[#6B6B8A] text-lg">▶</span>
  </div>
  <p className="text-[#B8B8D4] text-[14px] font-medium mb-1">No sessions yet</p>
  <p className="text-[#6B6B8A] text-[12px] mb-4 max-w-[240px]">
    Your first mock interview will appear here after you complete it.
  </p>
  <a
    href="/interview/new"
    className="font-mono text-[11px] text-[#00D4AA] border border-[#00D4AA]/30 rounded-lg px-4 py-2 hover:bg-[#00D4AA]/5 transition-colors uppercase tracking-[0.06em]"
  >
    Start practice →
  </a>
</div>
```

### 4B. Study Plan empty state

**File:** `app/dashboard/roadmap/page.tsx`

The roadmap shows a red error toast for empty state. Replace with:

```tsx
// Remove toast.error() call for "no weaknesses" case
// Replace with inline content:
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-12 h-12 rounded-full bg-[#1C1C36] border border-[#3A3A5C] flex items-center justify-center mb-4">
    <span className="text-[#6B6B8A] text-xl">🗺</span>
  </div>
  <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.1em] mb-2">
    No plan generated yet
  </p>
  <p className="text-[#6B6B8A] text-[13px] max-w-[380px] leading-relaxed mb-6">
    Complete a mock interview session to identify your weak areas, then generate a personalized study plan with curated resources.
  </p>
  <div className="flex gap-3">
    <a
      href="/interview/new"
      className="font-mono text-[12px] bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold px-5 py-2.5 rounded-lg"
    >
      Run an interview first →
    </a>
  </div>
</div>
```

---

## BLOCK 5 — Post-interview redirect to roadmap prompt

**File:** wherever the interview session ends and redirects (likely `components/interview/interview-room.tsx`)

After the results page renders, add a sticky bottom CTA that only shows if weaknesses were found:

```tsx
// Add after score display, if weaknesses.length > 0:
{weaknesses.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0E0E1A]/95 backdrop-blur border-t border-[rgba(255,255,255,0.08)]">
    <div className="max-w-[600px] mx-auto flex items-center justify-between gap-4">
      <div>
        <p className="text-[#FF6B9D] text-[12px] font-mono uppercase tracking-[0.06em] mb-0.5">
          {weaknesses.length} weak areas identified
        </p>
        <p className="text-[#B8B8D4] text-[13px]">
          Generate your study plan to fix them.
        </p>
      </div>
      <a
        href="/dashboard/roadmap"
        className="flex-shrink-0 font-mono text-[12px] bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold px-5 py-2.5 rounded-lg whitespace-nowrap"
      >
        Build roadmap →
      </a>
    </div>
  </div>
)}
```

---

## VERIFICATION

```
Block 1 done when:
  □ Create a new account → lands on /onboarding (not /dashboard)
  □ Skip resume → moves to step 2
  □ Select role → moves to step 3
  □ Click "Start first interview" → goes to /interview/new
  □ Existing users logging in → go directly to /dashboard (not /onboarding)

Block 2 done when:
  □ New user (no resume): banner shows "Upload Resume →" in gold
  □ User with resume, no interviews: banner shows "Start first interview →" in emerald
  □ User with interviews, weaknesses, no roadmap: banner shows "Generate roadmap →" in rose
  □ Clicking banner navigates to correct page

Block 3 done when:
  □ Sidebar shows: Home, Practice Now, Past Sessions, My Progress, Study Plan
  □ Section headers: PRACTICE, INSIGHTS, ACCOUNT
  □ All hrefs still work (unchanged)

Block 4 done when:
  □ Empty dashboard history list shows action card, not blank
  □ Empty roadmap shows inline empty state — NO red toast error

Block 5 done when:
  □ Complete an interview with a low score
  □ Results page shows sticky bottom banner with "Build roadmap →"
```

---

## DO NOT

- Do not change any API route, Supabase query, or interview logic
- Do not add new npm packages — motion/react and shadcn are already installed
- Do not change the interview room UI
- Do not change the landing page
- Do not modify `next.config.mjs`
- Do not change href values on sidebar items — only labels
- Do not run any shell commands
