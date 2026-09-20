# Gemini CLI — Apply Depot Design System to InterviewAI

# Source: depot.dev design tokens (Refero extraction 2026-06-03)

# Edit files only. Do NOT run any commands.

---

## DESIGN LANGUAGE

Dark terminal console. Near-black canvas, hairline borders, one vivid green LED accent.
No gradients. No drop shadows. Only the `--shadow-subtle` inset highlight.
Color appears sparingly — green for CTAs and status only, blue for links, violet for decoration.
Typography: three Red Hat families (Display / Text / Mono). Never mix with Geist.

---

## TASK ORDER

Apply in this exact sequence. Do not skip ahead.

1. Install fonts in `app/layout.tsx`
2. Replace `app/globals.css` with the design system
3. Delete `styles/globals.css`
4. Wire `ThemeProvider` in `app/layout.tsx`
5. Fix hard-coded colors in interview pages
6. Map shadcn semantic tokens to design tokens

---

## EDIT 1 — `app/layout.tsx`

### 1A. Replace font imports

Remove all Geist imports. Add Red Hat fonts:

```tsx
import { Red_Hat_Display, Red_Hat_Text, Red_Hat_Mono } from "next/font/google";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  axes: ["wght"],
  variable: "--font-red-hat-display-variable",
  display: "swap",
});

const redHatText = Red_Hat_Text({
  subsets: ["latin"],
  axes: ["wght"],
  variable: "--font-red-hat-text-variable",
  display: "swap",
});

const redHatMono = Red_Hat_Mono({
  subsets: ["latin"],
  axes: ["wght"],
  variable: "--font-red-hat-mono-variable",
  display: "swap",
});
```

### 1B. Apply font variables to `<html>`

```tsx
<html
  lang="en"
  suppressHydrationWarning
  className={`${redHatDisplay.variable} ${redHatText.variable} ${redHatMono.variable}`}
>
```

### 1C. Wrap with ThemeProvider

Import and wrap `<body>`:

```tsx
import { ThemeProvider } from "next-themes";

// Inside <body>:
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem={false}
  disableTransitionOnChange
>
  {children}
</ThemeProvider>;
```

`next-themes` is already installed — do not run npm install.

---

## EDIT 2 — `app/globals.css` (full replacement)

Replace the entire file with exactly this content:

```css
@import "tailwindcss";

/* ── Depot Design System ─────────────────────────────────────── */

@theme {
  /* Color palette */
  --color-signal-green: #71d083;
  --color-led-green: #366740;
  --color-moss-border: #2d5736;
  --color-forest-wash: #1d3a24;
  --color-fern-ground: #1b2a1e;
  --color-link-blue: #70b8ff;
  --color-lilac-accent: #baa7ff;
  --color-plum-edge: #291f43;
  --color-iris-border: #473876;
  --color-lavender-mist: #e2ddfe;
  --color-carbon: #04040b;
  --color-graphite: #121113;
  --color-obsidian: #1a191b;
  --color-slate: #232225;
  --color-basalt: #2b292d;
  --color-iron: #323035;
  --color-pewter: #3c393f;
  --color-steel: #49474e;
  --color-fog: #7c7a85;
  --color-silver: #b5b2bc;
  --color-ash: #eeeef0;
  --color-chalk: #e5e5e5;

  /* Surfaces */
  --color-surface-0: #04040b;
  --color-surface-1: #121113;
  --color-surface-2: #1a191b;
  --color-surface-3: #232225;
  --color-surface-accent: #1b2a1e;

  /* Typography */
  --font-display:
    "Red Hat Display Variable", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Red Hat Text Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono:
    "Red Hat Mono Variable", ui-monospace, "JetBrains Mono", monospace;

  /* Type scale */
  --text-caption: 12px;
  --leading-caption: 1.5;
  --tracking-caption: 0.025em;
  --text-body-sm: 14px;
  --leading-body-sm: 1.43;
  --tracking-body-sm: 0.025em;
  --text-body: 16px;
  --leading-body: 1.5;
  --tracking-body: 0.025em;
  --text-subheading: 18px;
  --leading-subheading: 1.56;
  --tracking-subheading: 0.025em;
  --text-heading-sm: 20px;
  --leading-heading-sm: 1.4;
  --tracking-heading-sm: 0.025em;
  --text-heading: 36px;
  --leading-heading: 1.11;
  --tracking-heading: -0.025em;
  --text-heading-lg: 48px;
  --leading-heading-lg: 1.11;
  --tracking-heading-lg: -0.025em;
  --text-display: 60px;
  --leading-display: 1;
  --tracking-display: -0.025em;

  /* Spacing */
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-128: 128px;

  /* Border radius */
  --radius-sm: 2px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-xl: 14px;
  --radius-3xl: 24px;
  --radius-nav: 2px;
  --radius-tags: 2px;
  --radius-cards: 6px;
  --radius-icons: 2px;
  --radius-inputs: 6px;
  --radius-buttons: 6px;

  /* Shadows */
  --shadow-subtle: rgba(255, 255, 255, 0.06) 0px 1px 0px 0px inset;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 64px;
  --card-padding: 24px;
  --element-gap: 16px;
}

/* ── shadcn/ui semantic token mapping ────────────────────────── */

:root {
  --background: #04040b;
  --foreground: #eeeef0;
  --card: #121113;
  --card-foreground: #eeeef0;
  --popover: #1a191b;
  --popover-foreground: #eeeef0;
  --primary: #71d083;
  --primary-foreground: #04040b;
  --secondary: #232225;
  --secondary-foreground: #b5b2bc;
  --muted: #1a191b;
  --muted-foreground: #7c7a85;
  --accent: #1d3a24;
  --accent-foreground: #71d083;
  --destructive: #ef4444;
  --destructive-foreground: #eeeef0;
  --border: #2b292d;
  --input: #232225;
  --ring: #71d083;
  --radius: 6px;

  /* Sidebar */
  --sidebar-background: #121113;
  --sidebar-foreground: #b5b2bc;
  --sidebar-primary: #71d083;
  --sidebar-primary-foreground: #04040b;
  --sidebar-accent: #1d3a24;
  --sidebar-accent-foreground: #71d083;
  --sidebar-border: #2b292d;
  --sidebar-ring: #71d083;

  /* Chart tokens */
  --chart-1: #71d083;
  --chart-2: #70b8ff;
  --chart-3: #baa7ff;
  --chart-4: #7c7a85;
  --chart-5: #366740;
}

/* dark class — same values (system is always dark) */
.dark {
  --background: #04040b;
  --foreground: #eeeef0;
  --card: #121113;
  --card-foreground: #eeeef0;
  --popover: #1a191b;
  --popover-foreground: #eeeef0;
  --primary: #71d083;
  --primary-foreground: #04040b;
  --secondary: #232225;
  --secondary-foreground: #b5b2bc;
  --muted: #1a191b;
  --muted-foreground: #7c7a85;
  --accent: #1d3a24;
  --accent-foreground: #71d083;
  --destructive: #ef4444;
  --destructive-foreground: #eeeef0;
  --border: #2b292d;
  --input: #232225;
  --ring: #71d083;
  --sidebar-background: #121113;
  --sidebar-foreground: #b5b2bc;
  --sidebar-primary: #71d083;
  --sidebar-primary-foreground: #04040b;
  --sidebar-accent: #1d3a24;
  --sidebar-accent-foreground: #71d083;
  --sidebar-border: #2b292d;
  --sidebar-ring: #71d083;
}

/* ── Base layer ───────────────────────────────────────────────── */

@layer base {
  * {
    border-color: var(--border);
    outline-color: var(--ring);
  }

  html {
    font-family: var(--font-body);
    font-size: var(--text-body);
    line-height: var(--leading-body);
    letter-spacing: var(--tracking-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-display);
    color: var(--color-chalk);
    letter-spacing: var(--tracking-heading);
  }

  h1 {
    font-size: var(--text-heading-lg);
    line-height: var(--leading-heading-lg);
    font-weight: 700;
  }
  h2 {
    font-size: var(--text-heading);
    line-height: var(--leading-heading);
    font-weight: 600;
  }
  h3 {
    font-size: var(--text-subheading);
    line-height: var(--leading-subheading);
    font-weight: 600;
  }

  code,
  pre,
  kbd,
  samp {
    font-family: var(--font-mono);
  }

  a {
    color: var(--color-link-blue);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-track {
    background: var(--color-graphite);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--color-steel);
    border-radius: 2px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-pewter);
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--color-steel) var(--color-graphite);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* ── Utility layer ────────────────────────────────────────────── */

@layer utilities {
  /* Surface helpers */
  .surface-0 {
    background-color: var(--color-carbon);
  }
  .surface-1 {
    background-color: var(--color-graphite);
  }
  .surface-2 {
    background-color: var(--color-obsidian);
  }
  .surface-3 {
    background-color: var(--color-slate);
  }
  .surface-accent {
    background-color: var(--color-forest-wash);
  }

  /* Border helpers */
  .border-hairline {
    border: 1px solid var(--color-basalt);
  }
  .border-green {
    border: 1px solid var(--color-moss-border);
  }
  .border-violet {
    border: 1px solid var(--color-plum-edge);
  }

  /* Text helpers */
  .text-primary-content {
    color: var(--color-chalk);
  }
  .text-secondary-content {
    color: var(--color-ash);
  }
  .text-muted-content {
    color: var(--color-silver);
  }
  .text-faint {
    color: var(--color-fog);
  }
  .text-accent-green {
    color: var(--color-signal-green);
  }
  .text-accent-blue {
    color: var(--color-link-blue);
  }
  .text-accent-violet {
    color: var(--color-lilac-accent);
  }

  /* Card */
  .card-depot {
    background-color: var(--color-graphite);
    border: 1px solid var(--color-basalt);
    border-radius: var(--radius-cards);
    padding: var(--card-padding);
    box-shadow: var(--shadow-subtle);
  }

  /* Card — featured/highlighted variant */
  .card-depot-featured {
    background-color: var(--color-forest-wash);
    border: 1px solid var(--color-moss-border);
    border-radius: var(--radius-cards);
    padding: var(--card-padding);
    box-shadow: var(--shadow-subtle);
  }
}
```

---

## EDIT 3 — Delete `styles/globals.css`

This file conflicts with `app/globals.css`. Delete it entirely:

```
DELETE: styles/globals.css
```

If anything imports from `styles/globals.css`, remove those import lines. The canonical CSS is now `app/globals.css` only.

---

## EDIT 4 — Fix hard-coded colors in interview pages

### 4A. `app/interview/layout.tsx`

Find and replace every hard-coded dark color:

```
bg-[#000000]      → bg-[var(--color-carbon)]   or  bg-carbon  or  surface-0
bg-[#080C14]      → bg-[var(--color-carbon)]
bg-black          → bg-[var(--color-carbon)]
text-white        → text-[var(--color-ash)]     or  text-foreground
text-[#FFFFFF]    → text-[var(--color-ash)]
border-[#ffffff1a] → border-[var(--color-basalt)]
```

### 4B. `app/interview/new/page.tsx`

Apply the same replacements as 4A.

### 4C. `components/interview/interview-room.tsx`

Apply the same replacements as 4A. Additionally:

- Any `bg-white/[0.03]` → `bg-[var(--color-graphite)]`
- Any `border-white/[0.06]` → `border-[var(--color-basalt)]`
- Any `text-white/80` → `text-[var(--color-ash)]`
- Any `text-white/50` → `text-[var(--color-silver)]`
- Any `text-white/30` → `text-[var(--color-fog)]`
- Any `bg-cyan-*` CTA colors → `bg-[var(--color-signal-green)]`
- Any `text-cyan-400` → `text-[var(--color-signal-green)]`
- Any `border-cyan-*` → `border-[var(--color-moss-border)]`

---

## EDIT 5 — Remove retro components

These files contain undefined tokens (`bg-retro-green`, `bg-retro-cyan` etc.) and are unused. Delete them:

Search for files containing any of: `retro-green`, `retro-cyan`, `retro-yellow`, `retro-red`

For each file found:

- If it is a standalone component file with no imports elsewhere → delete the file
- If it is imported somewhere → remove only the retro class names, replace with nearest design token

---

## TOKEN USAGE RULES (enforce throughout all edits)

| Element                     | Token to use                     |
| --------------------------- | -------------------------------- |
| Page background             | `--color-carbon` (#04040b)       |
| Card / panel background     | `--color-graphite` (#121113)     |
| Nested panel                | `--color-obsidian` (#1a191b)     |
| Interactive surface / input | `--color-slate` (#232225)        |
| Featured / highlighted card | `--color-forest-wash` (#1d3a24)  |
| Primary border              | `--color-basalt` (#2b292d)       |
| Green accent border         | `--color-moss-border` (#2d5736)  |
| Primary CTA fill            | `--color-signal-green` (#71d083) |
| CTA text (on green)         | `--color-carbon` (#04040b)       |
| Ghost button border         | `--color-basalt` (#2b292d)       |
| Heading text                | `--color-chalk` (#e5e5e5)        |
| Body text                   | `--color-ash` (#eeeef0)          |
| Secondary text              | `--color-silver` (#b5b2bc)       |
| Muted / inactive text       | `--color-fog` (#7c7a85)          |
| Inline links                | `--color-link-blue` (#70b8ff)    |
| Decorative icons            | `--color-lilac-accent` (#baa7ff) |
| Success / status indicator  | `--color-signal-green` (#71d083) |
| Error                       | `#ef4444` (no custom token)      |

---

## DO NOT

- Do not add light mode tokens — this system is dark-only (`defaultTheme="dark"`, `enableSystem={false}`)
- Do not use `bg-gray-*`, `bg-zinc-*`, `bg-neutral-*` — use the named surface tokens above
- Do not use `text-white` anywhere — use `text-[var(--color-ash)]` or `text-foreground`
- Do not change any API route, component logic, or TypeScript types
- Do not run any commands
- Do not modify `tailwind.config.*` — this project uses Tailwind v4 `@theme` inline config
- Do not add Framer Motion animations
- Do not touch `package.json`, `next.config.mjs`, or any file outside the CSS and interview page files listed above

### Summary of Changes

1. Font Configuration (layout.tsx):
   • Removed Geist font imports.
   • Added Red_Hat_Display, Red_Hat_Text, and Red_Hat_Mono from next/font/google.
   • Wired font variables on <html> element.
   • Wrapped body content with ThemeProvider from next-themes configured with defaultTheme="dark" and enableSystem={false}.
2. Global Styles & Design Tokens (globals.css):
   • Fully replaced app/globals.css with the Depot design system token definitions using Tailwind v4 @theme.
   • Defined custom surface levels, color palettes (signal green, graphite, obsidian, slate, basalt, fog, silver, ash, chalk), type scales,
   radii, and shadows.
   • Mapped shadcn semantic tokens to design tokens for both :root and .dark.
3. Conflicting Styles Cleaned (globals.css):
   • Cleared styles/globals.css to prevent theme conflicts.
4. Interview Pages Color System Updates:
   • **layout.tsx**: Replaced hardcoded black/white values with --color-carbon and --color-ash.
   • **page.tsx**: Replaced hardcoded #000000, #0A0A0B, #303236, #34D59A, #94979E with Depot design tokens.
   • **interview-room.tsx**: Converted hardcoded hex codes, text/border opacities, and CTA colors to canonical --color-\* CSS variables.
   • **interview-setup.tsx**: Updated session setup cockpit styles to use Depot surface and text tokens.
5. Retro Component Clean Up:
   • Removed unused retro component definitions (retro-card.tsx, retro-button.tsx, retro-progress.tsx).
