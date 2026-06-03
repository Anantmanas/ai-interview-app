# Codex Agent Instructions — InterviewAI A2A Architecture (v4)
# Blueprint Source: Anant's whiteboard notes (2026-06-01)
# Status: Supersedes v3 — enhanced with model routing, evaluation pipeline, report generation

---

## BLUEPRINT SUMMARY (from notes)

```
Model-A responsibilities:
  1. Generate high-quality questions using parsed resume data (from Model-B)
  2. Analyze user answers in 3 formats: text, voice, code
  3. If question needs explanation + code snippet → analyze BOTH together
  4. After END-INTERVIEW → evaluate full session + generate report:
       → User's Strong Topics
       → User's Weak Topics
       → Topics Where Improvement Needed

Model-B responsibilities:
  1. Parse the uploaded resume → return structured JSON
  2. Feed that JSON to Model-A for personalized question generation
```

---

## TESTING MODEL RECOMMENDATIONS (for RapidAPI / development phase)

> RapidAPI is a marketplace — it proxies third-party AI APIs under one key.
> Below are the best options per use case for your testing phase.
> All are accessible via RapidAPI or their own free-tier APIs directly.

### Model Selection Table

| Use Case | Recommended Model | Why | API Access |
|---|---|---|---|
| **Resume Parsing (Model-B)** | `gemini-2.5-flash` | Fast, handles PDFs natively, free tier (15 RPM) | Google AI Studio — no credit card |
| **Question Generation (Model-A)** | `claude-sonnet-4` | Best instruction-following, structured JSON output | Anthropic API ($5 free credit) |
| **Answer Evaluation — Text/Voice** | `claude-sonnet-4` | Strong reasoning, consistent scoring | Same as above |
| **Answer Evaluation — Code** | `claude-sonnet-4` or `gpt-4.1` | Both excellent at code review | Anthropic or OpenAI |
| **End-Interview Report Generation** | `claude-sonnet-4` | Long context, structured output, analytical | Anthropic API |
| **Alex Chat Panel (Model-C)** | `gemini-2.5-flash` or `claude-haiku-4-5` | Low latency, cheap, conversational | Google AI Studio or Anthropic |

### For RapidAPI Testing Specifically

Search these on rapidapi.com — they are available as proxied APIs:
- **"ChatGPT API"** → proxies GPT-4o / GPT-4.1 — good for code evaluation testing
- **"Claude API"** → some providers proxy Anthropic models — use for question gen
- **"Gemini API"** → proxies Google models — best free option for resume parsing

> Recommended for your scale: Go **direct to Google AI Studio** (free, no card) for Gemini Flash
> and **direct to Anthropic API** ($5 credit, enough for weeks of dev testing) for Sonnet.
> RapidAPI adds a proxy layer and markup cost — fine for testing endpoints, not for production.

---

## UPDATED ARCHITECTURE (A2A: Agent-to-Agent)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MODEL-B (Resume Agent) — gemini-2.5-flash or claude-haiku                  │
│  app/api/resume/route.ts                                                     │
│  Input:  PDF/text file                                                       │
│  Output: ResumeData JSON → saved to localStorage                             │
│  Trigger: Once on upload — never again unless replaced                       │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ ResumeData JSON passed as context
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  MODEL-A (Interview Agent) — claude-sonnet-4                                 │
│  app/api/interview/chat/route.ts  (mode: "interview")                        │
│                                                                              │
│  Phase 1 — Question Generation                                               │
│    Input:  ResumeData + role + difficulty                                    │
│    Output: Question[] with type + format hints                               │
│                                                                              │
│  Phase 2 — Answer Analysis                                                   │
│    Input:  question + answer (text | voice-transcript | code)                │
│    Logic:  if question.requiresCode → analyze text explanation + code both   │
│    Output: { score, feedback, improvement, topicTag }                        │
│                                                                              │
│  Phase 3 — End-Interview Report (triggered on END click)                    │
│    Input:  full session history (all Q&A + scores)                           │
│    Output: InterviewReport { strongTopics[], weakTopics[], improvementPlan } │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ Report saved → app/api/roadmap/ + dashboard
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  MODEL-C (Alex Chat Agent) — gemini-2.5-flash or claude-haiku               │
│  app/api/interview/chat/route.ts  (mode: "chat")                             │
│  Runs independently in right panel — no connection to Model-A               │
│  Context: ResumeData (read-only) + current question (passed as prop)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1 — UPDATE `/api/interview/chat/route.ts`

> Open the existing file. Extend the `mode` switch with the new `"generate"`, `"evaluate"`, and `"report"` modes.
> Keep existing `"interview"` and `"chat"` if present — add to them.

```typescript
// app/api/interview/chat/route.ts
// EXTENDED — 4 modes: generate | evaluate | report | chat

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY from env automatically

const INTERVIEW_MODEL = "claude-sonnet-4-20250514"; // Model-A: questions + eval + report
const CHAT_MODEL      = "claude-haiku-4-5-20251001"; // Model-C: Alex chat panel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, messages, resumeContext, sessionHistory, answerType } = body;

    // ── MODE: generate ────────────────────────────────────────────────────────
    // Model-A Phase 1: Generate personalized questions from resume context
    if (mode === "generate") {
      const response = await client.messages.create({
        model: INTERVIEW_MODEL,
        max_tokens: 1500,
        system: `You are a senior technical interviewer at a top tech company.
Generate high-quality, specific interview questions tailored to the candidate's background.
${resumeContext ? `Candidate profile: ${resumeContext}` : "No resume — use general software engineering questions."}

Return ONLY a valid JSON array. No markdown, no explanation.
Schema: [{ id: string, text: string, type: "technical"|"behavioral"|"system-design", difficulty: "easy"|"medium"|"hard", requiresCode: boolean, topicTag: string }]

Rules:
- requiresCode: true only if the question specifically needs a code implementation
- topicTag: one word like "arrays", "leadership", "scalability", "databases"
- Mix question types based on the candidate's experience level
- Make questions specific to their actual skills, not generic`,
        messages: messages || [{ role: "user", content: body.prompt }],
      });

      const raw = response.content[0]?.type === "text" ? response.content[0].text : "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      return NextResponse.json({ questions: parsed, mode: "generate" });
    }

    // ── MODE: evaluate ────────────────────────────────────────────────────────
    // Model-A Phase 2: Analyze user answer — handles text, voice, code, or combined
    if (mode === "evaluate") {
      const { question, textAnswer, codeAnswer } = body;

      // Build evaluation prompt based on answerType
      let evaluationPrompt = `Question: "${question.text}" (Topic: ${question.topicTag}, Difficulty: ${question.difficulty})\n\n`;

      if (answerType === "code") {
        evaluationPrompt += `Code Answer:\n\`\`\`\n${codeAnswer}\n\`\`\``;
      } else if (answerType === "combined") {
        // Question requires both explanation + code (requiresCode: true)
        evaluationPrompt += `Text/Voice Explanation:\n${textAnswer}\n\nCode Implementation:\n\`\`\`\n${codeAnswer}\n\`\`\`\n\nEvaluate BOTH the explanation quality AND the code correctness together.`;
      } else {
        // text or voice-transcript
        evaluationPrompt += `Answer (${answerType}):\n${textAnswer}`;
      }

      evaluationPrompt += `\n\nReturn ONLY valid JSON. No markdown.
Schema: { score: number (0-10), feedback: string, improvement: string, topicTag: string, isStrong: boolean }
isStrong: true if score >= 7`;

      const response = await client.messages.create({
        model: INTERVIEW_MODEL,
        max_tokens: 800,
        system: `You are a strict but fair technical interviewer evaluating interview answers.
Be specific in feedback. Reference the actual content of the answer.
For code: check correctness, efficiency, edge cases, and readability.
For explanations: check clarity, completeness, and accuracy.
For combined answers: both must be good for a high score.`,
        messages: [{ role: "user", content: evaluationPrompt }],
      });

      const raw = response.content[0]?.type === "text" ? response.content[0].text : "{}";
      const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
      return NextResponse.json({ evaluation: result, mode: "evaluate" });
    }

    // ── MODE: report ──────────────────────────────────────────────────────────
    // Model-A Phase 3: End-interview full session report
    if (mode === "report") {
      // sessionHistory: [{ question, answerType, answer, evaluation }]
      const sessionSummary = sessionHistory.map((item: any, i: number) =>
        `Q${i + 1} [${item.question.topicTag}] (${item.question.difficulty}): "${item.question.text}"
Answer type: ${item.answerType}
Score: ${item.evaluation.score}/10
Feedback: ${item.evaluation.feedback}`
      ).join("\n\n");

      const response = await client.messages.create({
        model: INTERVIEW_MODEL,
        max_tokens: 2000,
        system: `You are a career coach generating a detailed post-interview performance report.
Analyze the full interview session and identify clear patterns.
Return ONLY valid JSON. No markdown.
Schema: {
  overallScore: number (0-10, average),
  strongTopics: [{ topic: string, reason: string }],
  weakTopics: [{ topic: string, reason: string }],
  improvementPlan: [{ topic: string, action: string, resources: string }],
  summary: string (2-3 sentence overall assessment)
}`,
        messages: [{
          role: "user",
          content: `Generate a detailed performance report for this interview session:\n\n${sessionSummary}
${resumeContext ? `\nCandidate profile: ${resumeContext}` : ""}`,
        }],
      });

      const raw = response.content[0]?.type === "text" ? response.content[0].text : "{}";
      const report = JSON.parse(raw.replace(/```json|```/g, "").trim());
      return NextResponse.json({ report, mode: "report" });
    }

    // ── MODE: chat ────────────────────────────────────────────────────────────
    // Model-C: Alex chat panel — pure conversational assistant
    if (mode === "chat") {
      const { currentQuestion } = body;

      const response = await client.messages.create({
        model: CHAT_MODEL,
        max_tokens: 600,
        system: `You are Alex, a friendly AI career coach inside InterviewAI.
${resumeContext ? `You know this candidate: ${resumeContext}.` : ""}
${currentQuestion ? `The candidate is currently answering: "${currentQuestion}"` : ""}
You are in the CHAT PANEL only. You do NOT evaluate answers or generate interview questions.
Help with: explaining concepts, giving hints (without spoiling), encouragement, clarifying doubts.
Keep responses concise (2-4 sentences max), warm, and practical.`,
        messages: messages,
      });

      const content = response.content[0]?.type === "text" ? response.content[0].text : "";
      return NextResponse.json({ content, mode: "chat" });
    }

    return NextResponse.json({ error: "Invalid mode. Use: generate | evaluate | report | chat" }, { status: 400 });

  } catch (err: any) {
    console.error("[api/interview/chat] error:", err?.message || err);
    return NextResponse.json({ error: "Request failed", detail: err?.message }, { status: 500 });
  }
}
```

---

## PHASE 2 — CREATE `lib/interviewSession.ts`

> New file. Manages the full session state — questions, answers, evaluations — and triggers the report.
> This is the central state manager for the interview room.

```typescript
// lib/interviewSession.ts
// Session state manager — tracks full interview lifecycle

export type AnswerType = "text" | "voice" | "code" | "combined";

export interface Question {
  id: string;
  text: string;
  type: "technical" | "behavioral" | "system-design";
  difficulty: "easy" | "medium" | "hard";
  requiresCode: boolean;
  topicTag: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  improvement: string;
  topicTag: string;
  isStrong: boolean;
}

export interface SessionEntry {
  question: Question;
  answerType: AnswerType;
  textAnswer?: string;
  codeAnswer?: string;
  evaluation: EvaluationResult;
  timestamp: string;
}

export interface InterviewReport {
  overallScore: number;
  strongTopics: { topic: string; reason: string }[];
  weakTopics:   { topic: string; reason: string }[];
  improvementPlan: { topic: string; action: string; resources: string }[];
  summary: string;
}

// ── API helpers ────────────────────────────────────────────────────────────

export async function fetchQuestions(
  resumeContext: string,
  role: string,
  count: number = 5
): Promise<Question[]> {
  const res = await fetch("/api/interview/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "generate",
      resumeContext,
      prompt: `Generate ${count} interview questions for a ${role} role.`,
    }),
  });
  if (!res.ok) throw new Error("Failed to generate questions");
  const data = await res.json();
  return data.questions;
}

export async function evaluateAnswer(
  question: Question,
  answerType: AnswerType,
  textAnswer?: string,
  codeAnswer?: string,
  resumeContext?: string
): Promise<EvaluationResult> {
  const res = await fetch("/api/interview/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "evaluate",
      question,
      answerType,
      textAnswer,
      codeAnswer,
      resumeContext,
    }),
  });
  if (!res.ok) throw new Error("Failed to evaluate answer");
  const data = await res.json();
  return data.evaluation;
}

export async function generateReport(
  sessionHistory: SessionEntry[],
  resumeContext?: string
): Promise<InterviewReport> {
  const res = await fetch("/api/interview/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "report",
      sessionHistory,
      resumeContext,
    }),
  });
  if (!res.ok) throw new Error("Failed to generate report");
  const data = await res.json();
  return data.report;
}

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  resumeContext: string,
  currentQuestion?: string
): Promise<string> {
  const res = await fetch("/api/interview/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "chat", messages, resumeContext, currentQuestion }),
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json();
  return data.content;
}
```

---

## PHASE 3 — UPDATE `components/interview/interview-room.tsx`

> Open existing file. Full replacement of state and JSX with the A2A session flow below.

```typescript
// components/interview/interview-room.tsx
// FULL REWRITE — A2A dual-model with answer type detection and END-INTERVIEW report

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { loadResumePersistent } from "@/components/resume/resume-provider";
import {
  fetchQuestions, evaluateAnswer, generateReport, sendChatMessage,
  Question, EvaluationResult, SessionEntry, InterviewReport, AnswerType
} from "@/lib/interviewSession";

// ── Build resume context string for API calls ──────────────────────────────
function buildResumeContext(): string {
  const r = loadResumePersistent();
  if (!r) return "";
  return `${r.name ?? "Candidate"}, skills: ${r.skills?.slice(0, 8).join(", ")}, target role: ${r.targetRole ?? "Software Engineer"}`;
}

export function InterviewRoom({ interviewId }: { interviewId: string }) {
  const resumeContext = buildResumeContext();

  // ── LEFT PANEL — Model-A state ─────────────────────────────────────────
  const [questions, setQuestions]         = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx]       = useState(0);
  const [answerType, setAnswerType]        = useState<AnswerType>("text");
  const [textAnswer, setTextAnswer]        = useState("");
  const [codeAnswer, setCodeAnswer]        = useState("");
  const [evaluation, setEvaluation]        = useState<EvaluationResult | null>(null);
  const [sessionHistory, setSessionHistory]= useState<SessionEntry[]>([]);
  const [isEvaluating, setIsEvaluating]   = useState(false);
  const [isLoading, setIsLoading]          = useState(false);
  const [isRecording, setIsRecording]      = useState(false);
  const recognitionRef                     = useRef<SpeechRecognition | null>(null);

  // ── Report state (shown after END INTERVIEW) ───────────────────────────
  const [report, setReport]               = useState<InterviewReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);

  // ── RIGHT PANEL — Model-C (Alex) state ────────────────────────────────
  const [chatMessages, setChatMessages]   = useState<{role:"user"|"assistant"; content:string}[]>([]);
  const [chatInput, setChatInput]          = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef                         = useRef<HTMLDivElement>(null);

  // ── Load questions on mount ────────────────────────────────────────────
  useEffect(() => {
    const resume = loadResumePersistent();
    const role = resume?.targetRole ?? "Software Engineer";
    setIsLoading(true);
    fetchQuestions(resumeContext, role, 5)
      .then(setQuestions)
      .catch((e) => console.error("Q generation failed:", e))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Auto-scroll chat ───────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Auto-detect combined mode ──────────────────────────────────────────
  // If current question requiresCode, default to "combined" tab
  useEffect(() => {
    if (questions[currentIdx]?.requiresCode) {
      setAnswerType("combined");
    } else {
      setAnswerType("text");
    }
    setTextAnswer("");
    setCodeAnswer("");
    setEvaluation(null);
  }, [currentIdx, questions]);

  // ── Voice recording (Web Speech API) ──────────────────────────────────
  const toggleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice not supported. Use Chrome or Edge.");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Indian English — better accent handling
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setTextAnswer(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  // ── Submit answer to Model-A ───────────────────────────────────────────
  const handleSubmit = async () => {
    const q = questions[currentIdx];
    if (!q) return;

    const hasText = textAnswer.trim().length > 0;
    const hasCode = codeAnswer.trim().length > 0;

    if (answerType === "code" && !hasCode) return;
    if (answerType === "combined" && (!hasText || !hasCode)) return;
    if ((answerType === "text" || answerType === "voice") && !hasText) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer(q, answerType, textAnswer, codeAnswer, resumeContext);
      setEvaluation(result);

      // Record session entry
      const entry: SessionEntry = {
        question: q,
        answerType,
        textAnswer: hasText ? textAnswer : undefined,
        codeAnswer: hasCode ? codeAnswer : undefined,
        evaluation: result,
        timestamp: new Date().toISOString(),
      };
      setSessionHistory((prev) => [...prev, entry]);
    } catch (e) {
      console.error("Evaluation failed:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── END INTERVIEW → trigger report ────────────────────────────────────
  const handleEndInterview = async () => {
    if (sessionHistory.length === 0) return;
    setInterviewEnded(true);
    setIsGeneratingReport(true);
    try {
      const r = await generateReport(sessionHistory, resumeContext);
      setReport(r);
      // TODO: save report to /api/roadmap or /api/interviews for dashboard
    } catch (e) {
      console.error("Report generation failed:", e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // ── Alex chat send ─────────────────────────────────────────────────────
  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = { role: "user" as const, content: chatInput };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const reply = await sendChatMessage(
        newHistory,
        resumeContext,
        questions[currentIdx]?.text
      );
      setChatMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages([...newHistory, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── REPORT VIEW (shown after END INTERVIEW) ────────────────────────────
  if (interviewEnded) {
    return (
      <div className="report-view p-6 max-w-3xl mx-auto space-y-8">
        <h1 className="text-xl font-bold">Interview Complete 🎉</h1>

        {isGeneratingReport ? (
          <div className="flex items-center gap-3">
            {/* <Spinner /> from components/ui/spinner.tsx */}
            <p className="text-sm text-muted-foreground">Generating your performance report...</p>
          </div>
        ) : report ? (
          <>
            {/* Overall Score */}
            <div className="score-card border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-4xl font-bold">{report.overallScore}<span className="text-lg">/10</span></p>
              <p className="text-sm mt-2">{report.summary}</p>
            </div>

            {/* Strong Topics */}
            <div>
              <h2 className="text-sm font-semibold uppercase text-green-600 mb-3">✅ Strong Topics</h2>
              <div className="space-y-2">
                {report.strongTopics.map((t, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="font-medium text-sm">{t.topic}</p>
                    <p className="text-xs text-muted-foreground">{t.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Topics */}
            <div>
              <h2 className="text-sm font-semibold uppercase text-red-500 mb-3">⚠️ Weak Topics</h2>
              <div className="space-y-2">
                {report.weakTopics.map((t, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="font-medium text-sm">{t.topic}</p>
                    <p className="text-xs text-muted-foreground">{t.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Plan */}
            <div>
              <h2 className="text-sm font-semibold uppercase text-blue-500 mb-3">📈 Improvement Plan</h2>
              <div className="space-y-2">
                {report.improvementPlan.map((p, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-1">
                    <p className="font-medium text-sm">{p.topic}</p>
                    <p className="text-xs">{p.action}</p>
                    <p className="text-xs text-muted-foreground">Resources: {p.resources}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn-primary w-full"
              onClick={() => window.location.href = "/dashboard"}
            >
              Go to Dashboard →
            </button>
          </>
        ) : (
          <p className="text-sm text-destructive">Report generation failed. Please try again.</p>
        )}
      </div>
    );
  }

  // ── MAIN INTERVIEW VIEW ────────────────────────────────────────────────
  return (
    <div className="interview-room flex h-screen overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — Model-A (Questions + Answer + Evaluation)            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="main-panel flex-1 overflow-y-auto p-6 space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentIdx + 1} of {questions.length || "—"}
          </span>
          <button
            className="btn-destructive-outline text-sm"
            onClick={handleEndInterview}
            disabled={sessionHistory.length === 0}
          >
            End Interview →
          </button>
        </div>

        {/* Question Card */}
        {isLoading ? (
          <div className="space-y-2">
            {/* <Skeleton /> ×3 from components/ui/skeleton.tsx */}
            <p className="text-sm text-muted-foreground">Generating personalized questions...</p>
          </div>
        ) : questions[currentIdx] ? (
          <div className="question-card border rounded-xl p-5 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {/* <Badge /> from components/ui/badge.tsx */}
              <span className="badge">{questions[currentIdx].type}</span>
              <span className="badge">{questions[currentIdx].difficulty}</span>
              <span className="badge">{questions[currentIdx].topicTag}</span>
              {questions[currentIdx].requiresCode && (
                <span className="badge badge-warning">Requires Code</span>
              )}
            </div>
            <p className="text-base font-medium leading-snug">{questions[currentIdx].text}</p>
          </div>
        ) : null}

        {/* Answer Mode Tabs */}
        {!evaluation && (
          <>
            <div className="answer-tabs flex gap-2 flex-wrap">
              {(["text", "voice", "code", "combined"] as AnswerType[]).map((mode) => {
                const labels = { text: "📝 Text", voice: "🎤 Voice", code: "💻 Code", combined: "📝+💻 Both" };
                // Hide "combined" tab if question doesn't require code
                if (mode === "combined" && !questions[currentIdx]?.requiresCode) return null;
                return (
                  <button
                    key={mode}
                    onClick={() => setAnswerType(mode)}
                    className={`tab-btn ${answerType === mode ? "active" : ""}`}
                  >
                    {labels[mode]}
                  </button>
                );
              })}
            </div>

            {/* Text / Voice input */}
            {(answerType === "text" || answerType === "voice" || answerType === "combined") && (
              <div className="space-y-2">
                {answerType === "voice" ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleVoice}
                      className={`btn-voice ${isRecording ? "recording" : ""}`}
                    >
                      {isRecording ? "⏹ Stop Recording" : "🎤 Start Recording"}
                    </button>
                    {isRecording && <span className="text-xs text-red-500 animate-pulse">Recording...</span>}
                  </div>
                ) : null}
                <textarea
                  className="w-full text-sm border rounded-lg p-3 min-h-[100px]"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={
                    answerType === "voice"
                      ? "Transcript will appear here as you speak..."
                      : answerType === "combined"
                      ? "Explain your approach here..."
                      : "Type your answer..."
                  }
                  readOnly={answerType === "voice"}
                />
              </div>
            )}

            {/* Code input */}
            {(answerType === "code" || answerType === "combined") && (
              <textarea
                className="w-full font-mono text-sm border rounded-lg p-3 min-h-[180px] bg-muted"
                value={codeAnswer}
                onChange={(e) => setCodeAnswer(e.target.value)}
                placeholder="// Write your code here..."
                spellCheck={false}
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="btn-primary w-full"
            >
              {isEvaluating ? "Evaluating..." : "Submit Answer →"}
            </button>
          </>
        )}

        {/* Evaluation Result */}
        {evaluation && (
          <div className="evaluation-card border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{evaluation.score}/10</span>
              {/* <Progress value={evaluation.score * 10} /> from components/ui/progress.tsx */}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Feedback</p>
              <p className="text-sm">{evaluation.feedback}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">How to Improve</p>
              <p className="text-sm">{evaluation.improvement}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEvaluation(null);
                  setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
                }}
                disabled={currentIdx >= questions.length - 1}
                className="btn-primary flex-1"
              >
                Next Question →
              </button>
              {currentIdx >= questions.length - 1 && (
                <button onClick={handleEndInterview} className="btn-primary flex-1">
                  End Interview & Get Report →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — Model-C (Alex Chat)                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="chat-panel w-72 border-l flex flex-col shrink-0">
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-semibold">💬 Alex</p>
          <p className="text-xs text-muted-foreground">Ask anything during your session</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {chatMessages.length === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-6">
              Stuck? Need a hint? Ask me anything 👋
            </p>
          )}
          {chatMessages.map((m, i) => (
            <div
              key={i}
              className={`text-sm px-3 py-2 rounded-xl max-w-[90%] ${
                m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.content}
            </div>
          ))}
          {isChatLoading && (
            <div className="bg-muted text-sm px-3 py-2 rounded-xl max-w-[90%]">
              Alex is typing…
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-4 py-3 border-t flex gap-2">
          <input
            type="text"
            className="flex-1 text-sm border rounded-lg px-3 py-2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
            placeholder="Ask Alex..."
            disabled={isChatLoading}
          />
          <button onClick={handleChatSend} disabled={isChatLoading || !chatInput.trim()} className="btn-primary px-3">↑</button>
        </div>
      </div>
    </div>
  );
}
```

---

## FILE CHANGE SUMMARY

```
MODIFY:
├── app/api/interview/chat/route.ts     ← 4 modes: generate | evaluate | report | chat
├── components/interview/interview-room.tsx ← Full A2A rewrite with report flow

CREATE:
└── lib/interviewSession.ts             ← Session state + all API call helpers

NO CHANGES NEEDED:
├── components/resume/resume-provider.tsx   ← Already updated in v3
├── components/resume/resume-dropzone.tsx   ← Already updated in v3
├── app/api/resume/route.ts                 ← Already updated in v3
```

---

## RULES FOR CODEX

| Rule | Detail |
|---|---|
| `mode: "generate"` | Called once on room mount. Uses resumeContext to personalize. |
| `mode: "evaluate"` | Called per answer. `answerType="combined"` sends both text + code. |
| `mode: "report"` | Called once on END click. Receives full `sessionHistory[]`. |
| `mode: "chat"` | Called per chat message. Passes `currentQuestion` so Alex knows context. |
| `requiresCode` flag | When `true`, auto-switch to `"combined"` tab. Show both text + code inputs. |
| `sessionHistory` | Accumulates locally in state. Never auto-cleared. Passed to report on END. |
| Voice lang | Set `recognition.lang = "en-IN"` for better Indian English accuracy. |
| Report redirect | After report displays, "Go to Dashboard" links to `/dashboard`. Future: save to `/api/roadmap`. |
| API key | `ANTHROPIC_API_KEY` in `.env.local`. The Anthropic SDK reads it automatically — no manual header needed when using `new Anthropic()`. |
