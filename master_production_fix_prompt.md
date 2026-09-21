# MASTER PRODUCTION FIX PROMPT — InterviewAI
# Generated: 2026-09-22 | Based on: APP_MAP.md full audit + 6 live screenshots
# Goal: Enterprise-grade Next.js SaaS — UI, functionality, security, optimization
# Agent rules: Read every file before editing. No commands unless explicitly listed. Fix in priority order. Stop and report after each numbered block.

---

## AGENT RULES

1. Work through blocks P0 → P1 → P2 → P3 in strict order
2. Read the target file completely before making any edit
3. After completing each block, output: "BLOCK [X] COMPLETE — files changed: [list]"
4. Never skip a block to get to a later one
5. If a file doesn't exist at the path listed, report it and continue to the next fix
6. Do NOT run npm, node, or any shell command unless the block explicitly says "RUN:"
7. Do NOT change any file not listed in the block you're working on

---

## P0 — CRITICAL BLOCKERS (app is broken without these)

### P0.1 — Fix invalid OpenRouter model string (AI interview + roadmap both broken)

**Files:** `.env` (or `.env.local`), and wherever `OPENROUTER_MODEL` is consumed

The current value `openrouter/free` is not a real model identifier — OpenRouter returns 400 on every AI call.

**In `.env` / `.env.local`, change:**
```
OPENROUTER_MODEL=openrouter/free
OPENROUTER_EVAL_MODEL=openrouter/free
```
**To:**
```
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_EVAL_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

Also find `lib/ai/client.ts`. Locate the fallback model array. Ensure it contains:
```ts
const freeModels = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
]
```

Remove any entry containing `'openrouter/free'` or `'openrouter/auto'` — these are not valid model IDs.

Also update `.env.example`:
```
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_EVAL_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

---

### P0.2 — Fix PDF metadata token poisoning `full_name` field ("Welcome back, endobj")

**Root cause:** `pdf-parse` extracts raw PDF binary tokens including `endobj`, `stream`, `xref` etc. The resume parser writes raw extracted text into `profiles.full_name` without sanitization.

**File:** `app/api/resume/route.ts`

Find the `parseName` function or wherever `full_name` is set before the Supabase upsert.

Add this sanitizer immediately before any Supabase write:

```ts
function sanitizeFullName(raw: string): string {
  if (!raw) return ''

  // PDF binary artifact tokens to reject entirely
  const PDF_ARTIFACTS = [
    'endobj', 'endstream', 'stream', 'xref', 'trailer',
    'startxref', 'obj', '>>',  'BT', 'ET', 'Tf', 'Td', 'Tj',
  ]

  const lower = raw.toLowerCase().trim()

  // Reject if it IS a known artifact
  if (PDF_ARTIFACTS.some(token => lower === token.toLowerCase())) return ''

  // Reject if it contains PDF-specific patterns
  if (/^\d+\s+\d+\s+obj/.test(raw)) return ''
  if (/^%PDF/.test(raw)) return ''
  if (raw.length < 2 || raw.length > 80) return ''

  // Allow only: letters, spaces, hyphens, apostrophes, dots
  const cleaned = raw.replace(/[^a-zA-Z\s\-'.]/g, '').trim()

  // Must look like a real name: at least 2 chars, no digit sequences
  if (cleaned.length < 2) return ''
  if (/\d{3,}/.test(cleaned)) return ''

  return cleaned
}
```

Apply it:
```ts
// Before any profile upsert:
const safeName = sanitizeFullName(resumeData.name || '')

await supabase.from('profiles').update({
  full_name: safeName || null,   // null if sanitizer rejects it — never write garbage
  target_role: resumeData.targetRole || null,
  resume_text: markdown,
}).eq('id', user.id)
```

Also find `lib/resume/parser-service.ts`. In the OpenAI extraction prompt, add this instruction:
```
"name" must be a human full name (2-4 words, letters only). If you cannot confidently identify a human name, return null for name.
```

---

### P0.3 — Silent billing failure — show error when Razorpay keys missing

**File:** wherever the "Upgrade to Pro" button handler lives (likely `app/dashboard/billing/page.tsx` or `components/billing/upgrade-button.tsx`)

Find the click handler. Currently it calls Razorpay SDK with undefined key — fails silently.

Add a guard at the very top of the handler:

```ts
const handleUpgrade = async () => {
  // Guard: fail loudly if keys not configured
  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    toast.error('Payment system is not configured. Please contact support.')
    console.error('[Billing] NEXT_PUBLIC_RAZORPAY_KEY_ID is not set')
    return
  }
  // ... rest of existing handler
}
```

This converts the invisible no-op into a visible error until keys are added.

---

### P0.4 — Silent resume upload failure — show error when UploadThing token missing

**File:** `app/api/uploadthing/core.ts` or the UploadThing router config file

Add at the top of the file:
```ts
if (!process.env.UPLOADTHING_TOKEN) {
  console.error('[UploadThing] UPLOADTHING_TOKEN is not set — file uploads will fail with 401')
}
```

**File:** wherever the resume dropzone error handler is (likely `components/dashboard/resume-uploader.tsx` or similar)

Find the `onUploadError` callback. Replace any empty handler or generic message with:
```ts
onUploadError: (error) => {
  console.error('[Resume Upload] Error:', error)
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    toast.error('Resume upload is temporarily unavailable. Please try again later.')
  } else {
    toast.error(`Upload failed: ${error.message || 'Unknown error'}`)
  }
},
```

---

### P0.5 — Remove `meta-generator: v0.app` leaking from HTML head

**Found on:** live production site `https://ai-interview-app-virid.vercel.app/`

The HTML `<head>` contains `<meta name="generator" content="v0.app">` — this exposes your
toolchain to anyone who views source, including competitors and security scanners.

**File:** `app/layout.tsx`

Find the `metadata` export. Add an `other` field to override it:

```ts
export const metadata: Metadata = {
  // ... existing fields ...
  other: {
    generator: '',   // empty string overrides the v0.app generator tag
  },
}
```

If the `metadata` export doesn't have an `other` field yet, add it alongside the existing fields.

---

### P0.6 — Fix typewriter showing empty "Practicing:" on initial load

**Found on:** live production site — "Practicing:" text appears with blank content before the
hook types the first word.

**File:** `app/page.tsx`

Find the `useTypewriter` hook call or the state initialization for the typewriter.

Change the initial state from empty string to the first word in the array:

```tsx
// FIND — empty initial state:
const [displayed, setDisplayed] = useState('')

// REPLACE WITH — seed the first word so it's never blank:
const [displayed, setDisplayed] = useState('DSA & Coding Interviews')
```

If the hook is defined separately and takes an `initialValue` param, pass the first word:
```tsx
const roles = useTypewriter(
  ['DSA & Coding Interviews', 'System Design Rounds', 'Behavioral Questions', 'React & Frontend Rounds', 'FAANG Interview Prep'],
  80,
  2000,
  'DSA & Coding Interviews'  // initial value — never shows blank
)
```

---

## P1 — HIGH PRIORITY (broken UX, wrong branding, data integrity)

### P1.1 — Delete dead code: `components/sidebar.tsx`

This file contains Aceternity UI boilerplate with hardcoded "Acet Labs" branding and "Manu Arora" avatar. It is not imported anywhere in production.

**Action:** Delete `components/sidebar.tsx` entirely.

Confirm by running this grep first — if it returns any non-test import, do NOT delete:
```
Search all .tsx and .ts files for: from.*components/sidebar
```
If zero results → delete the file.

---

### P1.2 — Fix `--primary` color token back to Electric Indigo (screenshots show it's correct now but audit the CSS to confirm)

**File:** `app/globals.css`

Confirm lines 65 and 105 both read:
```css
--primary: #4f46e5;
--primary-foreground: #f8fafc;
```

The APP_MAP confirms the design is now "Electric Indigo & Pitch Black" — this is the intentional design, NOT the Depot green system from earlier. Do NOT change it to `#71d083`. The current indigo system is correct per the audit.

---

### P1.3 — Expensive backdrop blur on nav — reduce paint cost

**File:** `components/resizable-navbar.tsx`

Find the nav element with `backdrop-blur-xl` or `backdrop-filter: blur(24px)`.

Change:
```
backdrop-blur-xl  →  backdrop-blur-md
```

This reduces paint area expansion from 1.8x to ~1.2x per the MotionScore audit recommendation.

---

### P1.4 — Add `will-change` to motion elements for GPU layer promotion

**File:** `app/page.tsx`

Find every `motion.div` or `motion.section` that uses `whileInView` with `transform` or `opacity` animations.

Add `style={{ willChange: 'transform, opacity' }}` to each:

```tsx
// Pattern to find and update:
<motion.div
  whileInView={{ opacity: 1, y: 0 }}
  initial={{ opacity: 0, y: 24 }}
  viewport={{ once: true }}
  // ADD THIS:
  style={{ willChange: 'transform, opacity' }}
>
```

Apply to feature cards, workflow steps, and hero elements — any element with `whileInView`.

After all are updated, add a cleanup on animation complete to free GPU memory:
```tsx
onAnimationComplete={() => {
  // Free the GPU layer after animation completes
}}
```

Actually — instead of per-element cleanup, add this to `app/globals.css`:
```css
/* Release will-change after animation completes — prevents permanent layer promotion */
@media (prefers-reduced-motion: no-preference) {
  [data-animated="true"] {
    will-change: auto;
  }
}
```

---

### P1.5 — Replace scroll listeners with Intersection Observer pattern

**File:** `app/page.tsx`

Find any usage of `useScroll` from `motion/react`. The MotionScore audit found 2 scroll listeners adding overhead on every scroll event.

Replace the `useScroll` pattern:
```tsx
// REMOVE:
const { scrollY } = useScroll()
const opacity = useTransform(scrollY, [0, 100], [1, 0])

// REPLACE WITH: CSS-only scroll fade using Tailwind
// or use whileInView with viewport margin instead of scroll transforms
```

If `useScroll` is used for the navbar hide/show behavior, replace with:
```ts
// Intersection Observer — zero scroll listener overhead
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setIsScrolled(!entry.isIntersecting),
    { threshold: 0.1 }
  )
  const sentinel = document.getElementById('scroll-sentinel')
  if (sentinel) observer.observe(sentinel)
  return () => observer.disconnect()
}, [])
```

Add a sentinel div at the top of the page:
```tsx
<div id="scroll-sentinel" className="absolute top-20 h-px w-full pointer-events-none" aria-hidden="true" />
```

---

### P1.6 — History page: show "Score pending" instead of "0% SCORE" for unscored sessions

**File:** wherever interview history rows are rendered (likely `app/dashboard/history/page.tsx`)

Find the score badge rendering. The 0% score is confusing — users think they scored 0, not that scores weren't recorded.

```tsx
// CHANGE:
<span>{score}%</span>

// TO:
{score > 0 ? (
  <span className="font-mono text-[11px] text-[#22c55e] bg-[#0a1f0e] border border-[#166534] rounded-[2px] px-2 py-0.5">
    {score}% SCORE
  </span>
) : (
  <span className="font-mono text-[11px] text-[#64748b] bg-[#0f0f18] border border-[#1e1e2f] rounded-[2px] px-2 py-0.5">
    — PENDING
  </span>
)}
```

---

### P1.7 — Dashboard: collapse resume executive summary to 2 lines by default

**File:** `app/dashboard/page.tsx` or `components/dashboard/resume-summary.tsx`

The resume card shows full executive summary text — it's too tall and pushes stats cards down.

Find the element rendering `overview_summarized` or `summary` text. Add line clamp:

```tsx
// ADD className:
className="... line-clamp-2 cursor-pointer"
onClick={() => setExpanded(!expanded)}
```

Add expand state:
```tsx
const [expanded, setExpanded] = useState(false)

// Apply conditionally:
className={`font-body text-[13px] text-[#9ca3af] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
```

Add a toggle hint below:
```tsx
{!expanded && (
  <button
    onClick={() => setExpanded(true)}
    className="font-mono text-[10px] text-[#4f46e5] hover:text-[#818cf8] transition-colors mt-1"
  >
    EXPAND ↓
  </button>
)}
```

---

## P2 — MEDIUM PRIORITY (UX polish, production standards)

### P2.1 — Add skeleton loading states to dashboard stats cards

**File:** `app/dashboard/page.tsx`

Find where the 4 stats cards render. Add a loading state:

```tsx
// Add state:
const [isLoading, setIsLoading] = useState(true)

// Skeleton card component (add above page component):
function StatCardSkeleton() {
  return (
    <div className="bg-[#09090e] border border-[#1e1e2f] rounded-[6px] p-5">
      <div className="skeleton h-3 w-24 mb-4 rounded" />
      <div className="skeleton h-8 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  )
}

// Render:
{isLoading ? (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
    {[0,1,2,3].map(i => <StatCardSkeleton key={i} />)}
  </div>
) : (
  // existing stats cards
)}
```

Set `setIsLoading(false)` after the Supabase data fetch resolves.

---

### P2.2 — Add rate limit feedback to AI routes

**Files:** `app/api/interview/chat/route.ts`, `app/api/interviews/[id]/evaluate/route.ts`, `app/api/roadmap/generate/route.ts`

In each file, find where the rate limit check returns 429. Add a `Retry-After` header:

```ts
return NextResponse.json(
  {
    error: 'Daily limit reached.',
    message: plan === 'free'
      ? 'You have used your 3 free AI sessions today. Upgrade to Pro for unlimited access.'
      : 'Daily session limit reached. Resets at midnight.',
    upgradeUrl: '/dashboard/billing',
  },
  {
    status: 429,
    headers: {
      'Retry-After': '86400',
      'X-RateLimit-Plan': plan,
    },
  }
)
```

---

### P2.3 — Add input sanitization to profile save handler

**File:** wherever `POST` or `PUT` to `/api/profile` is handled, or the Supabase update in `app/dashboard/profile/page.tsx`

Add before any Supabase write:
```ts
function sanitizeProfileInput(value: string, maxLength: number): string {
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[^\w\s\-'.,@]/g, '')     // allow only safe chars
}

// Apply:
const safeName = sanitizeProfileInput(formData.fullName, 80)
const safeRole = sanitizeProfileInput(formData.targetRole, 100)
const safeCompanies = formData.targetCompanies
  .split(',')
  .map(c => sanitizeProfileInput(c.trim(), 50))
  .filter(Boolean)
  .slice(0, 10)  // max 10 companies
  .join(', ')
```

---

### P2.4 — Add Content Security Policy headers

**File:** `next.config.mjs`

Add CSP and security headers:

```js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'microphone=(self), camera=(), geolocation=()',
  },
]

// Add to nextConfig:
const nextConfig = {
  // ... existing config ...
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

Note: `microphone=(self)` is required — the interview room uses `getUserMedia` for voice.

---

### P2.5 — Fix autofill background on login form inputs

**File:** `app/globals.css`

The email input shows a blue/dark autofill color from Chrome. Override it:

```css
/* Force dark autofill background — Chrome override */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 40px #161624 inset !important;
  -webkit-text-fill-color: #f8fafc !important;
  caret-color: #f8fafc !important;
  transition: background-color 9999s ease-in-out 0s;
}
```

---

### P2.6 — Add `robots.txt` and `sitemap.xml`

**Create file:** `app/robots.txt`
```
User-agent: *
Allow: /
Allow: /pricing
Disallow: /dashboard/
Disallow: /interview/
Disallow: /api/
Sitemap: https://ai-interview-app-virid.vercel.app/sitemap.xml
```

**Create file:** `app/sitemap.ts`
```ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-interview-app-virid.vercel.app'

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/auth/sign-up`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
  ]
}
```

---

### P2.7 — Add Open Graph meta tags to landing page

**File:** `app/page.tsx` or `app/layout.tsx`

Add to the root `layout.tsx` metadata export:

```ts
export const metadata: Metadata = {
  title: 'InterviewAI — Master Technical Interviews with AI',
  description: 'Practice with an AI interviewer that adapts to your skill level. Real-time scoring, weakness detection, and personalized learning roadmaps.',
  keywords: ['technical interview', 'AI mock interview', 'coding interview prep', 'system design', 'FAANG prep'],
  openGraph: {
    title: 'InterviewAI — Master Technical Interviews with AI',
    description: 'AI-powered mock interviews with real-time scoring and personalized roadmaps.',
    url: 'https://ai-interview-app-virid.vercel.app',
    siteName: 'InterviewAI',
    type: 'website',
    images: [
      {
        url: '/og-image.png',  // Create this 1200×630 image
        width: 1200,
        height: 630,
        alt: 'InterviewAI — AI-Powered Technical Interview Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewAI — Master Technical Interviews with AI',
    description: 'AI-powered mock interviews with real-time scoring.',
    images: ['/og-image.png'],
  },
}
```

---

## P3 — OPTIMIZATION & POLISH

### P3.1 — Fix "NEO v2.0" branding in sidebar header

**File:** `components/dashboard/sidebar.tsx`

Find the version badge. It shows "NEO v2.0" but the login page shows "CONSOLE v2.0" — inconsistent.

Change:
```tsx
// CHANGE:
NEO v2.0
// TO:
CONSOLE v2.0
```

Apply consistently. Search for all occurrences of "NEO v2.0" in the codebase and replace with "CONSOLE v2.0".

---

### P3.2 — Roadmap page: improve empty state message

**File:** `app/dashboard/roadmap/page.tsx`

The current toast error says: "No significant weaknesses found to generate a roadmap. Complete more practice interviews first!"

This is shown as a red error toast — but it's actually just an empty state, not an error.

Find where this toast is triggered. Change from `toast.error(...)` to the empty state UI:

```tsx
// REMOVE the toast.error call for this specific case
// INSTEAD render an inline empty state with instructions:

{!hasWeaknesses && (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-[#0f0f18] border border-[#1e1e2f] flex items-center justify-center mb-4">
      <span className="text-[20px]">🗺️</span>
    </div>
    <p className="font-mono text-[11px] text-[#4f46e5] uppercase tracking-[0.1em] mb-2">
      // NO ROADMAP GENERATED
    </p>
    <p className="font-body text-[14px] text-[#9ca3af] max-w-[400px] leading-relaxed mb-6">
      Complete at least one scored interview session to generate a personalized learning roadmap based on your weak areas.
    </p>
    <a
      href="/interview/new"
      className="font-mono text-[12px] bg-[#4f46e5] text-white uppercase tracking-[0.05em] px-5 py-2.5 rounded-[6px] hover:bg-[#5865f2] transition-colors"
    >
      START AN INTERVIEW →
    </a>
  </div>
)}
```

---

### P3.3 — Add `loading.tsx` skeleton pages for all dashboard routes

**Create these files** (each is a simple skeleton that shows while the page data loads):

**`app/dashboard/loading.tsx`:**
```tsx
export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="skeleton h-8 w-64 rounded" />
      <div className="grid grid-cols-4 gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-[#09090e] border border-[#1e1e2f] rounded-[6px] p-5 space-y-3">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-8 w-16 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-[#09090e] border border-[#1e1e2f] rounded-[6px] p-5 space-y-3 h-64">
          <div className="skeleton h-4 w-40 rounded" />
          {[0,1,2,3,4].map(i => <div key={i} className="skeleton h-10 rounded" />)}
        </div>
        <div className="bg-[#09090e] border border-[#1e1e2f] rounded-[6px] p-5 h-64">
          <div className="skeleton h-4 w-32 rounded mb-3" />
          <div className="skeleton h-32 rounded" />
        </div>
      </div>
    </div>
  )
}
```

**`app/dashboard/history/loading.tsx`:**
```tsx
export default function HistoryLoading() {
  return (
    <div className="p-8 space-y-3">
      <div className="skeleton h-8 w-48 rounded mb-6" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#09090e] border border-[#1e1e2f] rounded-[6px] p-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>
          <div className="skeleton h-6 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}
```

Create equivalent simple skeleton files for:
- `app/dashboard/analytics/loading.tsx`
- `app/dashboard/roadmap/loading.tsx`
- `app/dashboard/billing/loading.tsx`

Pattern is the same — a full-page skeleton that matches the rough layout of each page.

---

### P3.4 — Add `error.tsx` boundary pages for dashboard routes

**Create `app/dashboard/error.tsx`:**
```tsx
'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <p className="font-mono text-[11px] text-[#ef4444] uppercase tracking-[0.1em] mb-3">
        // RUNTIME ERROR
      </p>
      <h2 className="font-display text-[24px] font-bold text-[#f8fafc] mb-2">
        Something went wrong
      </h2>
      <p className="font-body text-[14px] text-[#9ca3af] max-w-[400px] mb-6">
        {error.message || 'An unexpected error occurred. The error has been logged.'}
      </p>
      <button
        onClick={reset}
        className="font-mono text-[12px] bg-[#4f46e5] text-white uppercase tracking-[0.05em] px-5 py-2.5 rounded-[6px] hover:bg-[#5865f2] transition-colors"
      >
        TRY AGAIN
      </button>
    </div>
  )
}
```

---

### P3.5 — Add Open Graph + Twitter meta tags (missing from live site)

**Found on:** live production — sharing the URL on WhatsApp, LinkedIn, or Twitter shows a
blank card with no image, no title, no description.

**File:** `app/layout.tsx`

Find the existing `metadata` export. Replace or extend it with the full OG block:

```ts
export const metadata: Metadata = {
  title: 'InterviewAI — Master Technical Interviews with AI',
  description: 'Practice with an AI interviewer that adapts to your skill level. Real-time scoring, weakness detection, and personalized learning roadmaps.',
  keywords: ['technical interview', 'AI mock interview', 'coding interview prep', 'system design', 'FAANG prep', 'interview simulator'],
  openGraph: {
    title: 'InterviewAI — Master Technical Interviews with AI',
    description: 'AI-powered mock interviews with real-time scoring, weakness detection, and personalized study roadmaps.',
    url: 'https://ai-interview-app-virid.vercel.app',
    siteName: 'InterviewAI',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InterviewAI — AI-Powered Technical Interview Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewAI — Master Technical Interviews with AI',
    description: 'AI-powered mock interviews with real-time scoring and personalized roadmaps.',
    images: ['/og-image.png'],
  },
  other: {
    generator: '',  // removes v0.app generator tag (P0.5)
  },
}
```

**Also create:** `public/og-image.png` — a 1200×630px image.
Design it as a dark card with the InterviewAI logo, tagline, and a score ring visual.
Without this file, OG tags are declared but the image will 404.

If you cannot create the image now, use a temporary placeholder:
```ts
// Temporary — use a generated OG image service until real asset is made:
images: [
  {
    url: `https://og-image.vercel.app/InterviewAI%20%E2%80%94%20Master%20Technical%20Interviews.png?theme=dark&md=1&fontSize=75px`,
    width: 1200,
    height: 630,
    alt: 'InterviewAI',
  },
],
```

---

## ENV VARIABLES CHECKLIST

After all code fixes, verify `.env.local` has ALL of these populated with real values before testing:

```
# AI Provider — MUST be correct model string
GEMINI_API_KEY=sk-or-v1-...          # This is actually an OpenRouter key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_EVAL_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payments — leave blank until Razorpay account is ready
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PRO_PLAN_ID=
RAZORPAY_WEBHOOK_SECRET=

# File uploads — leave blank until UploadThing is configured
UPLOADTHING_TOKEN=

# Email — leave blank until Resend is configured
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=https://ai-interview-app-virid.vercel.app
```

Variables can be blank — the app now fails loudly (P0.3, P0.4) instead of silently.

---

## VERIFICATION CHECKLIST

After all blocks complete, verify manually:

```
P0 verified when:
  □ Start an interview → AI responds with a question (not 400 error)
  □ Dashboard greeting shows real name, not "endobj" (re-upload resume to test)
  □ Click "Upgrade to Pro" → see toast error (not silent no-op)
  □ Resume upload failure → see toast error (not silent)

P1 verified when:
  □ grep -r "Acet Labs\|Manu Arora" components/ → zero results
  □ History rows with 0% show "— PENDING" not "0% SCORE"
  □ Resume card on dashboard is collapsed to 2 lines with EXPAND button
  □ Nav blur is backdrop-blur-md (inspect element to confirm)

P2 verified when:
  □ curl -I https://[your-domain]/ | grep -E "X-Frame|X-Content|Referrer" → all present
  □ /robots.txt loads → shows Allow/Disallow rules
  □ /sitemap.xml loads → shows 4 URLs
  □ Login page autofill → input shows dark bg, not blue

P3 verified when:
  □ Sidebar logo shows "CONSOLE v2.0" (not "NEO v2.0")
  □ /dashboard/roadmap → shows inline empty state (not red toast error)
  □ Navigate to /dashboard while on slow connection → skeleton loads before content
  □ Break a component intentionally → error.tsx boundary shows "TRY AGAIN"
  □ View source of / → no <meta name="generator" content="v0.app"> present
  □ Typewriter on landing → "Practicing: DSA & Coding Interviews" visible on first load, not blank
  □ Share https://ai-interview-app-virid.vercel.app on WhatsApp → shows title + image card (not blank)
  □ curl -s https://ai-interview-app-virid.vercel.app | grep og:image → returns the og-image.png URL
```

---

## DO NOT

- Do not change the design system — Electric Indigo (#4f46e5) is correct per the current audit
- Do not change any API endpoint URL or request body shape
- Do not add new npm packages (all fixes use existing dependencies)
- Do not modify `middleware.ts` / `proxy.ts` — auth routing is working correctly
- Do not add Stripe — Razorpay is the correct payment provider for India
- Do not redesign any page that shows ✅ in the APP_MAP routes table
- Do not change the interview room (`/interview/[id]`) — it's the highest-quality page in the app
