# Theme Specification Report

## Current theme

**Style:** Professional interview-prep UI. Cool white/blue-gray surfaces, deep-teal primary color, green-teal accent, dark navy sidebar.

**Theme source:** `app/globals.css`.

| Token | Light mode | Dark mode | Use |
| --- | --- | --- | --- |
| `background`, `foreground` | Cool near-white, dark navy text | Dark navy, pale text | App canvas and default text |
| `primary` | Deep teal | Green-teal | Main CTAs, brand, active states |
| `secondary`, `muted` | Soft blue-gray | Dark blue-gray | Secondary controls and surfaces |
| `accent` | Green | Blue-teal | Hover/emphasis states |
| `destructive` | Red | Dark red | Errors and destructive actions |
| `success`, `warning`, `info` | Green, yellow, blue | Same values | Defined status colors; rarely used |
| `sidebar-*` | Dark navy | Near-black navy | Dashboard sidebar |

Other design rules:

- Font: Geist / Geist Mono.
- Radius: 10px base token (`--radius`).
- Cards: rounded, bordered, subtle shadow.
- Buttons: semantic variants, hover states, visible keyboard focus ring.
- Animation: Tailwind transitions, `tw-animate-css`, voice pulse, typing dots.

## Libraries and styling tools

| Tool | Use |
| --- | --- |
| Next.js 16 / React 19 | Application framework |
| Tailwind CSS v4 | Utility styling and responsive layouts |
| shadcn/ui | Main reusable component style (`new-york`, neutral base) |
| Radix UI | Accessible primitives: dialog, menu, select, tabs, tooltip, etc. |
| CVA + `cn()` | Component variants and safe class merging |
| Lucide React | Icons |
| Sonner | Toast notifications |
| Recharts | Charts |
| next-themes | Installed dark-mode support, currently not connected |

## Component styling map

| Area | Main styling |
| --- | --- |
| Landing page | Semantic Tailwind tokens, Cards, Buttons, Badges |
| Auth pages | Cards, Inputs, Alerts, Buttons; mostly semantic tokens |
| Dashboard | shadcn Sidebar, Header, Cards, Progress, Badges, Tables |
| Interview setup | Standard shadcn controls and semantic tokens |
| Interview room | Custom interaction UI, inline dynamic sizing/progress, hard-coded black surfaces |
| Charts | Recharts wrapper using chart tokens |
| Toasts | Sonner wrapper reads current theme |
| Retro files | Unused alternative button/card/progress components |

## Problems to fix

### P0 — High priority

1. **Dark mode is not active.** `ThemeProvider` exists but is never mounted in `app/layout.tsx`.
   - Fix: Wrap app with `ThemeProvider attribute="class" defaultTheme="system" enableSystem`.
   - Add theme selector in Settings or header.

2. **Interview UI ignores theme.** `app/interview/layout.tsx`, `app/interview/new/page.tsx`, and `interview-room.tsx` use `bg-[#000000]`, `text-white`, and `text-[#FFFFFF]`.
   - Fix: Use `bg-background text-foreground`, or define dedicated semantic `--interview-*` tokens for both modes.

3. **Retro components use undefined colors.** `bg-retro-green`, `bg-retro-cyan`, `bg-retro-yellow`, and `bg-retro-red` have no Tailwind theme tokens.
   - Fix: Remove unused retro files, or add documented retro tokens before use.

### P1 — Consistency

1. **Two conflicting global themes.** Active `app/globals.css` is teal; inactive `styles/globals.css` is grayscale.
   - Fix: Keep one canonical token file. Remove or clearly isolate alternate file.

2. **Raw status colors bypass system.** Green, red, amber, and orange Tailwind palette classes appear in dashboard/auth pages.
   - Fix: Replace with `success`, `warning`, `info`, and `destructive` semantic tokens.

3. **Geist wiring incomplete.** Font instances are created in `app/layout.tsx` but their class/variable values are not applied.
   - Fix: Attach Next Font variables to `<html>` and reference them from `@theme inline`.

### P2 — Accessibility and polish

1. Add `prefers-reduced-motion` rules for looping voice/typing animation.
2. Add Firefox scrollbar styling; current custom scrollbar is WebKit-only.
3. Check small status text contrast in both themes.
4. Test dashboard padding and controls at 320px, 375px, 768px, and desktop widths.
5. Keep only data-derived inline styles; move static colors and animation styles into tokens/classes.

## Target state

- One theme source: `app/globals.css`.
- Working light, dark, and system themes.
- No raw color values for semantic UI meaning.
- Interview mode uses documented semantic tokens.
- Unused retro system removed or fully defined.
- Reduced-motion and contrast checks pass.
