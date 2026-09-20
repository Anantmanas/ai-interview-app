# Gemini CLI — Interactivity, Animations & UX Enhancement Pass
# Adds: font wiring, landing BG animations, typewriter inputs, micro-interactions
# Edit files only. Do NOT run any commands. Read each file before editing.

---

## INSTALL — Run this ONCE before editing (the only allowed command)

```bash
npm install motion
```

`motion` (formerly Framer Motion) is the animation library.
Import from `"motion/react"` everywhere below.

---

## FILE 1 — `app/layout.tsx` — Fix font variable wiring

Read the file. Find where Red Hat fonts are defined with `next/font/google`.
The font variables must be passed to BOTH `<html>` and used in CSS.

### 1A. Ensure font definitions have correct variable names:

```tsx
const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  axes: ['wght'],
  variable: '--font-display',    // ← must match exactly
  display: 'swap',
})

const redHatText = Red_Hat_Text({
  subsets: ['latin'],
  axes: ['wght'],
  variable: '--font-body',       // ← must match exactly
  display: 'swap',
})

const redHatMono = Red_Hat_Mono({
  subsets: ['latin'],
  axes: ['wght'],
  variable: '--font-mono',       // ← must match exactly
  display: 'swap',
})
```

### 1B. Apply ALL THREE variables to `<html>`:

```tsx
<html
  lang="en"
  suppressHydrationWarning
  className={`${redHatDisplay.variable} ${redHatText.variable} ${redHatMono.variable}`}
>
```

### 1C. Verify `app/globals.css` has these base rules (add if missing):

```css
html {
  font-family: var(--font-body, 'Red Hat Text Variable', sans-serif);
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display, 'Red Hat Display Variable', sans-serif);
}
code, pre, kbd, samp, .font-mono {
  font-family: var(--font-mono, 'Red Hat Mono Variable', monospace);
}
```

---

## FILE 2 — `app/globals.css` — Add animation keyframes

In the `@layer utilities` block, ADD these (do not remove existing content):

```css
/* ── Keyframes ─────────────────────────────────────────────── */

@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scan-line {
  from { transform: translateY(-100%); }
  to   { transform: translateY(100vh); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px);   }
  50%       { transform: translateY(-12px); }
}

@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}

@keyframes grid-drift {
  from { transform: translate(0, 0);     }
  to   { transform: translate(28px, 28px); }
}

@keyframes border-glow {
  0%, 100% { box-shadow: 0 0 0 1px #2d5736; }
  50%       { box-shadow: 0 0 8px 1px rgba(113,208,131,0.3); }
}

/* ── Animation utility classes ──────────────────────────────── */

.animate-led-pulse    { animation: led-pulse 2s ease-in-out infinite; }
.animate-float        { animation: float 4s ease-in-out infinite; }
.animate-border-glow  { animation: border-glow 3s ease-in-out infinite; }

.animate-fade-up      { animation: fade-up 0.6s ease-out both; }
.animate-fade-up-1    { animation: fade-up 0.6s 0.1s ease-out both; }
.animate-fade-up-2    { animation: fade-up 0.6s 0.2s ease-out both; }
.animate-fade-up-3    { animation: fade-up 0.6s 0.35s ease-out both; }
.animate-fade-up-4    { animation: fade-up 0.6s 0.5s ease-out both; }
.animate-fade-up-5    { animation: fade-up 0.6s 0.65s ease-out both; }

.skeleton {
  background: linear-gradient(
    90deg,
    #1a191b 25%,
    #232225 50%,
    #1a191b 75%
  );
  background-size: 200% auto;
  animation: shimmer 1.5s linear infinite;
  border-radius: 4px;
}

/* Reduced motion — disable all animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## FILE 3 — `app/page.tsx` — Animated landing page

Read the full file. Apply section by section.

### 3A. Add imports at the top of the file

```tsx
'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
```

If the file already has `'use client'`, keep it. Add the imports after existing imports.

### 3B. Typewriter hook — add ABOVE the component function

```tsx
function useTypewriter(words: string[], speed = 80, pause = 2000) {
  const [displayed, setDisplayed] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(i => i + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(i => i - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setWordIndex(i => (i + 1) % words.length)
    }

    setDisplayed(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  return displayed
}
```

### 3C. Landing ambient background component — add above component

```tsx
function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Animated dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          animation: 'grid-drift 20s linear infinite',
        }}
      />

      {/* Signal Green ambient orb — top left */}
      <motion.div
        className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(113,208,131,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Violet ambient orb — bottom right */}
      <motion.div
        className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(186,167,255,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Subtle scan line — single slow pass */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#71d083]/20 to-transparent"
        style={{ animation: 'scan-line 8s linear infinite', top: 0 }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_30%,#04040b_100%)]" />
    </div>
  )
}
```

### 3D. Hero section — wrap elements with motion

Find the hero section. Wrap each element with `motion.div` or convert to `motion.X`:

**Eyebrow pill:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
  className="inline-flex items-center gap-2 border border-[#2b292d] bg-[#121113] rounded-full px-4 py-1.5 mb-8"
>
  <span className="h-1.5 w-1.5 rounded-full bg-[#71d083] animate-led-pulse" />
  <span className="font-mono text-[11px] text-[#71d083] uppercase tracking-[0.1em]">
    AI-Powered Technical Interview Simulator
  </span>
</motion.div>
```

**Headline:**
```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
  className="font-display text-[52px] md:text-[72px] font-bold leading-[1.05] tracking-[-0.025em] text-[#e5e5e5] mb-6"
>
  Master Technical Interviews
  <br />
  <span className="text-[#71d083]">with AI-Powered Practice</span>
</motion.h1>
```

**Sub-copy:**
```tsx
<motion.p
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
  className="font-body text-[17px] text-[#7c7a85] leading-[1.7] max-w-[560px] mx-auto mb-10"
>
  {/* existing text */}
</motion.p>
```

**CTA buttons:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
  className="flex items-center justify-center gap-3 mb-12"
>
  {/* buttons */}
</motion.div>
```

**Trust badges:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.6 }}
  className="flex items-center justify-center gap-6"
>
  {/* badges */}
</motion.div>
```

### 3E. Feature cards — staggered entrance on scroll

Wrap the features grid section:

```tsx
// Add this hook at the top of the component:
const featuresRef = useRef(null)

// Wrap each card:
{features.map((feature, i) => (
  <motion.div
    key={feature.title}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
    whileHover={{ y: -3, transition: { duration: 0.15 } }}
    className="card-console p-5 cursor-default group hover:border-[#2d5736] transition-colors duration-200"
  >
    {/* card content */}
  </motion.div>
))}
```

### 3F. Typewriter rotating text — add to hero

Find a good spot in the hero (below the main headline or in the sub-copy area).
Add a rotating typewriter that shows what the AI can do:

```tsx
// In the component body:
const roles = useTypewriter([
  'System Design Rounds',
  'DSA & Coding Interviews',
  'Behavioral Questions',
  'React & Frontend Rounds',
  'FAANG Interview Prep',
])

// In JSX, add below the headline:
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.8 }}
  className="flex items-center justify-center gap-2 mb-6"
>
  <span className="font-mono text-[13px] text-[#49474e]">Practicing:</span>
  <span className="font-mono text-[13px] text-[#71d083] min-w-[220px] text-left">
    {roles}
    <span className="inline-block w-[2px] h-[14px] bg-[#71d083] ml-0.5 animate-led-pulse align-middle" />
  </span>
</motion.div>
```

---

## FILE 4 — `app/auth/login/page.tsx` AND `app/auth/sign-up/page.tsx`

Apply identical treatment to BOTH files.

### 4A. Add imports

```tsx
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
```

### 4B. Typewriter hook for input placeholders

Add above the component:

```tsx
function usePlaceholderTypewriter(text: string, speed = 60, startDelay = 500) {
  const [placeholder, setPlaceholder] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    let i = 0
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        setPlaceholder(text.slice(0, i + 1))
        i++
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(start)
  }, [text, speed, startDelay, done])

  return placeholder
}
```

### 4C. Apply typewriter to form inputs

In the login form, find the email and password inputs.
Add the hook calls in the component body:

```tsx
const emailPlaceholder = usePlaceholderTypewriter('engineer@company.com', 55, 400)
const passwordPlaceholder = usePlaceholderTypewriter('Enter your password', 55, 1200)
```

Apply to inputs:
```tsx
<input
  type="email"
  placeholder={emailPlaceholder}
  // keep all existing props (value, onChange, name, id etc.)
  className="w-full bg-[#232225] border border-[#2b292d] rounded-[6px] px-3 py-2.5 font-mono text-[13px] text-[#eeeef0] placeholder:text-[#49474e] focus:outline-none focus:border-[#71d083] focus:ring-1 focus:ring-[#71d083]/20 transition-all duration-200"
/>

<input
  type="password"
  placeholder={passwordPlaceholder}
  // keep all existing props
  className="w-full bg-[#232225] border border-[#2b292d] rounded-[6px] px-3 py-2.5 font-mono text-[13px] text-[#eeeef0] placeholder:text-[#49474e] focus:outline-none focus:border-[#71d083] focus:ring-1 focus:ring-[#71d083]/20 transition-all duration-200"
/>
```

For sign-up, add a third hook:
```tsx
const namePlaceholder = usePlaceholderTypewriter('Your full name', 55, 200)
```

### 4D. Animate the auth card entrance

Wrap the card in:
```tsx
<motion.div
  initial={{ opacity: 0, y: 32, scale: 0.97 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  className="card-console p-6 space-y-4"
>
  {/* form content */}
</motion.div>
```

### 4E. Button loading state with motion

Find the submit button. Add loading state:

```tsx
// In component state:
const [isLoading, setIsLoading] = useState(false)

// Wrap existing submit handler to set loading:
const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  try {
    // existing submit logic
  } finally {
    setIsLoading(false)
  }
}

// Button JSX:
<motion.button
  type="submit"
  disabled={isLoading}
  whileTap={{ scale: 0.98 }}
  className="w-full bg-[#71d083] text-[#04040b] font-mono text-[13px] font-semibold uppercase tracking-[0.05em] py-3 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden"
>
  <AnimatePresence mode="wait">
    {isLoading ? (
      <motion.span
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center gap-2"
      >
        <span className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#04040b]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </span>
        <span>Authenticating</span>
      </motion.span>
    ) : (
      <motion.span
        key="idle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {isLogin ? 'Access Console' : 'Create Account'}
      </motion.span>
    )}
  </AnimatePresence>
</motion.button>
```

### 4F. Input focus glow effect

Add this to `app/globals.css` inside `@layer utilities`:

```css
.input-focus-glow:focus {
  border-color: #71d083;
  box-shadow: 0 0 0 3px rgba(113, 208, 131, 0.12), inset 0 1px 0 rgba(255,255,255,0.04);
}
```

Add `input-focus-glow` class to all auth form inputs alongside the existing classes.

### 4G. Auth page background — same as landing

Add the same ambient background from FILE 3 Section 3C inside the auth page root wrapper. The root wrapper must be:
```tsx
<div className="min-h-screen bg-[#04040b] flex items-center justify-center p-6 relative overflow-hidden">
  <LandingBackground /> {/* import from a shared file, or inline the JSX */}
  <div className="relative z-10 w-full max-w-[400px]">
    {/* card */}
  </div>
</div>
```

If `LandingBackground` is defined in `app/page.tsx`, move it to a shared file:
`components/ui/landing-background.tsx` and import it in both `page.tsx` and auth pages.

---

## FILE 5 — `app/dashboard/page.tsx` — Dashboard micro-interactions

### 5A. Stats cards — count-up animation

Find the numeric stat values (Total Interviews: 27, Average Score: 20%, Practice Time: 0.9h).

Add this hook above the component:

```tsx
function useCountUp(target: number, duration = 1200, startDelay = 300) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const delay = setTimeout(() => {
      const startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, startDelay)
    return () => clearTimeout(delay)
  }, [target, duration, startDelay])

  return count
}
```

Apply to each stat card value:
```tsx
// For integer counts:
const totalCount = useCountUp(totalInterviews, 1000, 400)
// Render: {totalCount}

// For percentages:
const avgCount = useCountUp(averageScore, 1200, 600)
// Render: {avgCount}%
```

### 5B. Dashboard cards — staggered entrance

Wrap the stats cards row:
```tsx
<motion.div
  className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  }}
>
  {stats.map((stat) => (
    <motion.div
      key={stat.label}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
      }}
      className="card-console p-5"
    >
      {/* stat content */}
    </motion.div>
  ))}
</motion.div>
```

### 5C. Recent interview list rows — hover lift

Wrap each list row:
```tsx
<motion.div
  whileHover={{ x: 4, backgroundColor: '#1a191b' }}
  transition={{ duration: 0.15 }}
  className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a191b] cursor-pointer"
>
  {/* row content */}
</motion.div>
```

---

## FILE 6 — `components/dashboard/sidebar.tsx` — Nav hover interactions

Find each nav item. Replace static hover with motion:

```tsx
<motion.a
  href={item.href}
  whileHover={{ x: 3 }}
  transition={{ duration: 0.15 }}
  className={
    isActive
      ? "flex items-center gap-3 px-5 py-2.5 mx-2 rounded-[4px] font-mono text-[12px] text-[#71d083] uppercase tracking-[0.04em] bg-[#1d3a24] border-l-2 border-[#71d083] font-semibold"
      : "flex items-center gap-3 px-5 py-2.5 mx-2 rounded-[4px] font-mono text-[12px] text-[#7c7a85] uppercase tracking-[0.04em] hover:text-[#eeeef0] transition-colors duration-150"
  }
>
  {item.icon}
  {item.label}
  {isActive && (
    <motion.span
      layoutId="active-pill"
      className="ml-auto h-1.5 w-1.5 rounded-full bg-[#71d083]"
    />
  )}
</motion.a>
```

The `layoutId="active-pill"` makes the green dot animate smoothly between routes.

---

## SHARED COMPONENT — `components/ui/landing-background.tsx`

Create this new file so landing page and auth pages share the same background:

```tsx
'use client'

import { motion } from 'motion/react'

export function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Animated dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          animation: 'grid-drift 20s linear infinite',
        }}
      />
      {/* Signal Green orb */}
      <motion.div
        className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(113,208,131,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Violet orb */}
      <motion.div
        className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(186,167,255,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#71d083]/15 to-transparent"
        style={{ animation: 'scan-line 10s linear infinite', top: 0 }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_30%,#04040b_100%)]" />
    </div>
  )
}
```

---

## MICRO-INTERACTION RULES — Apply everywhere

**Buttons:**
- All `<button>` and `<a>` used as buttons: wrap with `motion.button` / `motion.a`
- Add `whileTap={{ scale: 0.97 }}` and `whileHover={{ scale: 1.01 }}` on primary CTAs only
- Secondary/ghost buttons: `whileTap={{ scale: 0.98 }}` only, no hover scale

**Cards:**
- Cards that are clickable: `whileHover={{ y: -2 }}` with `transition={{ duration: 0.15 }}`
- Cards that are not clickable: no hover motion

**Links:**
- Inline text links: no motion — CSS `transition-colors` is sufficient

**Page transitions:**
- Wrap page content in:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

---

## DO NOT

- Do not add scroll-jacking or parallax effects — they hurt usability
- Do not add motion to form inputs themselves — only to placeholders and buttons
- Do not change any API calls, state logic, routing, or TypeScript types
- Do not change text content of any element
- Do not modify `next.config.mjs`, `package.json` scripts, or `tailwind.config.*`
- Do not use `framer-motion` import path — use `motion/react` (new package name)
- Do not add `'use client'` to server components — only add where motion is imported
- Do not run any commands except the npm install at the top
