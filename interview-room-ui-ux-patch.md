Gemini CLI — INTERVIEW ROOM UI REDESIGN

Apply DESIGN.md to components/interview/interview-room.tsx

SCOPE

Read DESIGN.md and the existing interview-room.tsx first.

The current 3-column interview architecture and functionality are already correct. Redesign ONLY the visual/UI layer.

Do NOT change:

APIs / fetch calls / request bodies

state variables

handlers

evaluation logic

question generation

routing / persistence

Monaco behavior

core 3-column layout

existing functionality

Only modify JSX presentation, Tailwind classes, inline styles, visual components and CSS animations.

DESIGN DIRECTION

Use DESIGN.md as the primary visual reference.

Target:

Neon / Server Room After Dark × Modern Developer IDE × Interview Cockpit

The current Retro Glass UI feels like a generic AI dashboard. Remove that feeling.

Create a distinctive product identity based on:

pure black canvas

monochrome white/gray UI

ONE electric green accent

sharp technical containers

pill-shaped actions

terminal/code-inspired details

restrained data visualization

strong typography hierarchy

Do NOT create a Neon clone. Adapt the design language specifically for an AI interview product.

Reference: the provided Neon system uses pure black, white, electric green, layered near-black surfaces, 4px containers and pill buttons. urlNeon style referencehttps://styles.refero.design/style/cc38369a-41e3-4bcd-b619-230ccffe7e8e

COLOR SYSTEM

Replace the current cyan/indigo system.

BLACKOUT       #000000
DEPTH          #0A0A0B
GRAPHITE DEEP  #151617
GRAPHITE       #242628
GRAPHITE LIGHT #303236

WHITEOUT       #FFFFFF
CLOUD          #C9CBCF
ASH            #797D86
PEWTER         #94979E

NEON           #34D59A
NEON MUTED     #285D49

WARNING        #FF3621

Rules:

Green is the ONLY brand accent.

White = primary information / primary CTA.

Gray = hierarchy and metadata.

Red only for danger/urgent states.

Remove purple, cyan and multi-color gradients.

No gradient backgrounds.

SHAPE LANGUAGE

This is important.

Use a strict contrast:

Cards / panels / inputs / containers → rounded-[4px]
Buttons → rounded-full

Do NOT use:

rounded-xl cards

excessive pills

soft floating glass cards

large shadows

glowing borders

Depth comes from near-black surface layering, not blur.

Example:

page      #000000
panel     #0A0A0B
surface   #151617
elevated  #242628
border    #303236

TYPOGRAPHY

Use the design system's typography hierarchy.

Primary content

Inter / system sans.

Use for:

question text

feedback

headings

important information

Technical UI

GeistMono / monospace.

Use for:

question numbers

timer

labels

badges

scores

metadata

code controls

status indicators

Do NOT make the entire interface monospace.

The current implementation overuses monospace. Fix that.

HEADER

Keep the existing header structure.

Make it feel like a professional developer tool.

Example:

● INTERVIEW_AI   /   QUESTION 01 / 05   [MEDIUM]      28:22   [ END SESSION ]

Style:

black background

thin graphite divider

compact height

green status dot

technical metadata in GeistMono

Timer

Make it a small technical readout.

No glowing cyan pill.

End Session

Ghost pill:

transparent
1px #303236
white/gray text
red only on hover

PROGRESS

Keep the existing progress bar.

Redesign as a thin terminal-style progress signal:

2px maximum

Neon green

no gradient

subtle animated transition

LEFT QUESTION PANEL

Keep width and position.

Remove the current card-like/glass appearance.

Treat the left panel as a technical briefing rail.

Hierarchy:

QUESTION 01 OF 05
NEXT.JS / SERVER COMPONENTS

Given your experience with...
...

Question text:

Inter

18–20px

white

strong line-height

Topic metadata:

GeistMono

uppercase

Neon green

Hint

Make it a terminal-like utility:

+ STRATEGY HINT

When open:

┌ STRATEGY HINT ─────────
│ Focus on...
└────────────────────────

Use 4px corners.

Metrics

Keep them compact.

Do NOT make large cards.

Example:

SESSION
05 / 05     81%

Use thin separators and typography rather than dashboard tiles.

CENTER WORKSPACE

This is the visual focus.

Remove the current large rounded glass textarea treatment.

Make the center feel like an IDE/editor workspace.

Mode switcher

Use pill buttons, but keep them minimal:

( TEXT )   CODE   VOICE

Active:

white text

subtle graphite surface

small green indicator

Avoid cyan/purple glowing tabs.

Text editor

Create a terminal/editor-like surface:

background: #0A0A0B / #151617
border: #303236
radius: 4px

Top-left can contain a tiny technical label:

ANSWER_BUFFER

Textarea itself should remain clean and distraction-free.

Focus state:

graphite border

subtle green 1px indicator

NO large cyan outline

Character counter

Technical monospace metadata:

0 WORDS · 0 CHARS

CODE MODE

Keep Monaco functionality/configuration.

Only redesign its surrounding chrome:

┌ ANSWER_BUFFER ──────────────────────────────┐
│                                             │
│ Monaco                                      │
│                                             │
└─────────────────────────────────────────────┘

Language selector:

compact pill

dark surface

graphite border

VOICE MODE

Keep the existing voice functionality.

Make it feel like a terminal recording station, not a generic audio widget.

Structure:

VOICE INPUT

        ╱╲ ╱╲╱╲ ╱╲
        WAVEFORM

       ( START )

TRANSCRIPT
────────────────────
...

Waveform:

Neon green when active

gray when idle

restrained animation

Microphone:

white pill when idle

red only while recording

Remove emoji buttons such as 🎤.

Use existing icons/components where available.

BOTTOM ACTION BAR

Keep its position and behavior.

Use a technical divider instead of a floating card.

────────────────────────────────────────────
0 WORDS · 0 CHARS                [ SUBMIT → ]

Primary CTA

Use the Neon design language:

background: #FFFFFF
text: #151617
rounded-full

Hover:

#C9CBCF

This creates the strongest visual contrast in the interface.

Next Question / Finish Interview use the same primary CTA.

AI COACH PANEL

This should be the most distinctive part of the product.

Do NOT make it another generic dashboard card.

Treat it as a live evaluation console.

Header:

AI COACH                         ● LIVE
──────────────────────────────────────

Idle state

Use a sparse terminal-style message:

AWAITING_RESPONSE

Submit your answer to begin
live evaluation.

Evaluation state

Structure:

EVALUATION
────────────────────

81 / 100

TECHNICAL ACCURACY     77%
██████████████░░░░

STRUCTURE & CLARITY    71%
████████████░░░░░░

DEPTH & EDGE CASES     69%
████████████░░░░░░

Use Neon only for progress/active values.

Feedback should use normal Inter typography.

Strengths / Improvements should be separated by thin graphite rules, not cards.

SCORE RING

Keep the existing ScoreRing functionality.

Visually simplify it:

white/gray track

Neon green progress

no purple

no glow

compact technical typography

The score should feel like instrumentation rather than decoration.

RESULT SCREEN

Keep existing result functionality.

Redesign it using the same Neon system.

Avoid the current large glass card.

Use a black canvas with layered near-black sections.

Header:

SESSION_COMPLETE

Technical Interview
ROLE / TYPE / LEVEL

Score:

81
/100

Use a large but restrained score display.

Metrics should be a clean 4-column technical grid:

QUESTIONS     COMPLETED     DURATION     ACCURACY
05            05            05:31        81%

Use graphite separators instead of floating cards.

Question breakdown:

01  NEXT.JS SERVER COMPONENTS              75%
──────────────────────────────────────────────
    Analysis...
    Suggestion...

Keep expandable/recorded content functionality unchanged.

MICRO-INTERACTIONS

Use subtle CSS transitions only.

Allowed:

opacity

background-color

border-color

transform

progress width

waveform animation

No Framer Motion.

No excessive glow.

No animated background.

No decorative animation that competes with the interview question.

BACKGROUND

Use pure #000000.

Optional extremely subtle technical atmosphere:

thin scanline

tiny green data marks

terminal-like micro-grid

Opacity must remain extremely low.

Do NOT use:

purple blobs

cyan blobs

glass blur

colorful gradients

glowing fog

The page should feel like a black void with information emerging from it.

IMPORTANT UX CORRECTIONS

The screenshots show several problems that must be removed:

Too many rounded rectangles → use 4px containers.

Too much cyan → use one green accent.

Too much monospace → reserve it for technical UI.

Generic glass cards → use layered near-black surfaces.

Emoji UI → use icons/text.

Large empty bordered textarea → make it feel like an IDE workspace.

Dashboard-like metric cards → use compact technical rows/grid.

Neon/glow effects → almost none.

Weak primary CTA → use the white pill CTA.

Purple/blue gradients → remove completely.

FINAL DESIGN IDENTITY

The finished interface should immediately communicate:

"This is a serious AI technical interview workstation."

It should feel closer to:

Vercel × Linear × GitHub × Neon terminal

than:

generic AI SaaS × cyberpunk dashboard × glassmorphism template

Use DESIGN.md as the source of truth for visual language, while adapting it specifically to the existing InterviewRoom UX.

FINAL RULE

VISUAL/UI REDESIGN ONLY.

Do not modify functionality, APIs, state, handlers, evaluation logic, routing, persistence, or the existing 3-column architecture.