'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Editor from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MacTrafficLights } from '@/components/ui/terminal-card';

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

const INTERVIEW_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const URGENT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

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
 * Score Ring — Minimal Instrumentation Ring
 */
function ScoreRing({ score }: { score: number }) {
  const size = 76;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circ - (clampedScore / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={38}
          cy={38}
          r={r}
          fill="none"
          stroke="var(--color-slate)"
          strokeWidth={4}
        />
        <circle
          cx={38}
          cy={38}
          r={r}
          fill="none"
          stroke="var(--color-signal-green)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[var(--color-chalk)] font-mono font-bold text-base leading-none tracking-tight">{clampedScore}</span>
        <span className="text-[8px] text-[var(--color-fog)] font-mono mt-0.5 uppercase tracking-widest">/ 100</span>
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
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-[var(--color-fog)] uppercase tracking-wider">{label}</span>
        <span className="text-[var(--color-signal-green)] font-semibold">{clamped}%</span>
      </div>
      <div className="h-1 bg-[var(--color-slate)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-signal-green)] transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Voice Waveform — Visualizer
 */
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  const heights = [10, 22, 14, 30, 18, 26, 12, 28, 20, 16, 24, 32, 14, 26, 18, 12, 24, 28, 16, 10];

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 bg-[var(--color-obsidian)] border border-[var(--color-basalt)] rounded-[4px] w-full max-w-xs mx-auto">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            isActive ? 'bg-[var(--color-signal-green)]' : 'bg-[var(--color-basalt)]'
          }`}
          style={{
            height: isActive ? `${Math.max(6, Math.min(28, (h * ((i % 3) + 1.2)) % 28 + 6))}px` : '6px',
            animation: isActive ? `neonWavePulse 0.6s ease-in-out infinite alternate ${i * 0.03}s` : 'none',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes neonWavePulse {
          0% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          100% {
            transform: scaleY(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Countdown Timer — Technical Monospace Readout
 */
function CountdownTimer({ startTime, onTimeUp }: { startTime: number; onTimeUp: () => void }) {
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION_MS);
  const isUrgent = timeLeft <= URGENT_THRESHOLD_MS;
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, INTERVIEW_DURATION_MS - elapsed);
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
      className={`rounded-full px-3 py-1 font-mono text-xs flex items-center gap-2 transition-colors ${
        isUrgent
          ? 'bg-[#ef4444]/10 border border-[#ef4444]/40 text-[#ef4444] animate-pulse'
          : 'bg-[var(--color-obsidian)] border border-[var(--color-basalt)] text-[var(--color-ash)]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-[#ef4444]' : 'bg-[var(--color-signal-green)]'}`} />
      <span className="tracking-widest">{displayTime}</span>
    </div>
  );
}

/**
 * Voice Recording Component (en-IN + multi-alternative ranking)
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
      let interimTranscript = '';
      let baseFinal = transcriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          const alternatives = Array.from(res as any[])
            .map((alt: any) => ({
              transcript: alt.transcript,
              confidence: typeof alt.confidence === 'number' ? alt.confidence : 0,
            }))
            .sort((a, b) => b.confidence - a.confidence);

          const bestSegment = alternatives[0]?.transcript || '';
          baseFinal = (baseFinal ? baseFinal.trim() + ' ' : '') + bestSegment.trim();
        } else {
          interimTranscript += res[0]?.transcript || '';
        }
      }

      const combined = (baseFinal + (interimTranscript ? ' ' + interimTranscript : '')).trim();
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
    } else {
      isRecordingRef.current = true;
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const clearTranscript = () => {
    onTranscript('');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-2">
      <VoiceWaveform isActive={isRecording} />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleRecording}
          className={`px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            isRecording
              ? 'bg-[#ef4444] text-[var(--color-ash)] shadow-md animate-pulse'
              : 'bg-[#4f46e5] hover:bg-[#5865f2] text-white shadow-[0_0_20px_rgba(79,70,229,0.35)] active:scale-95'
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--color-ash)] animate-ping" />
              <span>STOP RECORDING</span>
            </>
          ) : (
            <>
              <span>START RECORDING</span>
            </>
          )}
        </button>

        {transcript && (
          <button
            onClick={clearTranscript}
            className="text-xs font-mono text-[var(--color-fog)] hover:text-[var(--color-ash)] transition-colors rounded-full border border-[var(--color-basalt)] px-3 py-1.5"
          >
            CLEAR
          </button>
        )}
      </div>

      <p className="text-[10px] text-[var(--color-fog)] font-mono uppercase tracking-wider">
        Optimized for Indian English accents (en-IN)
      </p>
    </div>
  );
}

/**
 * Main InterviewRoom Component — Modern Developer Cockpit & Technical IDE Layout
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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [interviewStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  // Additional UI states
  const [showEndModal, setShowEndModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [recordedHistory, setRecordedHistory] = useState<EvaluatedRecord[]>([]);

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
        const data = await fetchInterviewApi({
          mode: 'generate',
          interviewType,
          difficulty,
          resumeContext,
          count: 5,
        });

        if (mounted && Array.isArray(data.questions)) {
          setQuestions(data.questions as Question[]);
          setQuestionStartTime(Date.now());
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
  }, [interviewType, difficulty, resumeContext]);

  const handleSubmitAnswer = async () => {
    if ((!textAnswer.trim() && !codeAnswer.trim()) || !questions[currentQIndex]) return;

    const q = questions[currentQIndex];
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
    const submittedAnswer = answerMode === 'code' ? codeAnswer : textAnswer;

    setIsEvaluating(true);
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
        }),
      });

      if (!res.ok) {
        throw new Error('Evaluation request failed');
      }

      const result = await res.json();
      const evalResult = result.evaluation as EvaluationResult;
      setEvaluation(evalResult);
      setTotalScore((prev) => prev + (evalResult?.score ?? 0));
      setAnswersCount((prev) => prev + 1);

      setRecordedHistory((prev) => [
        ...prev,
        {
          question: q,
          userAnswer: submittedAnswer,
          evaluation: evalResult,
        },
      ]);
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setTextAnswer('');
    setCodeAnswer('');
    setShowHint(false);
    setQuestionStartTime(Date.now());
    setCurrentQIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const handleEndInterview = async () => {
    setIsInterviewEnded(true);

    try {
      const avgScore = answersCount > 0 ? Math.round(totalScore / answersCount) : 0;
      const totalElapsedSeconds = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));

      await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          overall_score: avgScore,
          completed_at: new Date().toISOString(),
          duration_seconds: totalElapsedSeconds,
        }),
      });
    } catch (error) {
      console.error('Failed to end interview:', error);
    }
  };

  const currentQuestion = questions[currentQIndex];
  const progressPercent = questions.length > 0
    ? Math.round(((currentQIndex + (evaluation ? 1 : 0)) / questions.length) * 100)
    : 0;

  const currentAnswerText = answerMode === 'code' ? codeAnswer : textAnswer;
  const wordCount = currentAnswerText.trim() ? currentAnswerText.trim().split(/\s+/).length : 0;
  const charCount = currentAnswerText.length;

  // -------------------------------------------------------------
  // RESULT SCREEN — Terminal Instrumentation & Structured Layers
  // -------------------------------------------------------------
  if (isInterviewEnded) {
    const avgScore = answersCount > 0 ? Math.round(totalScore / answersCount) : 0;
    const totalElapsedSeconds = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));
    const mins = Math.floor(totalElapsedSeconds / 60);
    const secs = totalElapsedSeconds % 60;

    return (
      <div className="relative min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-sans">
        <div className="relative z-10 w-full max-w-3xl rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden my-8">
          {/* Apple Terminal Titlebar */}
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                session-evaluation-report.log — zsh
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] led-pulse" />
              <span className="font-mono text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                SESSION COMPLETE
              </span>
            </div>
          </div>

          {/* Terminal Command Cue */}
          <div className="px-5 py-2.5 border-b border-[#1e2030]/40 bg-[#0c0d15]/50 flex items-center gap-2 font-mono text-[12px]">
            <span className="text-[#38bdf8] font-semibold">interviewai@eval</span>
            <span className="text-[#94a3b8]">:</span>
            <span className="text-[#818cf8]">~/telemetry</span>
            <span className="text-[#f8fafc]">$</span>
            <span className="text-[#22c55e]">./score_assessment.sh --target=candidate_eval --report=full</span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header / Score Ring */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#1e2030]/60 pb-6">
              <div className="text-center sm:text-left space-y-1.5">
                <span className="text-[11px] font-mono font-semibold text-[#818cf8] uppercase tracking-widest block">
                  // ASSESSMENT RESULT
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                  {interview?.title || 'Mock Test'} Summary
                </h1>
                <p className="text-xs text-[#9ca3af] font-mono uppercase">
                  {interview?.target_role || 'SOFTWARE ENGINEER'} · {interviewType.toUpperCase()} · {difficulty.toUpperCase()}
                </p>
              </div>

              {/* Score Ring Display */}
              <div className="flex items-center gap-4 bg-[#0c0d15] border border-[#1e2030] rounded-lg p-4 px-6 shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                <ScoreRing score={avgScore} />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider font-mono block">FINAL SCORE</span>
                  <p className="text-xl font-bold font-mono text-white">
                    {avgScore >= 80 ? 'EXCEPTIONAL' : avgScore >= 65 ? 'STRONG' : 'NEEDS PRACTICE'}
                  </p>
                  <span className="text-xs text-[#22c55e] font-mono">{answersCount} OF {questions.length || 5} COMPLETED</span>
                </div>
              </div>
            </div>

            {/* 4-Column Technical Metrics Terminal Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3 hover:border-[#3730a3]/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-wider">QUESTIONS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{questions.length || 5}</p>
              </div>

              <div className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3 hover:border-[#3730a3]/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-wider">COMPLETED</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                </div>
                <p className="text-lg font-bold text-[#22c55e] font-mono">{answersCount}</p>
              </div>

              <div className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3 hover:border-[#3730a3]/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-wider">DURATION</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{mins}m {secs}s</p>
              </div>

              <div className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3 hover:border-[#3730a3]/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#9ca3af] font-mono uppercase tracking-wider">ACCURACY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                </div>
                <p className="text-lg font-bold text-white font-mono">{avgScore}%</p>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9ca3af]">
                QUESTION BREAKDOWN ({recordedHistory.length})
              </h2>

              {recordedHistory.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#1e2030] rounded-lg text-[#64748b] text-xs font-mono">
                  NO ANSWERS EVALUATED IN THIS SESSION
                </div>
              ) : (
                <div className="space-y-3">
                  {recordedHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0c0d15] border border-[#1e2030] rounded-lg p-4 space-y-3 hover:border-[#3730a3]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-[#1e2030]/60 pb-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#818cf8] font-semibold">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#14142b] text-[#818cf8] border border-[#3730a3]/40 uppercase">
                              {item.question.topic || item.question.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white leading-relaxed mt-1">
                            {item.question.text}
                          </p>
                        </div>
                        <span className="text-base font-bold font-mono text-[#22c55e] shrink-0 bg-[#22c55e]/10 border border-[#22c55e]/20 px-2.5 py-1 rounded-md">
                          {item.evaluation.score}%
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-[#9ca3af] leading-relaxed">
                          <strong className="text-white font-mono text-[11px] uppercase tracking-wider">Feedback: </strong>
                          {item.evaluation.feedback}
                        </p>
                        {(item.evaluation.improvements || item.evaluation.improvement) && (
                          <p className="text-[#9ca3af] leading-relaxed">
                            <strong className="text-[#818cf8] font-mono text-[11px] uppercase tracking-wider">Suggestion: </strong>
                            {item.evaluation.improvements || item.evaluation.improvement}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#1e2030]/60">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto rounded-md border border-[#1e2030] hover:border-[#3730a3] bg-[#0c0d15] hover:bg-[#14142b] text-[#9ca3af] hover:text-white text-xs font-mono uppercase tracking-wider px-6 py-2.5 transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push(interviewId ? `/dashboard/history/${interviewId}` : '/dashboard/history')}
                className="w-full sm:w-auto rounded-md bg-[#4f46e5] hover:bg-[#5865f2] text-white text-xs font-mono font-bold uppercase tracking-wider px-6 py-2.5 transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] cursor-pointer"
              >
                See History →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DEVELOPER COCKPIT (100vh overflow-hidden)
  // -------------------------------------------------------------
  return (
    <div className="relative h-screen max-h-screen w-full bg-[var(--color-carbon)] text-[var(--color-ash)] flex flex-col overflow-hidden select-none font-sans">
      {/* HEADER */}
      <header className="h-12 shrink-0 border-b border-[var(--color-basalt)] bg-[var(--color-graphite)] px-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-signal-green)]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[var(--color-chalk)]">
              INTERVIEW_AI
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-[var(--color-basalt)]" />

          {/* Question Index Pill */}
          <span className="text-[11px] font-mono text-[var(--color-silver)]">
            QUESTION {String(currentQIndex + 1).padStart(2, '0')} / {String(questions.length || 5).padStart(2, '0')}
          </span>

          {/* Difficulty Badge */}
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-[var(--color-basalt)] bg-[var(--color-obsidian)] text-[var(--color-ash)]">
            {difficulty}
          </span>

          <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--color-fog)] px-1.5 py-0.5 uppercase">
            {interviewType.replace('-', ' ')}
          </span>
        </div>

        {/* Timer and End Session */}
        <div className="flex items-center gap-3">
          <CountdownTimer startTime={interviewStartTime} onTimeUp={handleEndInterview} />

          <button
            onClick={() => setShowEndModal(true)}
            className="text-[11px] font-mono rounded-full border border-[var(--color-basalt)] bg-transparent text-[var(--color-silver)] hover:text-[#ef4444] hover:border-[#ef4444]/40 px-3 py-1 transition-colors uppercase tracking-wider"
          >
            END SESSION
          </button>
        </div>
      </header>

      {/* 2px Terminal Progress Bar */}
      <div className="h-[2px] w-full bg-[var(--color-obsidian)] shrink-0">
        <div
          className="h-full bg-[var(--color-signal-green)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3-COLUMN COCKPIT BODY */}
      <div className="flex-1 min-h-0 grid grid-cols-[330px_1fr_300px] overflow-hidden bg-[#050508]">
        {/* ========================================================= */}
        {/* LEFT PANEL: Technical Briefing Rail (w-[330px]) */}
        {/* ========================================================= */}
        <aside className="w-[330px] border-r border-[#1e2030] bg-[#09090f] flex flex-col justify-between overflow-hidden select-text">
          {/* Apple Terminal Titlebar */}
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none shrink-0">
            <div className="flex items-center gap-2.5">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                question-briefing.sh — zsh
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              Q{String(currentQIndex + 1).padStart(2, '0')}/{String(questions.length || 5).padStart(2, '0')}
            </span>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Meta Header */}
            <div className="flex items-center justify-between gap-2 border-b border-[#1e2030]/60 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b]">
                QUESTION {String(currentQIndex + 1).padStart(2, '0')} OF {String(questions.length || 5).padStart(2, '0')}
              </span>
              {currentQuestion?.topic && (
                <span className="text-[10px] font-mono font-semibold text-[#22c55e] uppercase tracking-wide bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            {/* Question Text or Skeleton */}
            <div className="space-y-3">
              {isGenerating ? (
                <div className="space-y-2.5 animate-pulse">
                  <div className="h-4 bg-[#14142b] rounded w-3/4" />
                  <div className="h-3.5 bg-[#14142b] rounded w-full" />
                  <div className="h-3.5 bg-[#14142b] rounded w-5/6" />
                  <div className="h-3.5 bg-[#14142b] rounded w-2/3" />
                  <p className="text-[11px] text-[#818cf8] font-mono mt-3">► GENERATING_QUESTIONS...</p>
                </div>
              ) : (
                <h2 className="text-[16px] sm:text-[17px] text-[#f8fafc] font-normal leading-relaxed tracking-normal font-sans">
                  {currentQuestion?.text || 'Loading technical question...'}
                </h2>
              )}
            </div>

            {/* Strategy Hint Terminal Block */}
            <div className="pt-1">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-[#9ca3af] hover:text-[#818cf8] flex items-center gap-1.5 transition-colors uppercase tracking-wider bg-[#0c0d15] border border-[#1e2030] hover:border-[#3730a3] px-3 py-1.5 rounded-md w-full justify-between cursor-pointer"
              >
                <span>{showHint ? '- HIDE STRATEGY HINT' : '+ STRATEGY HINT'}</span>
                <span className="text-[10px] text-[#64748b]">hint.sh</span>
              </button>

              {showHint && (
                <div className="mt-2.5 p-3.5 bg-[#0c0d15] border border-[#1e2030] rounded-lg text-xs text-[#9ca3af] leading-relaxed space-y-2 animate-in fade-in duration-150">
                  <p className="font-mono text-[10px] font-semibold text-[#818cf8] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                    STRATEGY GUIDANCE
                  </p>
                  <p className="font-sans pl-2 border-l border-[#3730a3] text-[#cbd5e1]">
                    {currentQuestion?.topic
                      ? `Focus on core principles of ${currentQuestion.topic}. Outline assumptions, time/space complexity, and practical trade-offs.`
                      : 'State your high-level approach first before diving into details. Outline constraints and edge cases.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Session Metrics Terminal Widget */}
          <div className="p-4 border-t border-[#1e2030] bg-[#0c0d15]/50 space-y-2.5 shrink-0">
            <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest block font-semibold">
              SESSION TELEMETRY
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#09090f] border border-[#1e2030] rounded-md p-2.5">
                <span className="text-[9px] text-[#64748b] uppercase font-mono tracking-wider block">COMPLETED</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {String(answersCount).padStart(2, '0')} / {String(questions.length || 5).padStart(2, '0')}
                </p>
              </div>
              <div className="bg-[#09090f] border border-[#1e2030] rounded-md p-2.5">
                <span className="text-[9px] text-[#64748b] uppercase font-mono tracking-wider block">ACCURACY</span>
                <p className="text-sm font-bold text-[#22c55e] font-mono mt-0.5">
                  {answersCount > 0 ? `${Math.round(totalScore / answersCount)}%` : '--'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER PANEL: IDE / Editor Workspace (flex-1) */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#050508]">
          {/* Apple Terminal Titlebar & Mode Switcher */}
          <div className="h-10 shrink-0 border-b border-[#1e2030] bg-[#11121b]/90 px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                workspace::answer_buffer.{answerMode === 'code' ? (selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : 'ts') : 'txt'} — editor
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#09090f] border border-[#1e2030] rounded-md p-0.5">
                {(['text', 'code', 'voice'] as const).map((mode) => {
                  const isActive = answerMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setAnswerMode(mode)}
                      className={`px-2.5 py-0.5 text-[11px] font-mono font-medium transition-all rounded flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
                        isActive
                          ? 'bg-[#14142b] border border-[#3730a3] text-white shadow-sm'
                          : 'text-[#64748b] hover:text-[#9ca3af]'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
                      <span>{mode === 'text' ? 'TEXT' : mode === 'code' ? 'CODE' : 'VOICE'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Select (Code Mode Only) */}
              {answerMode === 'code' && (
                <div className="flex items-center gap-1.5 ml-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-7 w-[110px] rounded bg-[#09090f] border-[#1e2030] text-[11px] font-mono text-[#9ca3af] focus:ring-0">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#09090f] border-[#1e2030] text-white font-mono text-xs rounded-md">
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

          {/* Active Workspace Canvas */}
          <div className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto flex flex-col select-text">
            {answerMode === 'text' && (
              <div className="flex-1 min-h-[300px] flex flex-col rounded-xl border border-[#1e2030] bg-[#09090f] focus-within:border-[#3730a3] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-colors">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2030]/60 bg-[#0c0d15]/60">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b]">
                    BUFFER: STDIN
                  </span>
                  <span className="text-[10px] font-mono text-[#818cf8]">EDITABLE</span>
                </div>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your structured solution, architectural trade-offs, or explanations..."
                  className="flex-1 w-full bg-transparent p-4 text-[#f8fafc] font-mono text-sm leading-relaxed placeholder:text-[#64748b]/60 resize-none focus:outline-none"
                />
              </div>
            )}

            {answerMode === 'code' && (
              <div className="flex-1 min-h-[340px] rounded-xl border border-[#1e2030] overflow-hidden bg-[#09090f] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="h-7 shrink-0 bg-[#0c0d15] border-b border-[#1e2030] px-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b]">CODE_BUFFER</span>
                  <span className="text-[10px] font-mono uppercase text-[#22c55e]">{selectedLanguage}</span>
                </div>
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    theme="vs-dark"
                    value={codeAnswer}
                    onChange={(val) => setCodeAnswer(val || '')}
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
                      padding: { top: 12, bottom: 12 },
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full text-xs text-[#64748b] font-mono animate-pulse">
                        LOADING_MONACO_EDITOR...
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {answerMode === 'voice' && (
              <div className="flex-1 min-h-[300px] flex flex-col space-y-3.5">
                <div className="bg-[#09090f] border border-[#1e2030] rounded-xl p-4 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748b] block mb-3">VOICE_INPUT</span>
                  <VoiceRecorder
                    transcript={textAnswer}
                    onTranscript={(text) => setTextAnswer(text)}
                  />
                </div>

                <div className="flex-1 flex flex-col bg-[#09090f] border border-[#1e2030] rounded-xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-[#1e2030]/60 bg-[#0c0d15]">
                    <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-widest">
                      TRANSCRIPT_BUFFER (EDITABLE)
                    </span>
                  </div>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Your spoken words will transcribe here in real-time. You can edit before submitting..."
                    className="flex-1 w-full bg-transparent p-4 text-[#f8fafc] font-mono text-sm leading-relaxed placeholder:text-[#64748b]/60 resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="h-12 shrink-0 border-t border-[#1e2030] bg-[#09090f] px-5 flex items-center justify-between">
            <div className="text-xs text-[#64748b] font-mono">
              {wordCount} WORDS · {charCount} CHARS
            </div>

            <div className="flex items-center gap-3">
              {!evaluation ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || (!textAnswer.trim() && !codeAnswer.trim())}
                  className="rounded-md bg-[#4f46e5] hover:bg-[#5865f2] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] cursor-pointer"
                >
                  {isEvaluating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      EVALUATING...
                    </span>
                  ) : (
                    'SUBMIT →'
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {currentQIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="rounded-md bg-[#4f46e5] hover:bg-[#5865f2] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] cursor-pointer"
                    >
                      NEXT QUESTION →
                    </button>
                  ) : (
                    <button
                      onClick={handleEndInterview}
                      className="rounded-md bg-[#4f46e5] hover:bg-[#5865f2] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] cursor-pointer"
                    >
                      FINISH INTERVIEW →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT PANEL: AI Coach Live Evaluation Console (w-[300px]) */}
        {/* ========================================================= */}
        <aside className="w-[300px] border-l border-[#1e2030] bg-[#09090f] flex flex-col justify-between overflow-hidden select-text">
          {/* Apple Terminal Titlebar */}
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none shrink-0">
            <div className="flex items-center gap-2.5">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                ai-coach.telemetry — live
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#22c55e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] led-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Content Area */}
            {isEvaluating ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#1e2030] border-t-[#818cf8] animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-mono font-medium text-white uppercase tracking-wider">ANALYZING_BUFFER...</p>
                  <p className="text-[10px] text-[#64748b] font-mono uppercase">SCORING TECHNICAL ACCURACY</p>
                </div>
              </div>
            ) : evaluation ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Score Ring Header */}
                <div className="flex items-center justify-between bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3.5 shadow-sm">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] block">SCORE</span>
                    <p className="text-2xl font-bold font-mono text-white leading-none mt-1">
                      {evaluation.score} <span className="text-xs text-[#64748b]">/ 100</span>
                    </p>
                  </div>
                  <ScoreRing score={evaluation.score} />
                </div>

                {/* Sub-Score Progress Bars */}
                <div className="space-y-2.5 bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3">
                  <MiniBar
                    label="TECHNICAL ACCURACY"
                    value={Math.min(100, Math.round(evaluation.score * 1.02))}
                  />
                  <MiniBar
                    label="STRUCTURE & CLARITY"
                    value={Math.min(100, Math.max(20, Math.round(evaluation.score * 0.95)))}
                  />
                  <MiniBar
                    label="DEPTH & EDGE CASES"
                    value={Math.min(100, Math.max(20, Math.round(evaluation.score * 0.92)))}
                  />
                </div>

                {/* CAVEMAN LIVE FEEDBACK (Instant Scan for Candidate) */}
                <div className="bg-gradient-to-r from-[#14142b] to-[#1e1b4b] border border-[#6366f1]/40 rounded-lg p-3 shadow-[0_0_15px_rgba(99,102,241,0.2)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#818cf8] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-ping" />
                      ⚡ CAVEMAN TAKE (QUICK EVAL)
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#f8fafc] font-semibold leading-snug">
                    {evaluation.caveman_feedback || evaluation.feedback}
                  </p>
                </div>

                {/* Feedback Analysis */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-wider block">
                    DETAILED ANALYSIS
                  </span>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed font-sans bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Improvements */}
                {(evaluation.improvements || evaluation.improvement) && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#818cf8] font-mono uppercase tracking-wider block">
                      KEY SUGGESTIONS
                    </span>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed font-sans bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3">
                      {evaluation.improvements || evaluation.improvement}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Idle State */
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#0c0d15] border border-[#1e2030] flex items-center justify-center text-sm text-[#818cf8] font-mono shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                  [►]
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-semibold text-white uppercase tracking-wider">AWAITING_RESPONSE</p>
                  <p className="text-[11px] text-[#9ca3af] leading-relaxed font-sans">
                    Submit your answer to begin live evaluation.
                  </p>
                </div>

                <div className="w-full bg-[#0c0d15] border border-[#1e2030] rounded-lg p-3 text-left space-y-1.5 text-[11px]">
                  <p className="font-semibold text-white font-mono text-[10px] uppercase tracking-wider">INTERVIEW TIPS:</p>
                  <ul className="space-y-1 list-disc list-inside text-[#9ca3af] font-sans">
                    <li>State assumptions clearly</li>
                    <li>Discuss design trade-offs</li>
                    <li>Account for edge cases</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-[#1e2030] bg-[#0c0d15]/50 text-center shrink-0">
            <span className="text-[9px] text-[#64748b] font-mono uppercase tracking-wider">
              Gemini & LLM Evaluation Engine
            </span>
          </div>
        </aside>
      </div>

      {/* END CONFIRM MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-[#1e2030] bg-[#09090f] w-[400px] shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            {/* macOS Titlebar */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
              <div className="flex items-center gap-2.5">
                <MacTrafficLights size="sm" />
                <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                  terminate-session.sh — prompt
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                CONFIRM
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#ef4444] font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span>TERMINATE ASSESSMENT EARLY?</span>
              </div>

              <p className="text-xs text-[#9ca3af] leading-relaxed font-mono">
                Completed <span className="text-[#22c55e] font-semibold">{answersCount}</span> of{' '}
                <span className="text-white">{questions.length || 5}</span> questions. End now to compute your score report, or continue answering.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2030]">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="rounded-md border border-[#1e2030] hover:border-[#3730a3] bg-[#0c0d15] text-[#9ca3af] hover:text-white text-xs font-mono uppercase px-4 py-2 transition-colors cursor-pointer"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    setShowEndModal(false);
                    handleEndInterview();
                  }}
                  className="rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase px-4 py-2 transition-all shadow-md cursor-pointer"
                >
                  End & View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
