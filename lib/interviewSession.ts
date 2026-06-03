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
  weakTopics: { topic: string; reason: string }[];
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
