'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AntiCheatModal } from '@/components/interview/anti-cheat-modal';
import {
  Mic,
  Code2,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';
import { evaluateTechnicalAnswer, isNonAnswer } from '@/lib/ai/semantic-evaluator';

interface Question {
  id: string;
  text: string;
  type: 'technical' | 'behavioral' | 'system-design';
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  topicTag?: string;
}

interface EvaluationResult {
  score: number;
  caveman_feedback?: string;
  feedback: string;
  improvement?: string;
  improvements?: string;
  technicalAccuracy?: string;
  topic?: string;
  technicalAccuracyScore?: number;
  structureClarityScore?: number;
  depthEdgeCasesScore?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewRoomProps {
  interview: any;
  profile: any;
}

interface EvaluatedRecord {
  question: Question;
  userAnswer: string;
  evaluation: EvaluationResult;
}

function parseSuggestions(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean).map((s) => String(s).trim());
  const trimmed = String(input).trim();
  if (!trimmed) return [];

  const parts = trimmed
    .split(/(?:\r?\n)+|(?<=[.!?])\s*(?=\d+[\.\)])|(?<=[.!?])\s+(?=[A-Z])|(?<=\))\s*(?=[A-Z])/)
    .map((s) => s.trim().replace(/^(?:\d+[\.\)]|•|\*|-)\s*/, ''))
    .filter((s) => s.length > 0);

  return parts.length > 0 ? parts : [trimmed];
}

function cleanFeedbackText(fb: any): string {
  if (!fb) return '';
  if (typeof fb === 'string') {
    const trimmed = fb.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.feedback || parsed.caveman_feedback || '';
      } catch {}
    }
    return trimmed;
  }
  if (typeof fb === 'object') {
    return fb.feedback || fb.caveman_feedback || '';
  }
  return String(fb);
}

const INTERVIEW_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const URGENT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function getInitialInterviewStartTime(interviewId?: string, createdAt?: string): number {
  if (typeof window !== 'undefined' && interviewId) {
    try {
      const stored = localStorage.getItem(`interview_start_time_${interviewId}`);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= Date.now()) {
          if (Date.now() - parsed < INTERVIEW_DURATION_MS) {
            return parsed;
          }
        }
      }
    } catch {}
  }

  if (createdAt) {
    const createdTime = new Date(createdAt).getTime();
    if (!isNaN(createdTime) && createdTime > 0 && createdTime <= Date.now()) {
      if (Date.now() - createdTime < INTERVIEW_DURATION_MS) {
        if (typeof window !== 'undefined' && interviewId) {
          try {
            localStorage.setItem(`interview_start_time_${interviewId}`, String(createdTime));
          } catch {}
        }
        return createdTime;
      }
    }
  }

  const now = Date.now();
  if (typeof window !== 'undefined' && interviewId) {
    try {
      localStorage.setItem(`interview_start_time_${interviewId}`, String(now));
    } catch {}
  }
  return now;
}

function buildResumeContext(profile?: any): string {
  if (profile?.resume_text) return profile.resume_text;
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('interviewai_resume_data');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed?.skills?.length || parsed?.summary) {
          return `Candidate: ${parsed.name || 'Candidate'}\nTarget Role: ${parsed.targetRole || 'Software Engineer'}\nSkills: ${(parsed.skills || []).join(', ')}\nSummary: ${parsed.summary || ''}`;
        }
      }
    } catch {}
  }
  return 'Software Engineer with experience in full-stack development, React, Node.js, TypeScript';
}

/**
 * Score Ring — Precision Radial Instrumentation
 */
function ScoreRing({ score }: { score: number }) {
  const size = 80;
  const r = 34;
  const circ = 2 * Math.PI * r;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circ - (clampedScore / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth={5}
        />
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke={clampedScore >= 75 ? '#34d399' : '#FFFFFF'}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-mono font-bold text-lg leading-none tracking-tight">
          {clampedScore}
        </span>
        <span className="text-[8px] text-white/70 font-mono mt-0.5 uppercase tracking-widest">
          / 100
        </span>
      </div>
    </div>
  );
}

/**
 * MiniBar Sub-score Metric Bar
 */
function MiniBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-white/80 uppercase tracking-wider">{label}</span>
        <span className="text-white font-semibold">{clamped}%</span>
      </div>
      <div className="h-1.5 bg-black/25 rounded-full overflow-hidden border border-white/20">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Voice Waveform — 22-bar frequency visualizer
 */
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  const heights = [10, 22, 14, 30, 18, 26, 12, 28, 20, 16, 24, 32, 14, 26, 18, 12, 24, 28, 16, 10, 20, 14];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-5 bg-[#02040a] border border-[#142347] rounded-xl w-full max-w-sm mx-auto shadow-inner">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            isActive ? 'bg-gradient-to-t from-[#2563eb] to-[#38bdf8]' : 'bg-[#142347]'
          }`}
          style={{
            height: isActive ? `${Math.max(6, Math.min(30, (h * ((i % 3) + 1.2)) % 30 + 6))}px` : '6px',
            animation: isActive ? `wavePulse 0.55s ease-in-out infinite alternate ${i * 0.03}s` : 'none',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wavePulse {
          0% { transform: scaleY(0.35); opacity: 0.5; }
          100% { transform: scaleY(1.25); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * Countdown Timer — Technical Monospace Readout
 */
function CountdownTimer({ startTime, onTimeUp }: { startTime: number; onTimeUp: () => void }) {
  const calculateRemaining = () => {
    const elapsed = Date.now() - startTime;
    return Math.max(0, INTERVIEW_DURATION_MS - elapsed);
  };

  const [timeLeft, setTimeLeft] = useState<number>(calculateRemaining);
  const isUrgent = timeLeft <= URGENT_THRESHOLD_MS;
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onTimeUpRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`rounded-xl px-3.5 py-1.5 font-mono text-xs flex items-center gap-2 transition-colors ${
        isUrgent
          ? 'bg-[#2a0e15] border border-[#f43f5e]/40 text-[#f43f5e] animate-pulse'
          : 'bg-[#0a1226] border border-[#142347] text-[#cbd5e1]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-[#f43f5e]' : 'bg-[#10b981] led-pulse'}`} />
      <span className="tracking-widest font-bold">{displayTime}</span>
    </div>
  );
}

/**
 * Voice Recording Component
 */
function VoiceRecorder({
  transcript,
  onTranscript,
}: {
  transcript: string;
  onTranscript: (text: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);

  const transcriptRef = useRef(transcript);
  const committedTextRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
    if (!isRecordingRef.current) {
      committedTextRef.current = transcript;
    }
  }, [transcript]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true;
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        committedTextRef.current = transcriptRef.current;
        try {
          recognition.start();
        } catch (err) {
          console.warn('Error auto-restarting speech recognition:', err);
        }
      } else {
        setIsRecording(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    };

    recognition.onresult = (event: any) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          const alternatives = Array.from(res as any[])
            .map((alt: any) => ({
              transcript: alt.transcript,
              confidence: typeof alt.confidence === 'number' ? alt.confidence : 0,
            }))
            .sort((a, b) => b.confidence - a.confidence);

          const bestSegment = alternatives[0]?.transcript || '';
          if (bestSegment.trim()) {
            sessionFinal = (sessionFinal ? sessionFinal.trim() + ' ' : '') + bestSegment.trim();
          }
        } else {
          sessionInterim += res[0]?.transcript || '';
        }
      }

      const base = committedTextRef.current ? committedTextRef.current.trim() : '';
      const currentSpoken = (sessionFinal + (sessionInterim ? ' ' + sessionInterim : '')).trim();
      const combined = base
        ? (currentSpoken ? `${base} ${currentSpoken}` : base)
        : currentSpoken;

      transcriptRef.current = combined;
      onTranscript(combined);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
      } catch {}
      committedTextRef.current = transcriptRef.current;
    } else {
      isRecordingRef.current = true;
      setIsRecording(true);
      committedTextRef.current = transcriptRef.current;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const clearTranscript = () => {
    committedTextRef.current = '';
    transcriptRef.current = '';
    onTranscript('');
    if (isRecordingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3.5 py-2">
      <VoiceWaveform isActive={isRecording} />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleRecording}
          className={`px-6 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            isRecording
              ? 'bg-[#f43f5e] text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
              : 'btn-cobalt shadow-[0_0_20px_rgba(37,99,235,0.35)] active:scale-95'
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>STOP RECORDING</span>
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5" />
              <span>START VOICE CAPTURE</span>
            </>
          )}
        </button>

        {transcript && (
          <button
            onClick={clearTranscript}
            className="text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] transition-colors rounded-xl border border-[#142347] bg-[#060b18] px-3.5 py-2 cursor-pointer"
          >
            RESET
          </button>
        )}
      </div>

      <p className="text-[10px] text-[#64748b] font-mono uppercase tracking-wider">
        High-Fidelity Neural Speech Grounding (en-IN + International)
      </p>
    </div>
  );
}

/**
 * Main InterviewRoom Component
 */
export function InterviewRoom({ interview, profile }: InterviewRoomProps) {
  const router = useRouter();
  const interviewId = interview?.id;
  const resumeContext = buildResumeContext(profile);
  const interviewType = interview?.type || 'technical';
  const difficulty = interview?.difficulty || 'medium';

  // State management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerMode, setAnswerMode] = useState<'text' | 'voice' | 'code'>('text');
  const [textAnswer, setTextAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [interviewStartTime] = useState<number>(() =>
    getInitialInterviewStartTime(interviewId, interview?.created_at)
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [streamingFeedback, setStreamingFeedback] = useState('');

  // UI state
  const [mobileTab, setMobileTab] = useState<'briefing' | 'workspace' | 'coach'>('workspace');
  const [showEndModal, setShowEndModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [recordedHistory, setRecordedHistory] = useState<EvaluatedRecord[]>([]);

  // Synchronize start time to local storage
  useEffect(() => {
    if (interviewId && interviewStartTime) {
      try {
        localStorage.setItem(`interview_start_time_${interviewId}`, String(interviewStartTime));
      } catch {}
    }
  }, [interviewId, interviewStartTime]);

  // Anti-Cheat (Restrict to max 2 pastes)
  const [pasteCount, setPasteCount] = useState(0);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [pasteWarningToast, setPasteWarningToast] = useState<string | null>(null);
  const pasteCountRef = useRef(0);
  pasteCountRef.current = pasteCount;

  const registerPasteAttempt = (e?: any) => {
    if (pasteCountRef.current >= 2) {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();
      setShowAntiCheatModal(true);
      return false;
    } else {
      const next = pasteCountRef.current + 1;
      setPasteCount(next);
      setPasteWarningToast(`Authenticity Notice: Copy-paste used (${next}/2 allowed)`);
      setTimeout(() => setPasteWarningToast(null), 3500);
      return true;
    }
  };

  useEffect(() => {
    const onGlobalPaste = (e: ClipboardEvent) => {
      if (isInterviewEnded) return;
      if (pasteCountRef.current >= 2) {
        e.preventDefault();
        e.stopPropagation();
        setShowAntiCheatModal(true);
      }
    };

    document.addEventListener('paste', onGlobalPaste, true);
    return () => document.removeEventListener('paste', onGlobalPaste, true);
  }, [isInterviewEnded]);

  async function fetchInterviewApi(body: Record<string, unknown>) {
    const response = await fetch('/api/interview/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Interview API request failed');
    }

    return response.json();
  }

  useEffect(() => {
    let mounted = true;

    async function loadQuestions() {
      setIsGenerating(true);
      try {
        // 1. Check if questions already exist for this interview (e.g. on page reload/refresh)
        if (interviewId) {
          try {
            const existingRes = await fetch(`/api/interviews/${interviewId}/questions`);
            if (existingRes.ok) {
              const existingData = await existingRes.json();
              if (existingData?.questions && Array.isArray(existingData.questions) && existingData.questions.length > 0) {
                if (mounted) {
                  const mapped = existingData.questions.map((q: any) => ({
                    id: q.id,
                    text: q.question_text,
                    type: q.question_type,
                    difficulty: q.difficulty,
                    topic: q.topic,
                  }));
                  setQuestions(mapped);
                  setQuestionStartTime(Date.now());
                  setIsGenerating(false);

                  // Restore progress if questions were already answered/evaluated
                  const answered = existingData.questions.filter((q: any) => q.ai_evaluation && q.ai_evaluation.score !== undefined);
                  if (answered.length > 0) {
                    setAnswersCount(answered.length);
                    const totalSc = answered.reduce((acc: number, curr: any) => acc + (Number(curr.ai_evaluation.score) || 0), 0);
                    setTotalScore(totalSc);
                    setCurrentQIndex(Math.min(answered.length, mapped.length - 1));
                    setRecordedHistory(answered.map((q: any) => ({
                      question: {
                        id: q.id,
                        text: q.question_text,
                        type: q.question_type,
                        difficulty: q.difficulty,
                        topic: q.topic,
                      },
                      userAnswer: q.user_answer || '',
                      evaluation: q.ai_evaluation,
                    })));
                  }
                  return;
                }
              }
            }
          } catch (fetchErr) {
            console.warn('Could not fetch existing questions:', fetchErr);
          }
        }

        const targetTopic = interview?.target_role?.startsWith('Topic: ')
          ? interview.target_role.replace('Topic: ', '').trim()
          : (interview?.title?.startsWith('Targeted: ')
              ? interview.title.replace('Targeted: ', '').split('—')[0].split('[')[0].trim()
              : undefined);

        const data = await fetchInterviewApi({
          mode: 'generate',
          interviewType,
          difficulty,
          resumeContext,
          topic: targetTopic,
          count: 5,
        });

        if (mounted && Array.isArray(data.questions)) {
          setQuestions(data.questions as Question[]);
          setQuestionStartTime(Date.now());

          if (interviewId) {
            fetch(`/api/interviews/${interviewId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ questions: data.questions }),
            }).catch((err) => console.warn('Failed to pre-persist questions:', err));
          }
        }
      } catch (error) {
        console.error('Failed to generate questions:', error);
      } finally {
        if (mounted) setIsGenerating(false);
      }
    }

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, [interviewType, difficulty, resumeContext, interviewId]);

  const handleSubmitAnswer = async () => {
    if ((!textAnswer.trim() && !codeAnswer.trim()) || !questions[currentQIndex]) return;

    const q = questions[currentQIndex];
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
    const submittedAnswer = answerMode === 'code' ? codeAnswer : textAnswer;

    setIsEvaluating(true);
    setStreamingFeedback('');

    try {
      const res = await fetch(`/api/interviews/${interviewId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion: q,
          userAnswer: submittedAnswer,
          textAnswer,
          codeAnswer,
          answerType: answerMode,
          language: selectedLanguage,
          elapsedSeconds,
          sequence_order: currentQIndex,
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Evaluation request failed');
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalEvalResult: EvaluationResult | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.chunk) {
                setStreamingFeedback((prev) => prev + data.chunk);
              }
              if (data.done && data.evaluation) {
                finalEvalResult = data.evaluation;
              }
            } catch {}
          }
        }

        const rawEvalResult = (finalEvalResult && finalEvalResult.score !== undefined)
          ? finalEvalResult
          : evaluateTechnicalAnswer(q, submittedAnswer, { difficulty: q.difficulty, topic: q.topic });

        const evalResult: EvaluationResult = {
          ...rawEvalResult,
          feedback: cleanFeedbackText(rawEvalResult.feedback),
        };

        setEvaluation(evalResult);
        setTotalScore((prev) => prev + (evalResult?.score ?? 0));
        setAnswersCount((prev) => prev + 1);
        setMobileTab('coach');

        setRecordedHistory((prev) => [
          ...prev,
          {
            question: q,
            userAnswer: submittedAnswer,
            evaluation: evalResult,
          },
        ]);
        setStreamingFeedback('');
      } else {
        const result = await res.json().catch(() => ({}));
        const rawEval = (result.evaluation && result.evaluation.score !== undefined)
          ? (result.evaluation as EvaluationResult)
          : evaluateTechnicalAnswer(q, submittedAnswer, { difficulty: q.difficulty, topic: q.topic });
        const evalResult: EvaluationResult = {
          ...rawEval,
          feedback: cleanFeedbackText(rawEval.feedback),
        };
        setEvaluation(evalResult);
        setTotalScore((prev) => prev + (evalResult?.score ?? 0));
        setAnswersCount((prev) => prev + 1);
        setMobileTab('coach');

        setRecordedHistory((prev) => [
          ...prev,
          {
            question: q,
            userAnswer: submittedAnswer,
            evaluation: evalResult,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      const localEval = evaluateTechnicalAnswer(q, submittedAnswer, { difficulty: q.difficulty, topic: q.topic });
      const evalResult: EvaluationResult = {
        ...localEval,
        feedback: cleanFeedbackText(localEval.feedback),
      };
      setEvaluation(evalResult);
      setTotalScore((prev) => prev + (evalResult?.score ?? 0));
      setAnswersCount((prev) => prev + 1);
      setMobileTab('coach');

      setRecordedHistory((prev) => [
        ...prev,
        {
          question: q,
          userAnswer: submittedAnswer,
          evaluation: evalResult,
        },
      ]);
    } finally {
      setIsEvaluating(false);
      setStreamingFeedback('');
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setStreamingFeedback('');
    setTextAnswer('');
    setCodeAnswer('');
    setShowHint(false);
    setQuestionStartTime(Date.now());
    setCurrentQIndex((i) => Math.min(i + 1, questions.length - 1));
    setMobileTab('workspace');
  };

  const [finalOverallScore, setFinalOverallScore] = useState<number | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const handleEndInterview = async () => {
    setIsEnding(true);

    try {
      const totalElapsedSeconds = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));

      const res = await fetch(`/api/interviews/${interviewId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalize: true,
          questions: questions,
          recordedHistory: recordedHistory,
          elapsedSeconds: totalElapsedSeconds,
        }),
      });

      const evalData = await res.json().catch(() => null);

      let computedScore = answersCount > 0 ? Math.round(totalScore / answersCount) : 0;
      if (evalData?.overall_score !== undefined && evalData.overall_score !== null) {
        computedScore = evalData.overall_score;
      }
      setFinalOverallScore(computedScore);

      if (evalData?.questions && Array.isArray(evalData.questions)) {
        const mappedRecords: EvaluatedRecord[] = evalData.questions.map((q: any) => ({
          question: {
            id: q.id,
            text: q.question_text,
            type: q.question_type,
            difficulty: q.difficulty,
            topic: q.topic,
          },
          userAnswer: q.user_answer || '(No answer provided)',
          evaluation: q.ai_evaluation ? {
            ...q.ai_evaluation,
            feedback: cleanFeedbackText(q.ai_evaluation.feedback),
          } : {
            score: 0,
            feedback: 'No answer provided.',
            caveman_feedback: 'Bad: skipped question.',
          },
        }));

        const answeredRecords = mappedRecords.filter(
          (r) =>
            r.userAnswer &&
            r.userAnswer !== '(No answer provided)' &&
            !['na', 'none', 'idk', 'skip', 'pass', 'nil', 'null'].includes(
              r.userAnswer.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
            )
        );

        const mergedRecords = answeredRecords.length > 0 
          ? answeredRecords 
          : (recordedHistory.length > 0 ? recordedHistory : mappedRecords);

        setRecordedHistory(mergedRecords);
        setAnswersCount(answeredRecords.length > 0 ? answeredRecords.length : recordedHistory.length);
      }

      await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          duration_seconds: totalElapsedSeconds,
          overall_score: computedScore,
        }),
      });
    } catch (error) {
      console.error('Failed to end interview:', error);
    } finally {
      setIsEnding(false);
      setIsInterviewEnded(true);
    }
  };

  const currentQuestion = questions[currentQIndex];
  const progressPercent = questions.length > 0
    ? Math.round(((currentQIndex + (evaluation ? 1 : 0)) / questions.length) * 100)
    : 0;

  const currentAnswerText = answerMode === 'code' ? codeAnswer : textAnswer;
  const wordCount = currentAnswerText.trim() ? currentAnswerText.trim().split(/\s+/).length : 0;
  const charCount = currentAnswerText.length;

  // Dynamic AI State Calculation
  const aiStateText = isGenerating
    ? 'GENERATING_VECTORS'
    : isEvaluating
    ? 'EVALUATING_DEPTH'
    : answerMode === 'voice'
    ? 'SPEECH_ACTIVE'
    : 'STANDBY_READY';

  // -------------------------------------------------------------
  // RESULT SCREEN — Telemetry Scorecard
  // -------------------------------------------------------------
  if (isInterviewEnded) {
    const avgScore = finalOverallScore !== null ? finalOverallScore : (answersCount > 0 ? Math.round(totalScore / answersCount) : 0);
    const totalElapsedSeconds = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));
    const mins = Math.floor(totalElapsedSeconds / 60);
    const secs = totalElapsedSeconds % 60;

    return (
      <div className="relative min-h-screen w-full bg-[#F4F2EC] text-[#0A0A0A] flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-[#2447FF]/20 selection:text-black">
        <div className="relative z-10 w-full rounded-2xl border border-[#E5E3DC] bg-white text-[#0A0A0A] shadow-xl overflow-hidden my-auto">
          {/* Header Marker */}
          <div className="flex items-center justify-between px-6 sm:px-8 h-14 border-b border-[#EAE7DF] bg-[#F8F7F4] select-none">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
              <span className="font-mono text-xs text-[#5C5953] font-semibold tracking-wider uppercase">
                FINAL ASSESSMENT ARTIFACT // {interviewType.toUpperCase()}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#065f46] bg-[#34d399]/15 border border-[#34d399]/40 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              EVALUATION COMPLETE
            </span>
          </div>

          <div className="p-8 sm:p-12 space-y-10">
            {/* Visual Narrative Headline: Large Score + Signal Statement */}
            <div className="border-b border-[#EAE7DF] pb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#2447FF] font-semibold block mb-1">
                  EVALUATION RESULT
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="display-giant text-[#2447FF] font-bold leading-none">
                    {avgScore}
                  </span>
                  <span className="font-mono text-sm text-[#5C5953] uppercase tracking-wider">
                    INTERVIEW SIGNAL / 100
                  </span>
                </div>
                <h2 className="display-subhead text-[#0A0A0A] font-semibold mt-4">
                  {avgScore >= 80
                    ? 'Exceptional mastery across problem space and edge cases.'
                    : avgScore >= 65
                    ? 'Strong fundamentals. Actionable blindspots diagnosed.'
                    : 'Foundation developing. Revisit core architectural trade-offs.'}
                </h2>
                <p className="font-mono text-xs text-[#5C5953] uppercase tracking-wider mt-2">
                  {interview?.target_role || 'SOFTWARE ENGINEER'} · {difficulty.toUpperCase()} DIFFICULTY · {mins}m {secs}s
                </p>
              </div>
            </div>

            {/* Asymmetric Telemetry Summary */}
            <div className="grid grid-cols-3 gap-4 border-b border-[#EAE7DF] pb-8">
              <div>
                <span className="text-[10px] text-[#5C5953] font-mono uppercase tracking-wider block">QUESTIONS</span>
                <p className="text-2xl font-bold text-[#0A0A0A] font-mono mt-1">{questions.length || 5}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5C5953] font-mono uppercase tracking-wider block">COMPLETED</span>
                <p className="text-2xl font-bold text-[#16a34a] font-mono mt-1">{answersCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5C5953] font-mono uppercase tracking-wider block">PRACTICE TIME</span>
                <p className="text-2xl font-bold text-[#0A0A0A] font-mono mt-1">{mins}m {secs}s</p>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5953]">
                QUESTION EVALUATION LOG ({answersCount})
              </h2>

              {answersCount === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#DDD9CE] rounded-xl text-[#5C5953] text-xs font-mono space-y-1.5 bg-[#F8F7F4]">
                  <p className="text-[#0A0A0A] font-semibold">NO ANSWERS RECORDED</p>
                  <p className="text-[11px] text-[#5C5953]">Session was completed before submitting questions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recordedHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F8F7F4] border border-[#EAE7DF] rounded-xl p-5 space-y-3 hover:border-[#2447FF]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-[#EAE7DF] pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#2447FF] font-semibold">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-[#2447FF] border border-[#DDD9CE] uppercase font-semibold">
                              {item.question.topic || item.question.type}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#0A0A0A] leading-relaxed mt-1">
                            {item.question.text}
                          </p>
                        </div>
                        <span className="text-base font-bold font-mono text-[#065f46] shrink-0 bg-[#34d399]/20 border border-[#34d399]/40 px-2.5 py-1 rounded-lg">
                          {item.evaluation.score}%
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-[#444] leading-relaxed">
                          <strong className="text-[#0A0A0A] font-mono text-[11px] uppercase tracking-wider">Analysis: </strong>
                          {item.evaluation.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-[#EAE7DF]">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto rounded-xl border border-[#DDD9CE] hover:border-[#999] bg-black/5 hover:bg-black/10 text-[#0A0A0A] text-xs font-mono uppercase tracking-wider px-6 py-3 transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => router.push(interviewId ? `/dashboard/history/${interviewId}` : '/dashboard/history')}
                className="bg-[#2447FF] hover:bg-[#1a3ce8] text-white w-full sm:w-auto rounded-xl text-xs font-mono font-bold uppercase tracking-wider px-6 py-3 shadow-md transition-all cursor-pointer"
              >
                Inspect Telemetry Archive →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DEVELOPER COCKPIT
  // -------------------------------------------------------------
  return (
    <div className="relative h-screen max-h-screen w-full bg-[#02040a] text-[#f8fafc] flex flex-col overflow-hidden select-none font-sans">
      {/* HEADER */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-[#0D0D0D] px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
            <span className="font-display text-sm font-bold tracking-tight text-[#F4F2EC]">
              InterviewAI
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Question Index Pill */}
          <span className="text-xs font-mono text-[#8C8C88]">
            QUESTION {String(currentQIndex + 1).padStart(2, '0')} OF {String(questions.length || 5).padStart(2, '0')}
          </span>

          {/* AI State Pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#F4F2EC]">
            <span className={`w-1.5 h-1.5 rounded-full ${
              isEvaluating || isGenerating ? 'bg-[#2447FF] animate-ping' : answerMode === 'voice' ? 'bg-[#f43f5e] animate-pulse' : 'bg-[#34d399]'
            }`} />
            <span>
              {isGenerating ? 'Synthesizing Question' : isEvaluating ? 'Evaluating Solution' : answerMode === 'voice' ? 'Audio Stream Active' : 'Instrument Ready'}
            </span>
          </div>
        </div>

        {/* Timer and End Session */}
        <div className="flex items-center gap-4">
          <CountdownTimer startTime={interviewStartTime} onTimeUp={handleEndInterview} />

          <button
            onClick={() => setShowEndModal(true)}
            className="text-xs font-mono rounded-lg border border-white/10 bg-white/[0.03] text-[#8C8C88] hover:text-[#f43f5e] hover:border-[#f43f5e]/40 px-3.5 py-1.5 transition-colors uppercase tracking-wider cursor-pointer"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Electric Cobalt Progress Bar */}
      <div className="h-[2px] w-full bg-white/[0.05] shrink-0">
        <div
          className="h-full bg-[#2447FF] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center border-b border-white/10 bg-[#0D0D0D] shrink-0">
        <button
          onClick={() => setMobileTab('briefing')}
          className={`flex-1 py-2.5 text-center font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'briefing'
              ? 'text-white border-b-2 border-[#2447FF] bg-white/[0.04] font-semibold'
              : 'text-[#8C8C88] hover:text-white'
          }`}
        >
          <span>1. Question</span>
          {mobileTab === 'briefing' && <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF]" />}
        </button>
        <button
          onClick={() => setMobileTab('workspace')}
          className={`flex-1 py-2.5 text-center font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'workspace'
              ? 'text-white border-b-2 border-[#2447FF] bg-white/[0.04] font-semibold'
              : 'text-[#8C8C88] hover:text-white'
          }`}
        >
          <span>2. Workspace</span>
          {mobileTab === 'workspace' && <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />}
        </button>
        <button
          onClick={() => setMobileTab('coach')}
          className={`flex-1 py-2.5 text-center font-mono text-xs transition-colors flex items-center justify-center gap-1.5 relative cursor-pointer ${
            mobileTab === 'coach'
              ? 'text-white border-b-2 border-[#2447FF] bg-white/[0.04] font-semibold'
              : 'text-[#8C8C88] hover:text-white'
          }`}
        >
          <span>3. AI Evaluation</span>
          {evaluation && <span className="w-2 h-2 rounded-full bg-[#2447FF] animate-pulse" />}
        </button>
      </div>

      {/* 3-COLUMN COCKPIT BODY */}
      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[380px_1fr_320px] overflow-hidden bg-[#050505]">
        {/* ========================================================= */}
        {/* LEFT PANEL: Dominant Question Briefing Rail (w-[380px]) */}
        {/* ========================================================= */}
        <aside className={`${mobileTab === 'briefing' ? 'flex flex-1 min-h-0 w-full' : 'hidden'} lg:flex lg:w-[380px] border-r border-white/10 bg-[#0D0D0D] flex-col justify-between overflow-hidden select-text shrink-0`}>
          <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none shrink-0">
            <span className="font-mono text-xs text-[#8C8C88] font-semibold tracking-wider uppercase">
              CURRENT SCENARIO
            </span>
            <span className="font-mono text-xs text-[#2447FF] font-semibold">
              Q{String(currentQIndex + 1).padStart(2, '0')}/{String(questions.length || 5).padStart(2, '0')}
            </span>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C8C88]">
                QUESTION {String(currentQIndex + 1).padStart(2, '0')}
              </span>
              {currentQuestion?.topic && (
                <span className="text-[11px] font-mono font-medium text-[#2447FF] uppercase tracking-wide bg-[#2447FF]/10 border border-[#2447FF]/30 px-2.5 py-0.5 rounded-full">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            {/* Dominant Editorial Question Typography */}
            <div className="space-y-4">
              {isGenerating ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-full" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                  <p className="text-xs text-[#2447FF] font-mono mt-3">Synthesizing calibrated scenario...</p>
                </div>
              ) : (
                <h2 className="display-subhead text-xl sm:text-2xl text-[#F4F2EC] font-semibold leading-relaxed">
                  {currentQuestion?.text || 'Loading technical question...'}
                </h2>
              )}
            </div>

            {/* Strategy Hint */}
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-[#8C8C88] hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider bg-white/[0.03] border border-white/10 hover:border-white/25 px-4 py-2.5 rounded-xl w-full justify-between cursor-pointer"
              >
                <span>{showHint ? 'Hide Strategy Guidance' : 'View Strategy Guidance'}</span>
                <span className="text-[10px] text-[#8C8C88]">hint</span>
              </button>

              {showHint && (
                <div className="mt-3 p-4 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-[#F4F2EC]/90 leading-relaxed space-y-2 animate-in fade-in duration-150">
                  <p className="font-mono text-[11px] font-semibold text-[#2447FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2447FF]" />
                    APPROACH TIP
                  </p>
                  <p className="font-sans text-[#F4F2EC]/80 leading-relaxed">
                    {currentQuestion?.type === 'behavioral' || interviewType === 'behavioral'
                      ? 'Apply the STAR methodology. Clearly articulate your personal role, the friction encountered, and the measured outcome.'
                      : currentQuestion?.topic
                      ? `Focus on core principles of ${currentQuestion.topic}. State assumptions, Big-O bounds, and system edge cases upfront.`
                      : 'Outline your architectural approach first before coding. Address constraints and memory trade-offs.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Session Metrics Widget */}
          <div className="p-5 border-t border-white/10 bg-white/[0.02] space-y-2 shrink-0">
            <span className="text-[10px] text-[#8C8C88] font-mono uppercase tracking-widest block font-semibold">
              SESSION PROGRESS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#050505] border border-white/10 rounded-lg p-2.5">
                <span className="text-[9px] text-[#8C8C88] uppercase font-mono tracking-wider block">COMPLETED</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {String(answersCount).padStart(2, '0')} / {String(questions.length || 5).padStart(2, '0')}
                </p>
              </div>
              <div className="bg-[#050505] border border-white/10 rounded-lg p-2.5">
                <span className="text-[9px] text-[#8C8C88] uppercase font-mono tracking-wider block">ACCURACY</span>
                <p className="text-sm font-bold text-[#34d399] font-mono mt-0.5">
                  {answersCount > 0 ? `${Math.round(totalScore / answersCount)}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER PANEL: Answer Workspace (flex-1) */}
        {/* ========================================================= */}
        <main className={`${mobileTab === 'workspace' ? 'flex flex-1 min-h-0' : 'hidden'} lg:flex flex-col min-w-0 overflow-hidden bg-[#F4F2EC]`}>
          {/* Titlebar & Mode Switcher */}
          <div className="h-12 shrink-0 border-b border-[#E5E3DC] bg-[#FFFFFF] px-5 flex items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#5C5953] font-medium tracking-wide">
                WORKSPACE // {answerMode.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-[#EAE7DF] border border-[#DDD9CE] rounded-lg p-0.5">
                {(['text', 'code', 'voice'] as const).map((mode) => {
                  const isActive = answerMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setAnswerMode(mode)}
                      className={`px-3 py-1 text-[11px] font-mono font-medium transition-all rounded-md flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
                        isActive
                          ? 'bg-[#2447FF] text-white shadow-sm'
                          : 'text-[#5C5953] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      <span>{mode === 'text' ? 'TEXT BUFFER' : mode === 'code' ? 'MONACO IDE' : 'VOICE COCKPIT'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Selector in Code Mode */}
              {answerMode === 'code' && (
                <div className="flex items-center gap-1.5 ml-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-8 w-[115px] rounded-lg bg-white border-[#DDD9CE] text-[11px] font-mono text-[#0A0A0A] focus:ring-0">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#DDD9CE] text-[#0A0A0A] font-mono text-xs rounded-xl shadow-lg">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Active Canvas */}
          <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto flex flex-col select-text">
            {answerMode === 'text' && (
              <div className="flex-1 min-h-[300px] flex flex-col rounded-2xl border border-[#DDD9CE] bg-white focus-within:border-[#2447FF] shadow-sm overflow-hidden transition-colors">
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#EAE7DF] bg-[#F8F7F4]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C5953]">
                    STDIN // TEXT BUFFER
                  </span>
                  <span className="text-[10px] font-mono text-[#2447FF] font-semibold">EDITABLE</span>
                </div>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onPaste={(e) => {
                    if (!registerPasteAttempt(e)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Type your technical solution, algorithm design, or architectural trade-offs here..."
                  className="flex-1 w-full bg-transparent p-5 text-[#0A0A0A] font-mono text-sm leading-relaxed placeholder:text-[#8C8C88] resize-none focus:outline-none"
                />
              </div>
            )}

            {answerMode === 'code' && (
              <div className="flex-1 min-h-[340px] rounded-2xl border border-[#DDD9CE] overflow-hidden bg-white flex flex-col shadow-sm">
                <div className="h-8 shrink-0 bg-[#F8F7F4] border-b border-[#EAE7DF] px-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C5953]">
                    MONACO RUNTIME // {selectedLanguage.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#065f46] font-semibold">AST ACTIVE</span>
                </div>
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    theme="vs"
                    value={codeAnswer}
                    onChange={(val) => setCodeAnswer(val || '')}
                    onMount={(editor, monaco) => {
                      editor.onKeyDown((e) => {
                        if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) {
                          if (pasteCountRef.current >= 2) {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAntiCheatModal(true);
                          }
                        }
                      });
                      editor.onDidPaste(() => {
                        if (pasteCountRef.current >= 2) {
                          setShowAntiCheatModal(true);
                        } else {
                          registerPasteAttempt();
                        }
                      });
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'var(--font-mono), monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                      padding: { top: 14, bottom: 14 },
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full text-xs text-[#5C5953] font-mono animate-pulse">
                        LOADING MONACO IDE...
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {answerMode === 'voice' && (
              <div className="flex-1 min-h-[300px] flex flex-col space-y-4">
                <div className="bg-white border border-[#DDD9CE] rounded-2xl p-5 text-center shadow-sm">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C5953] block mb-3">
                    REAL-TIME VOICE COCKPIT
                  </span>
                  <VoiceRecorder
                    transcript={textAnswer}
                    onTranscript={(text) => setTextAnswer(text)}
                  />
                </div>

                <div className="flex-1 flex flex-col bg-white border border-[#DDD9CE] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-2.5 border-b border-[#EAE7DF] bg-[#F8F7F4]">
                    <span className="text-[10px] text-[#5C5953] font-mono uppercase tracking-widest">
                      TRANSCRIPT BUFFER (EDITABLE)
                    </span>
                  </div>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onPaste={(e) => {
                      if (!registerPasteAttempt(e)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Your spoken words will transcribe here in real-time. You can refine or edit before submitting..."
                    className="flex-1 w-full bg-transparent p-5 text-[#0A0A0A] font-mono text-sm leading-relaxed placeholder:text-[#8C8C88] resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="min-h-14 py-2.5 shrink-0 border-t border-[#E5E3DC] bg-[#FFFFFF] px-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-[#5C5953] font-mono">
              {wordCount} WORDS · {charCount} CHARS
            </div>

            <div className="flex items-center gap-3">
              {!evaluation ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || (!textAnswer.trim() && !codeAnswer.trim())}
                  className="bg-[#2447FF] hover:bg-[#1a3ce8] text-white rounded-xl font-mono text-xs font-semibold uppercase tracking-wider px-6 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                >
                  {isEvaluating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      EVALUATING SOLUTION...
                    </span>
                  ) : (
                    'SUBMIT FOR SCORING →'
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {currentQIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-[#2447FF] hover:bg-[#1a3ce8] text-white rounded-xl font-mono text-xs font-semibold uppercase tracking-wider px-6 py-2.5 transition-all shadow-md cursor-pointer"
                    >
                      NEXT QUESTION →
                    </button>
                  ) : (
                    <button
                      onClick={handleEndInterview}
                      className="bg-[#2447FF] hover:bg-[#1a3ce8] text-white rounded-xl font-mono text-xs font-semibold uppercase tracking-wider px-6 py-2.5 transition-all shadow-md cursor-pointer"
                    >
                      COMPLETE INTERVIEW →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT PANEL: AI Coach Live Evaluation Console (Electric Blue) */}
        {/* ========================================================= */}
        <aside className={`${mobileTab === 'coach' ? 'flex flex-1 min-h-0 w-full' : 'hidden'} lg:flex lg:w-[320px] border-l border-[#1A3AE8] bg-[#2447FF] text-white flex-col justify-between overflow-hidden select-text shrink-0 shadow-2xl`}>
          <div className="flex items-center justify-between px-5 h-12 border-b border-white/20 bg-[#1A3AE8] select-none shrink-0">
            <span className="font-mono text-[11px] text-white font-semibold tracking-wider uppercase">
              AI COACH EVALUATION
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-white bg-white/20 border border-white/30 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {isEvaluating ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white font-mono text-[11px] uppercase tracking-wider font-semibold">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Evaluating Technical Depth...</span>
                </div>

                {streamingFeedback ? (
                  <div className="bg-[#1A3AE8] border border-white/25 rounded-xl p-4 font-mono text-xs text-white leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap">
                    {streamingFeedback}
                    <span className="inline-block w-1.5 h-3.5 bg-white animate-pulse ml-1 align-middle" />
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-9 h-9 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <p className="text-xs font-mono font-medium text-white uppercase tracking-wider">SCORING_BUFFER...</p>
                  </div>
                )}
              </div>
            ) : evaluation ? (
              <div className="space-y-5">
                {/* Score Ring Header */}
                <div className="flex items-center justify-between bg-[#1A3AE8] border border-white/25 rounded-xl p-4 shadow-sm text-white">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 block">SCORE</span>
                    <p className="text-2xl font-bold font-mono text-white leading-none mt-1">
                      {evaluation.score} <span className="text-xs text-white/70">/ 100</span>
                    </p>
                  </div>
                  <ScoreRing score={evaluation.score} />
                </div>

                {/* Sub-Score Progress Bars */}
                <div className="space-y-3 bg-[#1A3AE8] border border-white/25 rounded-xl p-4 text-white">
                  <MiniBar
                    label="TECHNICAL ACCURACY"
                    value={evaluation.technicalAccuracyScore ?? Math.min(100, Math.round(evaluation.score * 1.02))}
                  />
                  <MiniBar
                    label="STRUCTURE & CLARITY"
                    value={evaluation.structureClarityScore ?? Math.min(100, Math.max(20, Math.round(evaluation.score * 0.95)))}
                  />
                  <MiniBar
                    label="DEPTH & EDGE CASES"
                    value={evaluation.depthEdgeCasesScore ?? Math.min(100, Math.max(20, Math.round(evaluation.score * 0.92)))}
                  />
                </div>

                {/* CAVEMAN LIVE FEEDBACK */}
                <div className="bg-white text-[#0A0A0A] rounded-xl p-4 shadow-lg border border-white/40 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#2447FF] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF] animate-ping" />
                    ⚡ CAVEMAN TAKE (QUICK EVAL)
                  </span>
                  <p className="font-mono text-xs text-[#0A0A0A] font-bold leading-snug">
                    {evaluation.caveman_feedback || evaluation.feedback}
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-white/80 font-mono uppercase tracking-wider block font-semibold">
                    DETAILED ANALYSIS
                  </span>
                  <p className="text-xs text-white/95 leading-relaxed font-sans bg-[#1A3AE8] border border-white/25 rounded-xl p-3.5">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Improvements */}
                {(evaluation.improvements || evaluation.improvement) && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-white font-mono uppercase tracking-wider block font-semibold">
                      ACTIONABLE REMEDIATIONS
                    </span>
                    <div className="bg-[#1A3AE8] border border-white/25 rounded-xl p-3.5 text-white">
                      {parseSuggestions(evaluation.improvements || evaluation.improvement).length > 1 ? (
                        <ul className="space-y-2 text-xs text-white/95 font-sans">
                          {parseSuggestions(evaluation.improvements || evaluation.improvement).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-white font-mono text-[10px] mt-0.5 shrink-0">►</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-white/95 leading-relaxed font-sans">
                          {evaluation.improvements || evaluation.improvement}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Idle State */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <Terminal className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-semibold text-white uppercase tracking-wider">AWAITING_SUBMISSION</p>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans max-w-[200px]">
                    Submit your solution to generate instant multi-vector scoring.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* END CONFIRM MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] w-[420px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
              <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
                TERMINATE SESSION CONFIRMATION
              </span>
              <span className="font-mono text-[10px] text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                ALERT
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#f43f5e] font-mono text-xs font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>TERMINATE ASSESSMENT EARLY?</span>
              </div>

              <p className="text-xs text-[#8C8C88] leading-relaxed font-sans">
                You have completed <strong className="text-[#34d399] font-mono">{answersCount}</strong> of{' '}
                <strong className="text-white font-mono">{questions.length || 5}</strong> questions.
                Ending now will compute your score report based on submitted answers.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-[#8C8C88] hover:text-white text-xs font-mono uppercase px-4 py-2.5 transition-colors cursor-pointer"
                >
                  Continue Answering
                </button>
                <button
                  onClick={() => {
                    setShowEndModal(false);
                    handleEndInterview();
                  }}
                  className="rounded-xl bg-[#f43f5e] hover:bg-[#e11d48] text-white text-xs font-mono font-bold uppercase px-4 py-2.5 transition-all shadow-md cursor-pointer"
                >
                  End & View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy-Paste Toast Warning */}
      {pasteWarningToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[115] bg-[#060b18] border border-[#2563eb] text-[#f8fafc] font-mono text-xs px-4 py-2 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center gap-2 select-none animate-bounce">
          <Zap className="h-3.5 w-3.5 text-[#3b82f6]" />
          <span>{pasteWarningToast}</span>
        </div>
      )}

      {/* Anti-Cheat Modal Warning */}
      <AntiCheatModal
        isOpen={showAntiCheatModal}
        onClose={() => setShowAntiCheatModal(false)}
        pasteCount={pasteCount}
      />
    </div>
  );
}
