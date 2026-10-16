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
  Loader2,
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
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={5}
        />
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke={clampedScore >= 75 ? '#15846e' : '#8052ff'}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: clampedScore >= 75 ? 'drop-shadow(0 0 6px rgba(21,132,110,0.5))' : 'drop-shadow(0 0 6px rgba(128,82,255,0.5))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-mono font-bold text-lg leading-none tracking-tight">
          {clampedScore}
        </span>
        <span className="text-[8px] text-zinc-400 font-mono mt-0.5 uppercase tracking-widest">
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
        <span className="text-zinc-400 uppercase tracking-wider">{label}</span>
        <span className="text-white font-semibold">{clamped}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#8052ff] shadow-[0_0_8px_rgba(128,82,255,0.6)] transition-all duration-500"
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
    <div className="flex items-center justify-center gap-1.5 h-12 px-5 bg-[#000000] border border-white/10 rounded-full w-full max-w-sm mx-auto shadow-inner">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            isActive ? 'bg-gradient-to-t from-[#8052ff] to-[#a882ff]' : 'bg-white/10'
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
 * Web Speech API Type Declarations
 */
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [altIndex: number]: {
        transcript: string;
        confidence?: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

type VoiceState = 'ready' | 'listening' | 'processing' | 'blocked' | 'unsupported' | 'error';

/**
 * Voice Recording Component — Enterprise Web Speech State Machine
 */
function VoiceRecorder({
  transcript,
  onTranscript,
}: {
  transcript: string;
  onTranscript: (text: string) => void;
}) {
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRecordingRef = useRef(false);

  // Buffer management to prevent duplicate transcriptions
  const baseTextRef = useRef(transcript);
  const sessionFinalRef = useRef('');

  useEffect(() => {
    if (!isRecordingRef.current) {
      baseTextRef.current = transcript;
    }
  }, [transcript]);

  // Initial browser support check
  useEffect(() => {
    const SpeechClass = getSpeechRecognitionConstructor();
    if (!SpeechClass) {
      setVoiceState('unsupported');
      setStatusMessage('Voice capture is not supported in this browser. Please use Chrome, Edge, or Brave, or type below.');
    }
  }, []);

  const initRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechClass = getSpeechRecognitionConstructor();
    if (!SpeechClass) return null;

    const recognition = new SpeechClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 2;

    recognition.onstart = () => {
      isRecordingRef.current = true;
      setVoiceState('listening');
      setStatusMessage('Listening... Speak your technical explanation clearly.');
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        // Auto-reconnect on silence timeout without duplicating finalized text
        baseTextRef.current = (
          (baseTextRef.current ? baseTextRef.current.trim() + ' ' : '') + sessionFinalRef.current.trim()
        ).trim();
        sessionFinalRef.current = '';
        try {
          recognition.start();
        } catch {
          isRecordingRef.current = false;
          setVoiceState('ready');
          setStatusMessage('Voice capture ready.');
        }
      } else {
        setVoiceState('ready');
        setStatusMessage('Voice capture ready.');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.warn('[SpeechRecognition] error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isRecordingRef.current = false;
        setVoiceState('blocked');
        setStatusMessage('Microphone access blocked. Click the lock icon in your browser URL bar to allow microphone access.');
      } else if (event.error === 'no-speech') {
        // Harmless silence timeout, ignore
      } else if (event.error === 'network' || event.error === 'audio-capture') {
        isRecordingRef.current = false;
        setVoiceState('error');
        setStatusMessage(`Audio stream error (${event.error}). Click 'Try Again' or use keyboard input.`);
      } else {
        isRecordingRef.current = false;
        setVoiceState('error');
        setStatusMessage(`Speech error (${event.error}). Click 'Try Again' to retry.`);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let newlyFinalized = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const phrase = result[0]?.transcript || '';
          if (phrase.trim()) {
            newlyFinalized += (newlyFinalized ? ' ' : '') + phrase.trim();
          }
        } else {
          interim += (interim ? ' ' : '') + (result[0]?.transcript || '').trim();
        }
      }

      if (newlyFinalized) {
        sessionFinalRef.current = (
          (sessionFinalRef.current ? sessionFinalRef.current.trim() + ' ' : '') + newlyFinalized.trim()
        ).trim();
      }

      const activeComposed = (
        (baseTextRef.current ? baseTextRef.current.trim() + ' ' : '') +
        (sessionFinalRef.current ? sessionFinalRef.current.trim() + ' ' : '') +
        interim.trim()
      ).trim();

      onTranscript(activeComposed);
    };

    recognitionRef.current = recognition;
    return recognition;
  };

  const startListening = async () => {
    setStatusMessage('');
    setVoiceState('processing');

    // 1. Microphone Hardware & Permission Pre-flight Check
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (mediaErr: unknown) {
        const errStr = mediaErr instanceof Error ? mediaErr.name : String(mediaErr);
        if (errStr === 'NotAllowedError' || errStr === 'PermissionDeniedError') {
          setVoiceState('blocked');
          setStatusMessage('Microphone access blocked. Click the lock icon in your browser URL bar to allow microphone access.');
          return;
        } else if (errStr === 'NotFoundError' || errStr === 'DevicesNotFoundError') {
          setVoiceState('error');
          setStatusMessage('No microphone detected. Connect a microphone or type your response below.');
          return;
        }
      }
    }

    // 2. Initialize and Start Web Speech
    const recognition = initRecognition();
    if (!recognition) {
      setVoiceState('unsupported');
      setStatusMessage('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Brave.');
      return;
    }

    baseTextRef.current = transcript;
    sessionFinalRef.current = '';
    isRecordingRef.current = true;

    try {
      recognition.start();
    } catch {
      try {
        recognition.stop();
        setTimeout(() => {
          recognition.start();
        }, 150);
      } catch {
        setVoiceState('error');
        setStatusMessage('Could not start speech recognition. Click Try Again.');
      }
    }
  };

  const stopListening = () => {
    isRecordingRef.current = false;
    setVoiceState('ready');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    baseTextRef.current = (
      (baseTextRef.current ? baseTextRef.current.trim() + ' ' : '') + sessionFinalRef.current.trim()
    ).trim();
    sessionFinalRef.current = '';
  };

  const clearTranscript = () => {
    baseTextRef.current = '';
    sessionFinalRef.current = '';
    onTranscript('');
    if (isRecordingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      isRecordingRef.current = false;
      setVoiceState('ready');
    }
  };

  // Clean unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const isListening = voiceState === 'listening';
  const isBlocked = voiceState === 'blocked';
  const isError = voiceState === 'error';
  const isUnsupported = voiceState === 'unsupported';
  const isProcessing = voiceState === 'processing';

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-3">
      {/* 22-bar Frequency Visualizer */}
      <VoiceWaveform isActive={isListening} />

      {/* Reactive State Pill Indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isListening
              ? 'bg-[#f43f5e] shadow-[0_0_8px_#f43f5e] animate-ping'
              : isProcessing
              ? 'bg-[#ffb829] shadow-[0_0_8px_#ffb829] animate-pulse'
              : isBlocked || isError
              ? 'bg-[#f43f5e]'
              : 'bg-[#15846e] shadow-[0_0_8px_#15846e]'
          }`}
        />
        <span
          className={`font-mono text-[11px] uppercase tracking-wider font-semibold px-3 py-0.5 rounded-full border ${
            isListening
              ? 'bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30'
              : isProcessing
              ? 'bg-[#ffb829]/10 text-[#ffb829] border-[#ffb829]/30'
              : isBlocked
              ? 'bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30'
              : isError
              ? 'bg-[#ffb829]/10 text-[#ffb829] border-[#ffb829]/30'
              : isUnsupported
              ? 'bg-white/[0.04] text-zinc-400 border-white/10'
              : 'bg-[#15846e]/10 text-[#15846e] border-[#15846e]/30'
          }`}
        >
          {isListening
            ? 'LISTENING'
            : isProcessing
            ? 'PROCESSING'
            : isBlocked
            ? 'MICROPHONE BLOCKED'
            : isError
            ? 'TRY AGAIN'
            : isUnsupported
            ? 'BROWSER UNSUPPORTED'
            : 'READY'}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {isBlocked ? (
          <button
            type="button"
            onClick={startListening}
            className="btn-dala-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(128,82,255,0.4)]"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>ALLOW MIC & RETRY</span>
          </button>
        ) : isError ? (
          <button
            type="button"
            onClick={startListening}
            className="btn-dala-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(128,82,255,0.4)]"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>TRY AGAIN</span>
          </button>
        ) : isListening ? (
          <button
            type="button"
            onClick={stopListening}
            className="px-6 py-2.5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer bg-[#f43f5e] text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>STOP RECORDING</span>
          </button>
        ) : isUnsupported ? (
          <span className="text-xs font-mono text-zinc-400">
            Please use keyboard text buffer below.
          </span>
        ) : (
          <button
            type="button"
            onClick={startListening}
            disabled={isProcessing}
            className="btn-dala-primary px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>START VOICE CAPTURE</span>
          </button>
        )}

        {transcript && (
          <button
            type="button"
            onClick={clearTranscript}
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 cursor-pointer uppercase tracking-wider"
          >
            RESET BUFFER
          </button>
        )}
      </div>

      {/* Helpful Status / Error Guidance */}
      {statusMessage && (
        <p className="text-xs text-zinc-400 font-mono text-center max-w-md leading-relaxed px-4 pt-1">
          {statusMessage}
        </p>
      )}

      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
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
  const [isInterviewEnded, setIsInterviewEnded] = useState(() => interview?.status === 'completed');
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

  // Probing State for Conversational Follow-up Turns
  const [activeProbe, setActiveProbe] = useState<{
    acknowledgment: string;
    probeText: string;
  } | null>(null);
  const [primaryAnswerSaved, setPrimaryAnswerSaved] = useState('');
  const [isProbing, setIsProbing] = useState(false);

  // Restore draft on question change or initial mount
  useEffect(() => {
    if (!interviewId || isInterviewEnded) return;
    const draftKey = `interviewai_draft_${interviewId}_${currentQIndex}`;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.textAnswer) setTextAnswer(parsed.textAnswer);
        if (parsed.codeAnswer) setCodeAnswer(parsed.codeAnswer);
        if (parsed.answerMode) setAnswerMode(parsed.answerMode);
        if (parsed.activeProbe) setActiveProbe(parsed.activeProbe);
        if (parsed.primaryAnswerSaved) setPrimaryAnswerSaved(parsed.primaryAnswerSaved);
      }
    } catch {}
  }, [interviewId, currentQIndex, isInterviewEnded]);

  // Auto-save draft on input change
  useEffect(() => {
    if (!interviewId || isInterviewEnded) return;
    const draftKey = `interviewai_draft_${interviewId}_${currentQIndex}`;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          textAnswer,
          codeAnswer,
          answerMode,
          activeProbe,
          primaryAnswerSaved,
        })
      );
    } catch {}
  }, [interviewId, currentQIndex, textAnswer, codeAnswer, answerMode, activeProbe, primaryAnswerSaved, isInterviewEnded]);

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

        let resolvedTopic = interview?.target_role || profile?.target_role || undefined;
        if (interview?.title?.startsWith('Targeted: ')) {
          const raw = interview.title.replace('Targeted: ', '').split('—')[0].split('[')[0].trim();
          resolvedTopic = raw.replace(/^Topic:\s*/i, '').trim() || resolvedTopic;
        } else if (interview?.target_role?.startsWith('Topic: ')) {
          resolvedTopic = interview.target_role.replace(/^Topic:\s*/i, '').trim();
        }

        const data = await fetchInterviewApi({
          mode: 'generate',
          interviewType,
          difficulty,
          resumeContext,
          topic: resolvedTopic,
          targetRole: profile?.target_role || interview?.target_role || resolvedTopic,
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

  const handlePrimarySubmitOrProbe = async (skipProbe = false) => {
    if ((!textAnswer.trim() && !codeAnswer.trim()) || !questions[currentQIndex]) return;

    const q = questions[currentQIndex];
    const submittedAnswer = answerMode === 'code' ? codeAnswer : textAnswer;

    // Turn 1: If no active probe yet, synthesize conversational follow-up probe!
    if (!activeProbe && !skipProbe) {
      setIsProbing(true);
      setPrimaryAnswerSaved(submittedAnswer);

      try {
        const probeRes = await fetchInterviewApi({
          mode: 'probe',
          question: q,
          textAnswer: submittedAnswer,
          difficulty,
          targetRole: interview?.target_role || profile?.target_role || 'Software Engineer',
        });

        if (probeRes?.probe) {
          setActiveProbe({
            acknowledgment: probeRes.acknowledgment || 'Got it.',
            probeText: probeRes.probe,
          });
          // Clear current input buffer so candidate can formulate follow-up response
          setTextAnswer('');
          setCodeAnswer('');
          setIsProbing(false);
          return;
        }
      } catch (probeErr) {
        console.warn('Probe generation error, executing direct evaluation:', probeErr);
      } finally {
        setIsProbing(false);
      }
    }

    // Turn 2: Follow-up response provided, or probe skipped!
    const finalAnswer = activeProbe
      ? `Initial Approach:\n${primaryAnswerSaved}\n\nAdaptive Follow-up Probe: "${activeProbe.probeText}"\nCandidate Response:\n${submittedAnswer}`
      : submittedAnswer;

    await executeEvaluation(finalAnswer);
  };

  const executeEvaluation = async (submittedAnswer: string) => {
    const q = questions[currentQIndex];
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));

    setIsEvaluating(true);
    setStreamingFeedback('');

    try {
      const res = await fetch(`/api/interviews/${interviewId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion: q,
          userAnswer: submittedAnswer,
          textAnswer: primaryAnswerSaved ? `${primaryAnswerSaved}\n\n${textAnswer}` : textAnswer,
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

      // Clear draft once evaluation completes
      if (interviewId) {
        try {
          localStorage.removeItem(`interviewai_draft_${interviewId}_${currentQIndex}`);
        } catch {}
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
    if (interviewId) {
      try {
        localStorage.removeItem(`interviewai_draft_${interviewId}_${currentQIndex}`);
      } catch {}
    }
    setEvaluation(null);
    setActiveProbe(null);
    setPrimaryAnswerSaved('');
    setStreamingFeedback('');
    setTextAnswer('');
    setCodeAnswer('');
    setShowHint(false);
    setQuestionStartTime(Date.now());
    setCurrentQIndex((i) => Math.min(i + 1, questions.length - 1));
    setMobileTab('workspace');
  };


  const [finalOverallScore, setFinalOverallScore] = useState<number | null>(() => interview?.overall_score ?? null);
  const [isEnding, setIsEnding] = useState(false);

  const handleEndInterview = async () => {
    setIsEnding(true);

    try {
      const totalElapsedSeconds = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`/api/interviews/${interviewId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          finalize: true,
          questions: questions,
          recordedHistory: recordedHistory,
          elapsedSeconds: totalElapsedSeconds,
        }),
      }).catch((err) => {
        console.warn('Evaluate request timeout or network error:', err);
        return null;
      });

      clearTimeout(timeoutId);

      const evalData = res && res.ok ? await res.json().catch(() => null) : null;

      let recordsToUse = recordedHistory;

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

        recordsToUse = answeredRecords.length > 0 
          ? answeredRecords 
          : (recordedHistory.length > 0 ? recordedHistory : mappedRecords);

        setRecordedHistory(recordsToUse);
        setAnswersCount(recordsToUse.length);
      }

      // Compute consistent average score from actual evaluated records
      const validRecordScores = recordsToUse
        .map((r) => Number(r.evaluation?.score))
        .filter((s) => !isNaN(s) && s > 0);

      const recordsAverage = validRecordScores.length > 0
        ? Math.round(validRecordScores.reduce((sum, s) => sum + s, 0) / validRecordScores.length)
        : (answersCount > 0 ? Math.round(totalScore / answersCount) : 0);

      const computedScore = (evalData?.overall_score !== undefined && evalData.overall_score !== null && evalData.overall_score > 0)
        ? evalData.overall_score
        : recordsAverage;

      setFinalOverallScore(computedScore);

      await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          duration_seconds: totalElapsedSeconds,
          overall_score: computedScore,
          completed_at: new Date().toISOString(),
        }),
      }).catch((err) => console.warn('Failed to update interview status:', err));
    } catch (error) {
      console.error('Failed to end interview:', error);
    } finally {
      setIsEnding(false);
      setShowEndModal(false);
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
    const historyScores = recordedHistory
      .map((r) => Number(r.evaluation?.score))
      .filter((s) => !isNaN(s));

    const historyAvg = historyScores.length > 0
      ? Math.round(historyScores.reduce((sum, s) => sum + s, 0) / historyScores.length)
      : (answersCount > 0 ? Math.round(totalScore / answersCount) : 0);

    const avgScore = (finalOverallScore !== null && finalOverallScore > 0)
      ? finalOverallScore
      : (historyAvg > 0 ? historyAvg : (finalOverallScore ?? 0));
    const totalElapsedSeconds = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));
    const mins = Math.floor(totalElapsedSeconds / 60);
    const secs = totalElapsedSeconds % 60;

    return (
      <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto font-sans selection:bg-[#8052ff]/30 selection:text-white">
        {/* Subtle Ambient Electric Iris Glow */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-[#8052ff] opacity-[0.06] blur-[160px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl text-white shadow-[0_30px_90px_rgba(0,0,0,0.5)] overflow-hidden my-auto">
          {/* Header Marker */}
          <div className="flex items-center justify-between px-6 sm:px-8 h-16 border-b border-white/10 bg-white/[0.02] select-none">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
              <span className="font-mono text-xs text-zinc-400 font-medium tracking-[0.16em] uppercase">
                FINAL ASSESSMENT ARTIFACT // {interviewType.toUpperCase()}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#15846e] bg-[#15846e]/10 border border-[#15846e]/30 px-3.5 py-1 rounded-full uppercase tracking-wider font-semibold">
              EVALUATION COMPLETE
            </span>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 space-y-10">
            {/* Visual Narrative Headline: Large Score + Signal Statement */}
            <div className="border-b border-white/10 pb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb829]" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#ffb829]">
                    EVALUATION RESULT
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-7xl sm:text-8xl lg:text-9xl font-normal tracking-[-0.04em] text-white leading-none">
                    {avgScore}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-zinc-400 uppercase tracking-wider">
                    INTERVIEW SIGNAL / 100
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-normal mt-4 leading-snug tracking-[-0.02em]">
                  {avgScore >= 80
                    ? 'Exceptional mastery across problem space and edge cases.'
                    : avgScore >= 65
                    ? 'Strong fundamentals. Actionable blindspots diagnosed.'
                    : 'Foundation developing. Revisit core architectural trade-offs.'}
                </h2>
                <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider mt-2">
                  {interview?.target_role || 'SOFTWARE ENGINEER'} · {difficulty.toUpperCase()} DIFFICULTY · {mins}m {secs}s
                </p>
              </div>
            </div>

            {/* Asymmetric Telemetry Summary */}
            <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-8">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">QUESTIONS</span>
                <p className="font-display text-2xl sm:text-3xl font-normal text-white mt-1">{questions.length || 5}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">COMPLETED</span>
                <p className="font-display text-2xl sm:text-3xl font-normal text-[#15846e] mt-1">{answersCount}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">PRACTICE TIME</span>
                <p className="font-display text-2xl sm:text-3xl font-normal text-white mt-1">{mins}m {secs}s</p>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                QUESTION EVALUATION LOG ({answersCount})
              </h2>

              {answersCount === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-zinc-400 text-xs font-mono space-y-1.5 bg-white/[0.01]">
                  <p className="text-white font-medium">NO ANSWERS RECORDED</p>
                  <p className="text-[11px] text-zinc-400">Session was completed before submitting questions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recordedHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#8052ff] font-semibold">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#8052ff]/10 text-[#8052ff] border border-[#8052ff]/30 uppercase font-semibold">
                              {item.question.topic || item.question.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white leading-relaxed mt-1 font-sans">
                            {item.question.text}
                          </p>
                        </div>
                        <span className="text-sm font-medium font-mono text-[#15846e] shrink-0 bg-[#15846e]/10 border border-[#15846e]/30 px-3 py-1 rounded-full">
                          {item.evaluation.score}%
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-zinc-400 leading-relaxed font-sans font-light">
                          <strong className="text-white font-mono text-[11px] uppercase tracking-wider font-medium">Analysis: </strong>
                          {item.evaluation.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-dala-secondary w-full sm:w-auto px-6 py-2.5 cursor-pointer font-mono text-xs uppercase tracking-wider"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => router.push('/dashboard/roadmap')}
                  className="btn-dala-secondary w-full sm:w-auto px-6 py-2.5 cursor-pointer font-mono text-xs uppercase tracking-wider text-[#8052ff] hover:text-white"
                >
                  Mastery Roadmap
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => router.push(`/interview/new?role=${encodeURIComponent(interview?.target_role || '')}&type=${interviewType}&difficulty=${difficulty}&retry=true`)}
                  className="btn-dala-primary inline-flex items-center justify-center gap-2 text-white w-full sm:w-auto px-6 py-2.5 cursor-pointer font-mono text-xs uppercase tracking-wider"
                >
                  <span>1-Click Targeted Re-Test</span>
                  <span>⚡</span>
                </button>
                <button
                  onClick={() => router.push(interviewId ? `/dashboard/history/${interviewId}` : '/dashboard/history')}
                  className="btn-dala-secondary inline-flex items-center justify-center gap-2 text-zinc-300 hover:text-white w-full sm:w-auto px-6 py-2.5 cursor-pointer font-mono text-xs uppercase tracking-wider"
                >
                  <span>Telemetry Archive</span>
                  <span>→</span>
                </button>
              </div>
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
    <div className="relative h-screen max-h-screen w-full bg-[#000000] text-white flex flex-col overflow-hidden select-none font-sans">
      {/* HEADER */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-[#000000]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
            <span className="font-sans text-sm font-semibold tracking-tight text-white">
              Interview<span className="text-[#8052ff]">AI</span>
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Question Index Pill */}
          <span className="text-xs font-mono text-zinc-400">
            QUESTION {String(currentQIndex + 1).padStart(2, '0')} OF {String(questions.length || 5).padStart(2, '0')}
          </span>

          {/* AI State Pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-white">
            <span className={`w-1.5 h-1.5 rounded-full ${
              isEvaluating || isGenerating ? 'bg-[#8052ff] animate-ping' : answerMode === 'voice' ? 'bg-[#ffb829] animate-pulse' : 'bg-[#15846e]'
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
            className="text-xs font-mono rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-[#f43f5e] hover:border-[#f43f5e]/40 px-4 py-1.5 transition-colors uppercase tracking-wider cursor-pointer"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Electric Iris Progress Bar */}
      <div className="h-[2px] w-full bg-white/[0.05] shrink-0">
        <div
          className="h-full bg-[#8052ff] shadow-[0_0_12px_rgba(128,82,255,0.8)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center border-b border-white/10 bg-[#000000] shrink-0">
        <button
          onClick={() => setMobileTab('briefing')}
          className={`flex-1 py-2.5 text-center font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'briefing'
              ? 'text-white border-b-2 border-[#8052ff] bg-white/[0.04] font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>1. Question</span>
          {mobileTab === 'briefing' && <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff]" />}
        </button>
        <button
          onClick={() => setMobileTab('workspace')}
          className={`flex-1 py-2.5 text-center font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'workspace'
              ? 'text-white border-b-2 border-[#8052ff] bg-white/[0.04] font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>2. Workspace</span>
          {mobileTab === 'workspace' && <span className="w-1.5 h-1.5 rounded-full bg-[#15846e]" />}
        </button>
        <button
          onClick={() => setMobileTab('coach')}
          className={`flex-1 py-2.5 text-center font-mono text-xs transition-colors flex items-center justify-center gap-1.5 relative cursor-pointer ${
            mobileTab === 'coach'
              ? 'text-white border-b-2 border-[#8052ff] bg-white/[0.04] font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>3. AI Evaluation</span>
          {evaluation && <span className="w-2 h-2 rounded-full bg-[#8052ff] animate-pulse" />}
        </button>
      </div>

      {/* 3-COLUMN COCKPIT BODY */}
      <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[380px_1fr_320px] overflow-hidden bg-[#000000]">
        {/* ========================================================= */}
        {/* LEFT PANEL: Dominant Question Briefing Rail (w-[380px]) */}
        {/* ========================================================= */}
        <aside className={`${mobileTab === 'briefing' ? 'flex flex-1 min-h-0 w-full' : 'hidden'} lg:flex lg:w-[380px] border-r border-white/10 bg-[#000000] flex-col justify-between overflow-hidden select-text shrink-0`}>
          <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none shrink-0">
            <span className="font-mono text-xs text-zinc-400 font-medium tracking-wider uppercase">
              CURRENT SCENARIO
            </span>
            <span className="font-mono text-xs text-[#8052ff] font-semibold">
              Q{String(currentQIndex + 1).padStart(2, '0')}/{String(questions.length || 5).padStart(2, '0')}
            </span>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                QUESTION {String(currentQIndex + 1).padStart(2, '0')}
              </span>
              {currentQuestion?.topic && (
                <span className="text-[11px] font-mono font-medium text-[#8052ff] uppercase tracking-wide bg-[#8052ff]/10 border border-[#8052ff]/30 px-2.5 py-0.5 rounded-full">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            {/* Dominant Editorial Question Typography */}
            <div className="space-y-4">
              {isGenerating ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-5 bg-white/10 rounded-full w-3/4" />
                  <div className="h-4 bg-white/10 rounded-full w-full" />
                  <div className="h-4 bg-white/10 rounded-full w-5/6" />
                  <p className="text-xs text-[#8052ff] font-mono mt-3">Synthesizing calibrated scenario...</p>
                </div>
              ) : (
                <h2 className="font-display text-xl sm:text-2xl text-white font-normal leading-relaxed tracking-[-0.02em]">
                  {currentQuestion?.text || 'Loading technical question...'}
                </h2>
              )}
            </div>

            {/* Strategy Hint */}
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-full w-full justify-between cursor-pointer"
              >
                <span>{showHint ? 'Hide Strategy Guidance' : 'View Strategy Guidance'}</span>
                <span className="text-[10px] text-zinc-500">hint</span>
              </button>

              {showHint && (
                <div className="mt-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs text-white leading-relaxed space-y-2 animate-in fade-in duration-150">
                  <p className="font-mono text-[11px] font-semibold text-[#8052ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffb829]" />
                    APPROACH TIP
                  </p>
                  <p className="font-sans text-zinc-300 leading-relaxed font-light">
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
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block font-medium">
              SESSION PROGRESS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-3.5">
                <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider block">COMPLETED</span>
                <p className="text-sm font-medium text-white font-mono mt-0.5">
                  {String(answersCount).padStart(2, '0')} / {String(questions.length || 5).padStart(2, '0')}
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-3.5">
                <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider block">ACCURACY</span>
                <p className="text-sm font-medium text-[#15846e] font-mono mt-0.5">
                  {answersCount > 0 ? `${Math.round(totalScore / answersCount)}%` : '—'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER PANEL: Answer Workspace (flex-1) */}
        {/* ========================================================= */}
        <main className={`${mobileTab === 'workspace' ? 'flex flex-1 min-h-0' : 'hidden'} lg:flex flex-col min-w-0 overflow-hidden bg-[#000000]`}>
          {/* Titlebar & Mode Switcher */}
          <div className="h-12 shrink-0 border-b border-white/10 bg-[#000000] px-5 flex items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-zinc-400 font-medium tracking-wide">
                WORKSPACE // {answerMode.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-0.5">
                {(['text', 'code', 'voice'] as const).map((mode) => {
                  const isActive = answerMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setAnswerMode(mode)}
                      className={`px-3 py-1 text-[11px] font-mono font-medium transition-all rounded-full flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
                        isActive
                          ? 'bg-[#8052ff] text-white shadow-[0_0_12px_rgba(128,82,255,0.4)]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />}
                      <span>{mode === 'text' ? 'TEXT BUFFER' : mode === 'code' ? 'MONACO IDE' : 'VOICE COCKPIT'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Selector in Code Mode */}
              {answerMode === 'code' && (
                <div className="flex items-center gap-1.5 ml-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-8 w-[115px] rounded-full bg-white/[0.04] border-white/10 text-[11px] font-mono text-white focus:ring-0">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-white font-mono text-xs rounded-2xl shadow-2xl">
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
          <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto flex flex-col select-text bg-[#000000]">
            {/* Active Interviewer Follow-up Probe Banner */}
            {activeProbe && (
              <div className="mb-4 rounded-2xl border border-[#8052ff]/40 bg-[#8052ff]/10 p-4 sm:p-5 text-white backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8052ff] animate-ping" />
                    <span className="font-mono text-[11px] font-semibold tracking-wider text-[#8052ff] uppercase">
                      INTERVIEWER FOLLOW-UP PROBE (STAGE 2)
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded-full uppercase">
                    ADAPTIVE DRILL-DOWN
                  </span>
                </div>
                {activeProbe.acknowledgment && (
                  <p className="font-sans text-xs text-zinc-300 mb-1.5 italic">
                    "{activeProbe.acknowledgment}"
                  </p>
                )}
                <p className="font-sans text-sm text-white font-medium leading-relaxed">
                  "{activeProbe.probeText}"
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-2 border-t border-[#8052ff]/20">
                  <span className="hidden sm:inline">Address the interviewer's specific challenge above in your solution below.</span>
                  <button
                    onClick={() => executeEvaluation(primaryAnswerSaved)}
                    disabled={isEvaluating}
                    className="text-zinc-400 hover:text-white underline cursor-pointer text-[10px] uppercase tracking-wider ml-auto"
                  >
                    Skip Follow-up & Grade Initial
                  </button>
                </div>
              </div>
            )}

            {answerMode === 'text' && (
              <div className="flex-1 min-h-[300px] flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] focus-within:border-[#8052ff]/60 shadow-none overflow-hidden transition-all">
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 bg-white/[0.02]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    STDIN // TEXT BUFFER
                  </span>
                  <span className="text-[10px] font-mono text-[#8052ff] font-semibold">EDITABLE</span>
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
                  className="flex-1 w-full bg-transparent p-5 text-white font-mono text-sm leading-relaxed placeholder:text-zinc-600 resize-none focus:outline-none"
                />
              </div>
            )}

            {answerMode === 'code' && (
              <div className="flex-1 min-h-[340px] rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02] flex flex-col shadow-none">
                <div className="h-8 shrink-0 bg-white/[0.02] border-b border-white/10 px-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    MONACO RUNTIME // {selectedLanguage.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#15846e] font-semibold">AST ACTIVE</span>
                </div>
                <div className="flex-1 min-h-0 bg-[#0a0a0a]">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    theme="vs-dark"
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
                      <div className="flex items-center justify-center h-full text-xs text-zinc-400 font-mono animate-pulse">
                        LOADING MONACO IDE...
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {answerMode === 'voice' && (
              <div className="flex-1 min-h-[300px] flex flex-col space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-center shadow-none">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-3">
                    REAL-TIME VOICE COCKPIT
                  </span>
                  <VoiceRecorder
                    transcript={textAnswer}
                    onTranscript={(text) => setTextAnswer(text)}
                  />
                </div>

                <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-none">
                  <div className="px-5 py-2.5 border-b border-white/10 bg-white/[0.02]">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
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
                    className="flex-1 w-full bg-transparent p-5 text-white font-mono text-sm leading-relaxed placeholder:text-zinc-600 resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="min-h-14 py-2.5 shrink-0 border-t border-white/10 bg-[#000000] px-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-zinc-400 font-mono">
              {wordCount} WORDS · {charCount} CHARS
            </div>

            <div className="flex items-center gap-3">
              {!evaluation ? (
                <div className="flex items-center gap-2.5">
                  {activeProbe && (
                    <button
                      onClick={() => executeEvaluation(primaryAnswerSaved)}
                      disabled={isEvaluating || isProbing}
                      className="btn-dala-secondary px-4 py-2.5 text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-mono uppercase tracking-wider"
                    >
                      Skip Probe & Grade
                    </button>
                  )}
                  <button
                    onClick={() => handlePrimarySubmitOrProbe(false)}
                    disabled={isEvaluating || isProbing || (!textAnswer.trim() && !codeAnswer.trim())}
                    className="btn-dala-primary px-6 py-2.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs uppercase tracking-wider"
                  >
                    {isProbing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        GENERATING PROBE...
                      </span>
                    ) : isEvaluating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        EVALUATING SOLUTION...
                      </span>
                    ) : activeProbe ? (
                      'SUBMIT FOLLOW-UP RESPONSE →'
                    ) : (
                      'SUBMIT FOR PROBING →'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {currentQIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="btn-dala-primary px-6 py-2.5 cursor-pointer font-mono text-xs uppercase tracking-wider"
                    >
                      NEXT QUESTION →
                    </button>
                  ) : (
                    <button
                      onClick={handleEndInterview}
                      className="btn-dala-primary px-6 py-2.5 cursor-pointer font-mono text-xs uppercase tracking-wider"
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
        {/* RIGHT PANEL: AI Coach Live Evaluation Console */}
        {/* ========================================================= */}
        <aside className={`${mobileTab === 'coach' ? 'flex flex-1 min-h-0 w-full' : 'hidden'} lg:flex lg:w-[320px] border-l border-white/10 bg-[#000000] text-white flex-col justify-between overflow-hidden select-text shrink-0`}>
          <div className="flex items-center justify-between px-5 h-12 border-b border-white/10 bg-white/[0.02] select-none shrink-0">
            <span className="font-mono text-[11px] text-zinc-400 font-medium tracking-wider uppercase">
              AI COACH EVALUATION
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#15846e] bg-[#15846e]/10 border border-[#15846e]/30 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15846e] animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {isEvaluating ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#8052ff] font-mono text-[11px] uppercase tracking-wider font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#8052ff] animate-ping" />
                  <span>Evaluating Technical Depth...</span>
                </div>

                {streamingFeedback ? (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-xs text-white leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap">
                    {streamingFeedback}
                    <span className="inline-block w-1.5 h-3.5 bg-[#8052ff] animate-pulse ml-1 align-middle" />
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-9 h-9 rounded-full border-2 border-[#8052ff]/30 border-t-[#8052ff] animate-spin" />
                    <p className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">SCORING_BUFFER...</p>
                  </div>
                )}
              </div>
            ) : evaluation ? (
              <div className="space-y-5">
                {/* Score Ring Header */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">SCORE</span>
                    <p className="text-2xl font-bold font-mono text-white leading-none mt-1">
                      {evaluation.score} <span className="text-xs text-zinc-400">/ 100</span>
                    </p>
                  </div>
                  <ScoreRing score={evaluation.score} />
                </div>

                {/* Sub-Score Progress Bars */}
                <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white">
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
                <div className="bg-[#8052ff]/10 text-white rounded-2xl p-4 border border-[#8052ff]/30 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#8052ff] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] animate-ping" />
                    ⚡ CAVEMAN TAKE (QUICK EVAL)
                  </span>
                  <p className="font-mono text-xs text-white font-medium leading-snug">
                    {evaluation.caveman_feedback || evaluation.feedback}
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block font-medium">
                    DETAILED ANALYSIS
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Improvements */}
                {(evaluation.improvements || evaluation.improvement) && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block font-medium">
                      ACTIONABLE REMEDIATIONS
                    </span>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white">
                      {parseSuggestions(evaluation.improvements || evaluation.improvement).length > 1 ? (
                        <ul className="space-y-2 text-xs text-zinc-300 font-sans font-light">
                          {parseSuggestions(evaluation.improvements || evaluation.improvement).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#8052ff] font-mono text-[10px] mt-0.5 shrink-0">►</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-light">
                          {evaluation.improvements || evaluation.improvement}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Remediation & Re-test Quick Link */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => router.push('/dashboard/roadmap')}
                    className="text-[11px] font-mono text-[#8052ff] hover:underline flex items-center gap-1 uppercase cursor-pointer"
                  >
                    <span>Remediation Roadmap</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => router.push(`/interview/new?role=${encodeURIComponent(interview?.target_role || '')}&type=${interviewType}&difficulty=${difficulty}&retry=true`)}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
                  >
                    1-Click Re-test
                  </button>
                </div>
              </div>
            ) : (
              /* Active Answering State — Calm Conversational Notes & Telemetry (No premature anxiety scores) */
              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">SESSION STAGE</span>
                    <span className="text-[10px] font-mono text-[#8052ff] bg-[#8052ff]/10 border border-[#8052ff]/30 px-2 py-0.5 rounded-full uppercase font-medium">
                      {activeProbe ? 'STAGE 2 // PROBING' : 'STAGE 1 // INITIAL'}
                    </span>
                  </div>
                  <h4 className="font-sans text-sm font-medium text-white leading-snug">
                    {activeProbe
                      ? 'Interviewer follow-up active. Clarify trade-offs & scale.'
                      : 'Formulating initial technical architecture & rationale.'}
                  </h4>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {activeProbe
                      ? 'The AI interviewer is probing your design for edge cases and scale limits. Answer directly or skip to score.'
                      : 'Draft your solution in text, code, or voice. Once submitted, the interviewer will issue an adaptive probe before final grading.'}
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    LIVE REHEARSAL TELEMETRY
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">INPUT MODE</span>
                      <span className="text-xs font-mono font-medium text-white uppercase">{answerMode}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">VOLUME</span>
                      <span className="text-xs font-mono font-medium text-white">{wordCount} words</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono leading-relaxed pt-1">
                    * Anxiety-free mode: Scoring metrics and multi-vector ratings unlock upon submission.
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
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl w-[420px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
              <span className="font-mono text-[11px] text-zinc-400 font-medium tracking-wider uppercase">
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

              <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
                You have completed <strong className="text-[#15846e] font-mono font-medium">{answersCount}</strong> of{' '}
                <strong className="text-white font-mono font-medium">{questions.length || 5}</strong> questions.
                Ending now will compute your score report based on submitted answers.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setShowEndModal(false)}
                  disabled={isEnding}
                  className="rounded-full border border-white/10 hover:border-white/20 bg-white/5 text-zinc-400 hover:text-white text-xs font-mono uppercase px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue Answering
                </button>
                <button
                  onClick={() => {
                    handleEndInterview();
                  }}
                  disabled={isEnding}
                  className="rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white text-xs font-mono font-bold uppercase px-4 py-2.5 transition-all shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-wait flex items-center gap-2"
                >
                  {isEnding ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Computing Results...</span>
                    </>
                  ) : (
                    <span>End & View Results</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy-Paste Toast Warning */}
      {pasteWarningToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[115] bg-[#0a0a0a] border border-[#8052ff]/50 text-white font-mono text-xs px-4 py-2 rounded-full shadow-[0_0_25px_rgba(128,82,255,0.4)] flex items-center gap-2 select-none animate-bounce">
          <Zap className="h-3.5 w-3.5 text-[#ffb829]" />
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
