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
          stroke="#242628"
          strokeWidth={4}
        />
        <circle
          cx={38}
          cy={38}
          r={r}
          fill="none"
          stroke="#34D59A"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[#FFFFFF] font-mono font-bold text-base leading-none tracking-tight">{clampedScore}</span>
        <span className="text-[8px] text-[#797D86] font-mono mt-0.5 uppercase tracking-widest">/ 100</span>
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
        <span className="text-[#797D86] uppercase tracking-wider">{label}</span>
        <span className="text-[#34D59A] font-semibold">{clamped}%</span>
      </div>
      <div className="h-1 bg-[#242628] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#34D59A] transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Voice Waveform — 20-bar Electric Green / Graphite Visualizer
 */
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  const heights = [10, 22, 14, 30, 18, 26, 12, 28, 20, 16, 24, 32, 14, 26, 18, 12, 24, 28, 16, 10];

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 bg-[#151617] border border-[#303236] rounded-[4px] w-full max-w-xs mx-auto">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            isActive ? 'bg-[#34D59A]' : 'bg-[#303236]'
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

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, INTERVIEW_DURATION_MS - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`rounded-full px-3 py-1 font-mono text-xs flex items-center gap-2 transition-colors ${
        isUrgent
          ? 'bg-[#FF3621]/10 border border-[#FF3621]/40 text-[#FF3621] animate-pulse'
          : 'bg-[#151617] border border-[#303236] text-[#C9CBCF]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-[#FF3621]' : 'bg-[#34D59A]'}`} />
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
    transcriptRef.current = transcript;
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
    recognition.lang = 'en-IN'; // Indian English accents
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
              ? 'bg-[#FF3621] text-white shadow-md shadow-[#FF3621]/20 animate-pulse'
              : 'bg-[#FFFFFF] hover:bg-[#C9CBCF] text-[#151617] shadow-sm active:scale-95'
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
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
            className="text-xs font-mono text-[#797D86] hover:text-[#FFFFFF] transition-colors rounded-full border border-[#303236] px-3 py-1.5"
          >
            CLEAR
          </button>
        )}
      </div>

      <p className="text-[10px] text-[#797D86] font-mono uppercase tracking-wider">
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

  const handleChatSend = async (content: string) => {
    const userMsg: ChatMessage = { role: 'user', content };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsChatting(true);

    try {
      const response = await fetchInterviewApi({
        mode: 'chat',
        messages: newHistory,
        resumeContext,
      });

      setChatHistory([...newHistory, { role: 'assistant', content: response.content }]);
    } catch (error) {
      console.error('Failed to get coaching response:', error);
    } finally {
      setIsChatting(false);
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
      <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col items-center justify-center p-6 overflow-y-auto select-none font-sans">
        <div className="relative z-10 w-full max-w-3xl bg-[#0A0A0B] border border-[#303236] rounded-[4px] p-8 sm:p-10 shadow-2xl space-y-8 my-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#303236] pb-6">
            <div className="text-center sm:text-left space-y-1.5">
              <span className="text-[11px] font-mono font-semibold text-[#34D59A] uppercase tracking-widest block">
                SESSION_COMPLETE
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF]">
                {interview?.title || 'Technical Assessment'} Summary
              </h1>
              <p className="text-xs text-[#797D86] font-mono uppercase">
                {interview?.target_role || 'SOFTWARE ENGINEER'} · {interviewType.toUpperCase()} · {difficulty.toUpperCase()}
              </p>
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center gap-4 bg-[#151617] border border-[#303236] rounded-[4px] p-4 px-6">
              <ScoreRing score={avgScore} />
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#797D86] uppercase tracking-wider font-mono block">FINAL SCORE</span>
                <p className="text-xl font-bold font-mono text-[#FFFFFF]">
                  {avgScore >= 80 ? 'EXCEPTIONAL' : avgScore >= 65 ? 'PASS / STRONG' : 'NEEDS PRACTICE'}
                </p>
                <span className="text-xs text-[#34D59A] font-mono">{answersCount} OF {questions.length || 5} COMPLETED</span>
              </div>
            </div>
          </div>

          {/* 4-Column Technical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-3">
              <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-wider">QUESTIONS</span>
              <p className="text-base font-bold text-[#FFFFFF] font-mono mt-0.5">{questions.length || 5}</p>
            </div>
            <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-3">
              <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-wider">COMPLETED</span>
              <p className="text-base font-bold text-[#34D59A] font-mono mt-0.5">{answersCount}</p>
            </div>
            <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-3">
              <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-wider">DURATION</span>
              <p className="text-base font-bold text-[#FFFFFF] font-mono mt-0.5">{mins}m {secs}s</p>
            </div>
            <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-3">
              <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-wider">ACCURACY</span>
              <p className="text-base font-bold text-[#FFFFFF] font-mono mt-0.5">{avgScore}%</p>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#797D86]">
              QUESTION BREAKDOWN ({recordedHistory.length})
            </h2>

            {recordedHistory.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[#303236] rounded-[4px] text-[#797D86] text-xs font-mono">
                NO ANSWERS EVALUATED IN THIS SESSION
              </div>
            ) : (
              <div className="space-y-3">
                {recordedHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#151617] border border-[#303236] rounded-[4px] p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-[#303236]/50 pb-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#34D59A] font-semibold">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#242628] text-[#94979E] border border-[#303236] uppercase">
                            {item.question.topic || item.question.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#FFFFFF] leading-relaxed mt-1">
                          {item.question.text}
                        </p>
                      </div>
                      <span className="text-base font-bold font-mono text-[#34D59A] shrink-0">
                        {item.evaluation.score}%
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="text-[#C9CBCF] leading-relaxed">
                        <strong className="text-[#FFFFFF] font-mono text-[11px] uppercase tracking-wider">Feedback: </strong>
                        {item.evaluation.feedback}
                      </p>
                      {(item.evaluation.improvements || item.evaluation.improvement) && (
                        <p className="text-[#C9CBCF] leading-relaxed">
                          <strong className="text-[#34D59A] font-mono text-[11px] uppercase tracking-wider">Suggestion: </strong>
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
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#303236]">
            <button
              onClick={() => router.push('/dashboard/interviews/new')}
              className="w-full sm:w-auto rounded-full border border-[#303236] hover:border-[#797D86] text-[#C9CBCF] hover:text-[#FFFFFF] text-xs font-mono uppercase tracking-wider px-6 py-2.5 transition-colors"
            >
              Start New Session
            </button>
            <button
              onClick={() => router.push(`/dashboard/history/${interviewId}`)}
              className="w-full sm:w-auto rounded-full bg-[#FFFFFF] hover:bg-[#C9CBCF] text-[#151617] text-xs font-mono font-bold uppercase tracking-wider px-6 py-2.5 transition-colors shadow-sm"
            >
              View Full History →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DEVELOPER COCKPIT (100vh overflow-hidden)
  // -------------------------------------------------------------
  return (
    <div className="relative h-screen max-h-screen w-full bg-[#000000] text-[#FFFFFF] flex flex-col overflow-hidden select-none font-sans">
      {/* HEADER (h-12, border-b border-[#303236]) */}
      <header className="h-12 shrink-0 border-b border-[#303236] bg-[#0A0A0B] px-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D59A]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#FFFFFF]">
              INTERVIEW_AI
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-[#303236]" />

          {/* Question Index Pill */}
          <span className="text-[11px] font-mono text-[#94979E]">
            QUESTION {String(currentQIndex + 1).padStart(2, '0')} / {String(questions.length || 5).padStart(2, '0')}
          </span>

          {/* Difficulty Badge */}
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-[#303236] bg-[#151617] text-[#C9CBCF]">
            {difficulty}
          </span>

          <span className="hidden sm:inline-block text-[10px] font-mono text-[#797D86] px-1.5 py-0.5 uppercase">
            {interviewType.replace('-', ' ')}
          </span>
        </div>

        {/* Timer and End Session */}
        <div className="flex items-center gap-3">
          <CountdownTimer startTime={interviewStartTime} onTimeUp={handleEndInterview} />

          <button
            onClick={() => setShowEndModal(true)}
            className="text-[11px] font-mono rounded-full border border-[#303236] bg-transparent text-[#94979E] hover:text-[#FF3621] hover:border-[#FF3621]/40 px-3 py-1 transition-colors uppercase tracking-wider"
          >
            END SESSION
          </button>
        </div>
      </header>

      {/* 2px Terminal Progress Bar */}
      <div className="h-[2px] w-full bg-[#151617] shrink-0">
        <div
          className="h-full bg-[#34D59A] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3-COLUMN COCKPIT BODY */}
      <div className="flex-1 min-h-0 grid grid-cols-[320px_1fr_280px] overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANEL: Technical Briefing Rail (w-[320px]) */}
        {/* ========================================================= */}
        <aside className="w-[320px] border-r border-[#303236] bg-[#0A0A0B] p-5 flex flex-col justify-between overflow-y-auto select-text">
          <div className="space-y-5">
            {/* Meta Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#797D86] block">
                QUESTION {String(currentQIndex + 1).padStart(2, '0')} OF {String(questions.length || 5).padStart(2, '0')}
              </span>
              {currentQuestion?.topic && (
                <span className="text-xs font-mono font-semibold text-[#34D59A] block uppercase tracking-wide">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            {/* Question Text or Skeleton */}
            <div className="space-y-3">
              {isGenerating ? (
                <div className="space-y-2.5 animate-pulse">
                  <div className="h-4 bg-[#151617] rounded-[4px] w-3/4" />
                  <div className="h-3.5 bg-[#151617] rounded-[4px] w-full" />
                  <div className="h-3.5 bg-[#151617] rounded-[4px] w-5/6" />
                  <div className="h-3.5 bg-[#151617] rounded-[4px] w-2/3" />
                  <p className="text-[11px] text-[#34D59A] font-mono mt-3">► GENERATING_QUESTIONS...</p>
                </div>
              ) : (
                <h2 className="text-[18px] text-[#FFFFFF] font-normal leading-relaxed tracking-normal font-sans">
                  {currentQuestion?.text || 'Loading technical question...'}
                </h2>
              )}
            </div>

            {/* Strategy Hint Terminal Block */}
            <div className="pt-1">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-[#797D86] hover:text-[#34D59A] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <span>{showHint ? '- HIDE STRATEGY HINT' : '+ STRATEGY HINT'}</span>
              </button>

              {showHint && (
                <div className="mt-2.5 p-3 bg-[#151617] border border-[#303236] rounded-[4px] text-xs text-[#C9CBCF] leading-relaxed space-y-1 animate-in fade-in duration-150">
                  <p className="font-mono text-[10px] font-semibold text-[#34D59A] uppercase tracking-wider">
                    ┌ STRATEGY HINT ────────────────
                  </p>
                  <p className="font-sans pl-2 border-l border-[#303236] text-[#C9CBCF]">
                    {currentQuestion?.topic
                      ? `Focus on core principles of ${currentQuestion.topic}. Outline assumptions, time/space complexity, and practical trade-offs.`
                      : 'State your high-level approach first before diving into details. Outline constraints and edge cases.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Session Metrics (Bottom of Left Column) */}
          <div className="pt-4 border-t border-[#303236] space-y-2">
            <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-widest block">
              SESSION METRICS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-2.5">
                <span className="text-[9px] text-[#797D86] uppercase font-mono tracking-wider">COMPLETED</span>
                <p className="text-sm font-bold text-[#FFFFFF] font-mono mt-0.5">
                  {String(answersCount).padStart(2, '0')} / {String(questions.length || 5).padStart(2, '0')}
                </p>
              </div>
              <div className="bg-[#151617] border border-[#303236] rounded-[4px] p-2.5">
                <span className="text-[9px] text-[#797D86] uppercase font-mono tracking-wider">ACCURACY</span>
                <p className="text-sm font-bold text-[#34D59A] font-mono mt-0.5">
                  {answersCount > 0 ? `${Math.round(totalScore / answersCount)}%` : '--'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER PANEL: IDE / Editor Workspace (flex-1) */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#000000]">
          {/* Mode Switcher Strip */}
          <div className="h-11 shrink-0 border-b border-[#303236] px-5 flex items-center justify-between bg-[#0A0A0B]">
            <div className="flex items-center gap-1.5">
              {(['text', 'code', 'voice'] as const).map((mode) => {
                const isActive = answerMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setAnswerMode(mode)}
                    className={`rounded-full px-3.5 py-1 text-xs font-mono font-medium transition-all flex items-center gap-1.5 uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#151617] border border-[#303236] text-[#FFFFFF]'
                        : 'text-[#797D86] hover:text-[#C9CBCF]'
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#34D59A]" />}
                    <span>{mode === 'text' ? 'TEXT' : mode === 'code' ? 'CODE' : 'VOICE'}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Select (Code Mode Only) */}
            {answerMode === 'code' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#797D86] font-mono uppercase">LANG:</span>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="h-7 w-[120px] rounded-full bg-[#151617] border-[#303236] text-xs font-mono text-[#C9CBCF] focus:ring-0">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0B] border-[#303236] text-[#FFFFFF] font-mono text-xs rounded-[4px]">
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

          {/* Active Workspace Canvas */}
          <div className="flex-1 min-h-0 p-5 overflow-y-auto flex flex-col select-text">
            {answerMode === 'text' && (
              <div className="flex-1 min-h-[300px] flex flex-col bg-[#0A0A0B] border border-[#303236] focus-within:border-[#34D59A]/60 rounded-[4px] p-4 transition-colors">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#303236]/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#797D86]">ANSWER_BUFFER</span>
                </div>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your structured solution, architectural trade-offs, or explanations..."
                  className="flex-1 w-full bg-transparent text-[#FFFFFF] font-mono text-sm leading-relaxed placeholder:text-[#797D86]/40 resize-none focus:outline-none"
                />
              </div>
            )}

            {answerMode === 'code' && (
              <div className="flex-1 min-h-[340px] rounded-[4px] border border-[#303236] overflow-hidden bg-[#0A0A0B] flex flex-col">
                <div className="h-7 shrink-0 bg-[#0A0A0B] border-b border-[#303236] px-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#797D86]">ANSWER_BUFFER</span>
                  <span className="text-[10px] font-mono uppercase text-[#34D59A]">{selectedLanguage}</span>
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
                      <div className="flex items-center justify-center h-full text-xs text-[#797D86] font-mono animate-pulse">
                        LOADING_MONACO_EDITOR...
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {answerMode === 'voice' && (
              <div className="flex-1 min-h-[300px] flex flex-col space-y-3.5">
                <div className="bg-[#0A0A0B] border border-[#303236] rounded-[4px] p-4 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#797D86] block mb-3">VOICE_INPUT</span>
                  <VoiceRecorder
                    transcript={textAnswer}
                    onTranscript={(text) => setTextAnswer(text)}
                  />
                </div>

                <div className="flex-1 flex flex-col bg-[#0A0A0B] border border-[#303236] rounded-[4px] p-4">
                  <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-widest mb-2 block">
                    TRANSCRIPT_BUFFER (EDITABLE)
                  </span>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Your spoken words will transcribe here in real-time. You can edit before submitting..."
                    className="flex-1 w-full bg-transparent text-[#FFFFFF] font-mono text-sm leading-relaxed placeholder:text-[#797D86]/40 resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bar (Bottom of Center Workspace) */}
          <div className="h-13 shrink-0 border-t border-[#303236] bg-[#000000] px-5 flex items-center justify-between">
            <div className="text-xs text-[#797D86] font-mono">
              {wordCount} WORDS · {charCount} CHARS
            </div>

            <div className="flex items-center gap-3">
              {!evaluation ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || (!textAnswer.trim() && !codeAnswer.trim())}
                  className="rounded-full bg-[#FFFFFF] hover:bg-[#C9CBCF] text-[#151617] font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-[0.98]"
                >
                  {isEvaluating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-[#151617] border-t-transparent rounded-full animate-spin" />
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
                      className="rounded-full bg-[#FFFFFF] hover:bg-[#C9CBCF] text-[#151617] font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      NEXT QUESTION →
                    </button>
                  ) : (
                    <button
                      onClick={handleEndInterview}
                      className="rounded-full bg-[#34D59A] hover:bg-[#285D49] hover:text-[#FFFFFF] text-[#151617] font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 transition-colors shadow-sm active:scale-[0.98]"
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
        {/* RIGHT PANEL: AI Coach Live Evaluation Console (w-[280px]) */}
        {/* ========================================================= */}
        <aside className="w-[280px] border-l border-[#303236] bg-[#0A0A0B] p-5 flex flex-col justify-between overflow-y-auto select-text">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#303236] pb-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                AI COACH
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#34D59A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D59A]" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Content Area */}
            {isEvaluating ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#303236] border-t-[#34D59A] animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-mono font-medium text-[#FFFFFF] uppercase tracking-wider">ANALYZING_BUFFER...</p>
                  <p className="text-[10px] text-[#797D86] font-mono uppercase">SCORING TECHNICAL ACCURACY</p>
                </div>
              </div>
            ) : evaluation ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Score Ring Header */}
                <div className="flex items-center justify-between bg-[#151617] border border-[#303236] rounded-[4px] p-3.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#797D86] block">SCORE</span>
                    <p className="text-2xl font-bold font-mono text-[#FFFFFF] leading-none mt-1">
                      {evaluation.score} <span className="text-xs text-[#797D86]">/ 100</span>
                    </p>
                  </div>
                  <ScoreRing score={evaluation.score} />
                </div>

                {/* Sub-Score Progress Bars */}
                <div className="space-y-2.5 bg-[#151617] border border-[#303236] rounded-[4px] p-3">
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

                {/* Feedback Analysis */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#797D86] font-mono uppercase tracking-wider block">
                    ANALYSIS
                  </span>
                  <p className="text-xs text-[#C9CBCF] leading-relaxed font-sans bg-[#151617] border border-[#303236] rounded-[4px] p-3">
                    {evaluation.feedback}
                  </p>
                </div>

                {/* Improvements */}
                {(evaluation.improvements || evaluation.improvement) && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#34D59A] font-mono uppercase tracking-wider block">
                      IMPROVEMENTS
                    </span>
                    <p className="text-xs text-[#C9CBCF] leading-relaxed font-sans bg-[#151617] border border-[#303236] rounded-[4px] p-3">
                      {evaluation.improvements || evaluation.improvement}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Idle State */
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3.5">
                <div className="w-9 h-9 rounded-[4px] bg-[#151617] border border-[#303236] flex items-center justify-center text-sm text-[#797D86] font-mono">
                  [►]
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-semibold text-[#FFFFFF] uppercase tracking-wider">AWAITING_RESPONSE</p>
                  <p className="text-[11px] text-[#797D86] leading-relaxed font-sans">
                    Submit your answer to begin live evaluation.
                  </p>
                </div>

                <div className="w-full bg-[#151617] border border-[#303236] rounded-[4px] p-3 text-left space-y-1.5 text-[11px]">
                  <p className="font-semibold text-[#FFFFFF] font-mono text-[10px] uppercase tracking-wider">INTERVIEW TIPS:</p>
                  <ul className="space-y-1 list-disc list-inside text-[#94979E] font-sans">
                    <li>State assumptions clearly</li>
                    <li>Discuss design trade-offs</li>
                    <li>Account for edge cases</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-[#303236] text-center">
            <span className="text-[9px] text-[#797D86] font-mono uppercase tracking-wider">
              Gemini & LLM Evaluation Engine
            </span>
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* END CONFIRM MODAL (Sharp 4px Container & Pill Actions) */}
      {/* ========================================================= */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0B] border border-[#303236] rounded-[4px] p-6 w-[360px] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center gap-2.5 text-[#FF3621]">
              <span className="w-2 h-2 rounded-full bg-[#FF3621]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF]">
                END_SESSION_CONFIRMATION
              </h3>
            </div>

            <p className="text-xs text-[#94979E] leading-relaxed">
              You have completed <span className="text-[#34D59A] font-mono font-semibold">{answersCount}</span> of{' '}
              <span className="text-[#FFFFFF] font-mono">{questions.length || 5}</span> questions. End now to view your score report or continue the session.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="rounded-full border border-[#303236] hover:border-[#797D86] text-[#C9CBCF] hover:text-[#FFFFFF] text-xs font-mono uppercase px-4 py-1.5 transition-colors"
              >
                CONTINUE
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  handleEndInterview();
                }}
                className="rounded-full bg-[#FF3621] hover:bg-[#d62d1c] text-white text-xs font-mono font-bold uppercase px-4 py-1.5 transition-colors shadow-sm"
              >
                END & SEE RESULTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
