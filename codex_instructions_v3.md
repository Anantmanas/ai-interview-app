# Codex Agent Instructions — InterviewAI (v3, mapped to real project)
# Updated: 2026-06-01
# Source of truth: actual /app and /components tree

---

## PROJECT STRUCTURE CONTEXT

This is a Next.js 14 App Router project. Key paths confirmed from the tree:

```
app/
├── api/resume/                        ← API route for resume processing (exists, may need updating)
├── api/interview/chat/                ← API route for interview chat (exists)
├── auth/onboarding/welcome/page.tsx   ← Onboarding screen (PRIMARY resume upload)
├── dashboard/page.tsx                 ← Dashboard (SECONDARY resume upload)
├── dashboard/resume/                  ← Dedicated resume section in dashboard
├── interview/new/page.tsx             ← Interview setup (TERTIARY / last-chance upload)
├── interview/[id]/page.tsx            ← Interview room (READ ONLY — never uploads)

components/
├── resume/resume-dropzone.tsx         ← Existing dropzone — REUSE & EXTEND this
├── resume/resume-provider.tsx         ← Existing provider — EXTEND for persistence
├── dashboard/resume-upload-card.tsx   ← Existing dashboard card — wire to shared store
├── interview/interview-room.tsx       ← Interview room component (two-panel target)
├── interview/interview-setup.tsx      ← Setup screen component
```

---

## ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  RESUME FLOW (write once, read everywhere)                                   │
│                                                                              │
│  auth/onboarding/welcome  →  dashboard/resume  →  interview/new             │
│  (PRIMARY upload)            (SECONDARY fallback)  (LAST-CHANCE fallback)    │
│         ↓                           ↓                       ↓               │
│                    localStorage "interviewai_resume"                         │
│                         ↑ written once, never auto-cleared                  │
│                         ↓ read by everything below                          │
│                    interview/[id]/page.tsx  (READ ONLY)                     │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  INTERVIEW ROOM — DUAL MODEL (components/interview/interview-room.tsx)       │
│                                                                              │
│   LEFT PANEL                         RIGHT PANEL                            │
│   ─────────────────────────          ──────────────────────                 │
│   Model B (claude-sonnet-4)          Model C (claude-haiku-4-5)             │
│   • Generate questions               • Alex — chat assistant only           │
│   • Accept code / text / voice       • No interview logic                   │
│   • Evaluate answers                 • Reads resume for context             │
│   • Uses resume from store           • Pure conversational                  │
│                                                                              │
│   API route: app/api/interview/chat  API route: app/api/interview/chat      │
│   (or direct fetch — see below)      (separate endpoint or same + flag)     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1 — RESUME PERSISTENCE LAYER

### Step 1 — Extend `components/resume/resume-provider.tsx`

> This file already exists. **Do not create a new one. Open and extend it.**
> Replace any `sessionStorage` usage with `localStorage`.
> Add `ResumeMeta` tracking and a `replaceResume` function.

```typescript
// components/resume/resume-provider.tsx
// EXTEND — keep existing exports, add the ones below

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ResumeData {
  name: string;
  skills: string[];
  experience: { role: string; company: string; years: number }[];
  education: string[];
  targetRole?: string;
  summary?: string;
}

export interface ResumeMeta {
  uploadedAt: string;
  fileName: string;
  source: "onboarding" | "dashboard" | "interview-setup";
}

interface ResumeContextValue {
  resumeData: ResumeData | null;
  resumeMeta: ResumeMeta | null;
  isResumeReady: boolean;
  isExtracting: boolean;
  extractionError: string | null;
  handleResumeUpload: (file: File, source: ResumeMeta["source"]) => Promise<void>;
  replaceResume: () => void;
}

// ── Storage keys ───────────────────────────────────────────────────────────

const DATA_KEY = "interviewai_resume_data";
const META_KEY = "interviewai_resume_meta";

// ── Storage helpers (also export for direct use in server-safe lib files) ──

export function saveResumePersistent(data: ResumeData, meta: ResumeMeta): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function loadResumePersistent(): ResumeData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function loadResumeMetaPersistent(): ResumeMeta | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(META_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function hasResumePersistent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DATA_KEY) !== null;
}

export function clearResumePersistent(): void {
  localStorage.removeItem(DATA_KEY);
  localStorage.removeItem(META_KEY);
}

// ── Context ────────────────────────────────────────────────────────────────

const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeMeta, setResumeMeta] = useState<ResumeMeta | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const data = loadResumePersistent();
    const meta = loadResumeMetaPersistent();
    if (data) setResumeData(data);
    if (meta) setResumeMeta(meta);
  }, []);

  const handleResumeUpload = async (file: File, source: ResumeMeta["source"]) => {
    setIsExtracting(true);
    setExtractionError(null);
    try {
      // Call the existing app/api/resume/ route — pass file as FormData
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const extracted: ResumeData = await res.json();
      const meta: ResumeMeta = {
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        source,
      };

      saveResumePersistent(extracted, meta);
      setResumeData(extracted);
      setResumeMeta(meta);
    } catch (err) {
      setExtractionError("Resume analysis failed. Please try again.");
      console.error("[ResumeProvider] upload error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const replaceResume = () => {
    clearResumePersistent();
    setResumeData(null);
    setResumeMeta(null);
    setExtractionError(null);
  };

  return (
    <ResumeContext.Provider value={{
      resumeData,
      resumeMeta,
      isResumeReady: resumeData !== null,
      isExtracting,
      extractionError,
      handleResumeUpload,
      replaceResume,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume(): ResumeContextValue {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used inside <ResumeProvider>");
  return ctx;
}
```

---

### Step 2 — Update `app/api/resume/route.ts`

> This API route already exists at `app/api/resume/`. Open it.
> Make sure it accepts a PDF/text file via FormData, extracts text, calls the AI model, and returns `ResumeData` JSON.
> If it already does this, add the model call below. If it's empty, create it.

```typescript
// app/api/resume/route.ts

import { NextRequest, NextResponse } from "next/server";

const RESUME_MODEL = "claude-haiku-4-5-20251001";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract text from file
    // For PDF: use pdfjs-dist or pdf-parse on the server
    // For .txt / .docx: use file.text() or mammoth
    const resumeText = await file.text(); // ← replace with PDF parser if needed

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: RESUME_MODEL,
        max_tokens: 1000,
        system: `You are a resume parser. Extract structured data from the resume.
Return ONLY valid JSON, no markdown, no explanation.
Schema: { name: string, skills: string[], experience: [{role, company, years}], education: string[], targetRole: string, summary: string }`,
        messages: [{ role: "user", content: `Parse this resume:\n\n${resumeText}` }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Model error: ${err}`);
    }

    const data = await response.json();
    const raw = data.content[0]?.text || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[api/resume] error:", err);
    return NextResponse.json({ error: "Resume extraction failed" }, { status: 500 });
  }
}
```

---

### Step 3 — Extend `components/resume/resume-dropzone.tsx`

> This file already exists. **Do not replace it. Add the `source` prop and wire it to `useResume()`.**

```typescript
// components/resume/resume-dropzone.tsx
// EXTEND — add source prop, wire to ResumeProvider context

"use client";

import { useResume } from "./resume-provider";
import type { ResumeMeta } from "./resume-provider";

interface ResumeDropzoneProps {
  source: ResumeMeta["source"];  // ← NEW prop — pass from parent
  onSuccess?: () => void;        // ← optional callback after extraction
  // keep all existing props
}

export function ResumeDropzone({ source, onSuccess, ...existingProps }: ResumeDropzoneProps) {
  const { resumeData, resumeMeta, isResumeReady, isExtracting, extractionError, handleResumeUpload, replaceResume } = useResume();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    await handleResumeUpload(file, source);
    onSuccess?.();
  };

  // ── If resume already exists: show card, not dropzone ──────────────────────
  if (isResumeReady && resumeMeta) {
    return (
      <div className="resume-status-card">
        {/* Keep existing card styling */}
        <div className="flex items-center gap-3">
          <span>📄</span>
          <div>
            <p className="font-medium text-sm">{resumeMeta.fileName}</p>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date(resumeMeta.uploadedAt).toLocaleDateString()}
              {" · "}{resumeData?.skills?.length ?? 0} skills detected
            </p>
          </div>
          <button
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={replaceResume}
          >
            Replace ↑
          </button>
        </div>
      </div>
    );
  }

  // ── Extracting state ───────────────────────────────────────────────────────
  if (isExtracting) {
    return (
      <div className="resume-extracting flex items-center gap-2 p-4 border rounded-lg">
        {/* Use existing <Spinner /> from components/ui/spinner.tsx */}
        <span className="text-sm">Analyzing your resume with AI...</span>
      </div>
    );
  }

  // ── Default: show drop zone (existing UI) ──────────────────────────────────
  return (
    <div>
      {extractionError && (
        <p className="text-destructive text-sm mb-2">{extractionError}</p>
      )}
      {/* Keep your existing dropzone JSX here — just call onDrop from above */}
      {/* existing dropzone UI ... */}
    </div>
  );
}
```

---

### Step 4 — Update `components/dashboard/resume-upload-card.tsx`

> This file already exists. Open it and replace the upload handler with `useResume()`.

```typescript
// components/dashboard/resume-upload-card.tsx
// EXTEND — wire to ResumeProvider instead of local state

"use client";

import { ResumeDropzone } from "@/components/resume/resume-dropzone";

export function ResumeUploadCard() {
  // ResumeDropzone handles all state internally via context
  // Just pass source="dashboard"
  return (
    <div className="resume-upload-card">
      <h3 className="text-sm font-semibold mb-2">Your Resume</h3>
      <ResumeDropzone source="dashboard" />
      {/* The dropzone auto-shows the resume card if one exists */}
      {/* or the upload UI if none exists */}
    </div>
  );
}
```

---

## PHASE 2 — RESUME UPLOAD FLOW (per screen)

### Step 5 — `app/auth/onboarding/welcome/page.tsx` (PRIMARY upload)

```typescript
// app/auth/onboarding/welcome/page.tsx
// PRIMARY upload point — new users land here first

"use client";

import { useResume } from "@/components/resume/resume-provider";
import { ResumeDropzone } from "@/components/resume/resume-dropzone";
import { useRouter } from "next/navigation";

export default function OnboardingWelcomePage() {
  const { isResumeReady } = useResume();
  const router = useRouter();

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="onboarding-page">
      {/* existing onboarding UI ... */}

      {/* Resume upload section */}
      <section>
        <h2>Add your resume</h2>
        <p className="text-muted-foreground text-sm">
          Used to personalize your interview questions. You only need to do this once.
        </p>
        <ResumeDropzone source="onboarding" onSuccess={handleContinue} />
      </section>

      {/* Skip option */}
      <button
        variant="ghost"
        onClick={handleContinue}
        className="text-sm text-muted-foreground"
      >
        Skip for now →
      </button>
    </div>
  );
}
```

---

### Step 6 — `app/dashboard/resume/` (SECONDARY fallback)

> The `dashboard/resume/` folder exists. If it has a `page.tsx`, open it.
> If not, create `app/dashboard/resume/page.tsx`.

```typescript
// app/dashboard/resume/page.tsx
// Dashboard resume management — shows current resume or upload prompt

"use client";

import { useResume } from "@/components/resume/resume-provider";
import { ResumeDropzone } from "@/components/resume/resume-dropzone";

export default function DashboardResumePage() {
  const { resumeData, isResumeReady } = useResume();

  return (
    <div className="dashboard-resume-page p-6">
      <h1 className="text-lg font-semibold mb-1">Your Resume</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isResumeReady
          ? "This resume is used across all your interviews. Replace it anytime."
          : "Upload your resume to get personalized interview questions."}
      </p>

      {/* ResumeDropzone auto-shows card or upload based on state */}
      <ResumeDropzone source="dashboard" />

      {/* If resume exists, show extracted data preview */}
      {isResumeReady && resumeData && (
        <div className="resume-preview mt-6 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Detected Skills</p>
            <div className="flex flex-wrap gap-1">
              {resumeData.skills.map((skill) => (
                <span key={skill} className="badge badge-secondary text-xs">{skill}</span>
              ))}
            </div>
          </div>
          {resumeData.targetRole && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Target Role</p>
              <p className="text-sm">{resumeData.targetRole}</p>
            </div>
          )}
          {resumeData.experience?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Experience</p>
              {resumeData.experience.map((e, i) => (
                <p key={i} className="text-sm">{e.role} · {e.company} · {e.years}yr</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### Step 7 — `components/interview/interview-setup.tsx` (TERTIARY / last-chance)

> Open the existing file. Add a resume check at the top of the setup form.

```typescript
// components/interview/interview-setup.tsx
// EXTEND — add resume check block near the top of the setup form JSX

"use client";

import { useResume } from "@/components/resume/resume-provider";
import { ResumeDropzone } from "@/components/resume/resume-dropzone";

// Inside the component, add:
const { isResumeReady } = useResume();

// Add this block inside the JSX, before the "Start Interview" button:
{!isResumeReady && (
  <div className="setup-resume-fallback border border-dashed rounded-lg p-4 mb-4">
    <p className="text-sm font-medium mb-1">No resume found</p>
    <p className="text-xs text-muted-foreground mb-3">
      Add one for tailored questions, or skip to use generic questions.
    </p>
    <ResumeDropzone source="interview-setup" />
  </div>
)}

{isResumeReady && (
  <div className="setup-resume-present mb-4">
    {/* Compact view — full management is on /dashboard/resume */}
    <ResumeDropzone source="interview-setup" />
  </div>
)}
```

---

## PHASE 3 — DUAL MODEL IN INTERVIEW ROOM

### Step 8 — Update `app/api/interview/chat/route.ts`

> This route already exists. Extend it to support two separate modes:
> `mode: "interview"` → Model B (questions/evaluation)
> `mode: "chat"` → Model C (Alex assistant)

```typescript
// app/api/interview/chat/route.ts
// EXTEND — add mode switching for dual-model support

import { NextRequest, NextResponse } from "next/server";

const INTERVIEW_MODEL = "claude-sonnet-4-20250514"; // Model B — smarter, for questions
const CHAT_MODEL      = "claude-haiku-4-5-20251001"; // Model C — faster, for chat

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, messages, resumeContext, ...rest } = body;

    // ── Model B: Interview questions and evaluation ────────────────────────
    if (mode === "interview") {
      const systemPrompt = `You are a senior technical interviewer conducting a mock interview.
${resumeContext ? `Candidate background: ${resumeContext}` : ""}
Generate clear, specific interview questions and evaluate answers fairly.
When asked to evaluate, return JSON: { score: 0-10, feedback: string, improvement: string }
When asked to generate questions, return JSON array: [{id, text, type, difficulty}]`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: INTERVIEW_MODEL,
          max_tokens: 1000,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) throw new Error(`Model B error: ${response.status}`);
      const data = await response.json();
      return NextResponse.json({ content: data.content[0]?.text, mode: "interview" });
    }

    // ── Model C: Alex chat assistant ───────────────────────────────────────
    if (mode === "chat") {
      const systemPrompt = `You are Alex, a friendly AI career coach inside InterviewAI.
You support candidates during their interview practice session.
${resumeContext ? `You know this candidate: ${resumeContext}` : ""}
You are in the CHAT PANEL. You do NOT generate interview questions or evaluate answers.
You answer doubts, explain concepts, give encouragement, and help with anything the candidate asks.
Keep responses concise, warm, and practical.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: CHAT_MODEL,
          max_tokens: 1000,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) throw new Error(`Model C error: ${response.status}`);
      const data = await response.json();
      return NextResponse.json({ content: data.content[0]?.text, mode: "chat" });
    }

    return NextResponse.json({ error: "Invalid mode. Use 'interview' or 'chat'." }, { status: 400 });
  } catch (err) {
    console.error("[api/interview/chat] error:", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
```

---

### Step 9 — Update `components/interview/interview-room.tsx`

> Open the existing file. Add two-panel layout and wire both models via the single `/api/interview/chat` route.

```typescript
// components/interview/interview-room.tsx
// EXTEND — add dual-panel layout, wire Model B (left) and Model C / Alex (right)

"use client";

import { useState, useEffect, useRef } from "react";
import { loadResumePersistent } from "@/components/resume/resume-provider";

// ── Types ──────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  text: string;
  type: "technical" | "behavioral" | "system-design";
  difficulty: "easy" | "medium" | "hard";
}

interface EvaluationResult {
  score: number;
  feedback: string;
  improvement: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildResumeContext(): string {
  const resume = loadResumePersistent();
  if (!resume) return "";
  return `${resume.name}, skills: ${resume.skills.slice(0, 8).join(", ")}, target role: ${resume.targetRole || "not specified"}`;
}

async function callInterviewAPI(mode: "interview" | "chat", messages: ChatMessage[], resumeContext: string) {
  const res = await fetch("/api/interview/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, messages, resumeContext }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content as string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function InterviewRoom({ interviewId }: { interviewId: string }) {
  const resumeContext = buildResumeContext();

  // ── LEFT PANEL state (Model B) ─────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerMode, setAnswerMode] = useState<"text" | "code" | "voice">("text");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<ChatMessage[]>([]);

  // ── RIGHT PANEL state (Model C — Alex) ────────────────────────────────
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Init: load questions on mount ─────────────────────────────────────
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const resume = loadResumePersistent();
        const role = resume?.targetRole || "Software Engineer";

        const initMessages: ChatMessage[] = [{
          role: "user",
          content: `Generate 5 interview questions for a ${role} role. Return as JSON array only.`,
        }];

        const raw = await callInterviewAPI("interview", initMessages, resumeContext);
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as Question[];
        setQuestions(parsed);
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  // ── Auto-scroll chat ───────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ── Submit answer to Model B ───────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !questions[currentQIndex]) return;
    setIsEvaluating(true);

    const q = questions[currentQIndex];
    const newHistory: ChatMessage[] = [
      ...interviewHistory,
      {
        role: "user",
        content: `Question: "${q.text}"\n\nAnswer (${answerMode}):\n${userAnswer}\n\nPlease evaluate this answer. Return JSON: { score, feedback, improvement }`,
      },
    ];

    try {
      const raw = await callInterviewAPI("interview", newHistory, resumeContext);
      const result = JSON.parse(raw.replace(/```json|```/g, "").trim()) as EvaluationResult;
      setEvaluation(result);
      setInterviewHistory([...newHistory, { role: "assistant", content: raw }]);
    } catch (e) {
      console.error("Evaluation failed:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Next question ──────────────────────────────────────────────────────
  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswer("");
    setCurrentQIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  // ── Send chat to Model C (Alex) ────────────────────────────────────────
  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const reply = await callInterviewAPI("chat", newHistory, resumeContext);
      setChatHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setChatHistory([...newHistory, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="interview-room flex h-screen overflow-hidden">

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — Model B (Questions + Answers)                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="main-panel flex-1 overflow-y-auto p-6 space-y-6">

        {/* Progress */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Question {currentQIndex + 1} of {questions.length || "—"}</span>
        </div>

        {/* Question Card */}
        {isLoadingQuestions ? (
          <div className="question-loading">
            {/* Use <Skeleton /> from components/ui/skeleton.tsx */}
            <p className="text-sm text-muted-foreground">Generating your personalized questions...</p>
          </div>
        ) : questions[currentQIndex] ? (
          <div className="question-card border rounded-xl p-5 space-y-2">
            <div className="flex gap-2">
              {/* Use <Badge /> from components/ui/badge.tsx */}
              <span className="badge">{questions[currentQIndex].type}</span>
              <span className="badge">{questions[currentQIndex].difficulty}</span>
            </div>
            <h2 className="text-base font-medium leading-snug">
              {questions[currentQIndex].text}
            </h2>
          </div>
        ) : null}

        {/* Answer Mode Tabs — use <Tabs /> from components/ui/tabs.tsx */}
        <div className="answer-mode-tabs flex gap-2">
          {(["text", "code", "voice"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAnswerMode(mode)}
              className={`tab-btn ${answerMode === mode ? "active" : ""}`}
            >
              {mode === "text" ? "📝 Text" : mode === "code" ? "💻 Code" : "🎤 Voice"}
            </button>
          ))}
        </div>

        {/* Answer Input */}
        {answerMode === "code" ? (
          <textarea
            className="w-full font-mono text-sm border rounded-lg p-3 min-h-[200px] bg-muted"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="// Write your solution here..."
          />
        ) : answerMode === "text" ? (
          <textarea
            className="w-full text-sm border rounded-lg p-3 min-h-[120px]"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        ) : (
          <div className="voice-input border rounded-lg p-4 text-center">
            {/* Wire to Web Speech API — SpeechRecognition — transcript goes to userAnswer */}
            <button className="btn-voice">🎤 Start Recording</button>
            {userAnswer && <p className="text-sm mt-2 text-muted-foreground">{userAnswer}</p>}
          </div>
        )}

        {/* Submit */}
        {!evaluation && (
          <button
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !userAnswer.trim()}
            className="btn-primary w-full"
          >
            {isEvaluating ? "Evaluating..." : "Submit Answer →"}
          </button>
        )}

        {/* Evaluation Result */}
        {evaluation && (
          <div className="evaluation-card border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{evaluation.score}/10</span>
              {/* Use <Progress /> from components/ui/progress.tsx */}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Feedback</p>
              <p className="text-sm">{evaluation.feedback}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">How to improve</p>
              <p className="text-sm">{evaluation.improvement}</p>
            </div>
            <button onClick={handleNextQuestion} className="btn-primary w-full">
              Next Question →
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — Model C (Alex Chat Assistant)                     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="chat-panel w-80 border-l flex flex-col shrink-0">

        <div className="chat-header px-4 py-3 border-b">
          <p className="text-sm font-semibold">💬 Alex — Your Coach</p>
          <p className="text-xs text-muted-foreground">Ask me anything during your session</p>
        </div>

        {/* Messages */}
        <div className="chat-messages flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {chatHistory.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-8">
              Stuck on a question? Need a hint? Ask me anything 👋
            </p>
          )}
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble text-sm px-3 py-2 rounded-xl max-w-[90%] ${
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isChatLoading && (
            <div className="chat-bubble bg-muted text-sm px-3 py-2 rounded-xl max-w-[90%]">
              Alex is typing…
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-row px-4 py-3 border-t flex gap-2">
          <input
            type="text"
            className="flex-1 text-sm border rounded-lg px-3 py-2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
            placeholder="Ask Alex..."
            disabled={isChatLoading}
          />
          <button
            onClick={handleChatSend}
            disabled={isChatLoading || !chatInput.trim()}
            className="btn-primary px-3"
          >
            ↑
          </button>
        </div>

      </div>
    </div>
  );
}
```

---

## FINAL FILE MAP — What to touch, what to create

```
MODIFY (file exists — open and extend):
├── components/resume/resume-provider.tsx     ← Step 1: add persistence + context
├── components/resume/resume-dropzone.tsx     ← Step 3: add source prop + status card
├── components/dashboard/resume-upload-card.tsx  ← Step 4: wire to useResume()
├── components/interview/interview-setup.tsx  ← Step 7: add resume check block
├── components/interview/interview-room.tsx   ← Step 9: full dual-panel rewrite
├── app/api/interview/chat/route.ts           ← Step 8: add mode switching
├── app/auth/onboarding/welcome/page.tsx      ← Step 5: add ResumeDropzone

CREATE (file does not exist yet):
└── app/dashboard/resume/page.tsx             ← Step 6: resume management page

UPDATE API ROUTE (may need extending):
└── app/api/resume/route.ts                   ← Step 2: ensure returns ResumeData JSON
```

---

## RULES FOR CODEX (enforce on every file)

| Rule | Detail |
|---|---|
| `localStorage` only | Resume data is never in `sessionStorage`. Survives refresh and navigation. |
| `clearResumePersistent()` is explicit only | Only called when user clicks "Replace ↑". Never on logout, route change, or timeout. |
| `useResume()` hook everywhere | No component calls `localStorage` directly. Always go through the hook. |
| `ResumeDropzone` is the only upload UI | Never build a second file input. Pass `source` prop to identify where it's used. |
| Interview room never uploads | `interview/[id]/page.tsx` and `interview-room.tsx` only call `loadResumePersistent()`. No upload UI. |
| Single API route, two modes | `/api/interview/chat` handles both `mode: "interview"` (Model B) and `mode: "chat"` (Model C). |
| API key server-side only | `ANTHROPIC_API_KEY` is only used in `/api/` routes. Never in client components. |
