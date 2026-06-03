'use client'

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
} from "@/components/ui/select";

interface Question {
  id: string;
  text: string;
  type: 'technical' | 'behavioral' | 'system-design';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface EvaluationResult {
  score: number;
  feedback: string;
  improvement: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewRoomProps {
  interview: any
  profile: any
}

const INTERVIEW_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const URGENT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function buildResumeContext(): string {
  return 'Software Engineer with 5+ years experience in full-stack development, React, Node.js, TypeScript';
}

/**
 * Countdown Timer Component with Modern Styling
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
    <div className={`text-lg font-mono font-bold tracking-wider ${isUrgent ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
      {displayTime}
    </div>
  );
}

/**
 * Voice Recording Component with Modern Styling
 */
function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      if (finalTranscript !== transcript) {
        setTranscript(finalTranscript);
        onTranscript(finalTranscript);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [transcript, onTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscript('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${isRecording
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
            }`}
        >
          {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
        </Button>
        <Button
          onClick={clearTranscript}
          className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
        >
          Clear
        </Button>
      </div>
      {isRecording && <p className="text-sm text-blue-600 font-medium animate-pulse">● Recording...</p>}
    </div>
  );
}

/**
 * Main InterviewRoom Component with Modern 3-Column Bento Grid Layout
 */
export function InterviewRoom({ interview, profile }: InterviewRoomProps) {
  const router = useRouter();
  const resumeContext = buildResumeContext();
  const interviewType = 'technical';

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
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

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
          resumeContext,
          count: 5,
        });

        if (mounted && Array.isArray(data.questions)) {
          setQuestions(data.questions as Question[]);
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
  }, [interviewType, resumeContext]);

  const handleSubmitAnswer = async () => {
    if ((!textAnswer.trim() && !codeAnswer.trim()) || !questions[currentQIndex]) return;

    const q = questions[currentQIndex];

    setIsEvaluating(true);
    try {
      const result = await fetchInterviewApi({
        mode: 'evaluate',
        question: q,
        textAnswer: textAnswer,
        codeAnswer: codeAnswer,
        resumeContext,
        answerType: answerMode,
        language: selectedLanguage,
      });

      const evaluationResult = result.evaluation as EvaluationResult;
      setEvaluation(evaluationResult);
      setTotalScore((prev) => prev + (evaluationResult?.score ?? 0));
      setAnswersCount((prev) => prev + 1);
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
    setCurrentQIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const handleEndInterview = async () => {
    setIsInterviewEnded(true);

    try {
      const avgScore = answersCount > 0 ? Math.round(totalScore / answersCount) : 0;
      await fetchInterviewApi({
        mode: 'report',
        resumeContext,
        sessionHistory: chatHistory,
      });

      const feedbackText = `Completed ${answersCount} questions with an average score of ${avgScore}/10.`;
      setTimeout(() => {
        router.push(`/interview-results?score=${avgScore}&feedback=${encodeURIComponent(feedbackText)}`);
      }, 1500);
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

  if (isInterviewEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/80 border border-white/20 rounded-2xl p-8 text-center max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
          <p className="text-gray-600 mb-4">
            Average Score: <span className="text-blue-600 font-bold text-2xl">{answersCount > 0 ? Math.round(totalScore / answersCount) : 0}/10</span>
          </p>
          <p className="text-gray-500 mb-6">Redirecting to results...</p>
          <div className="animate-pulse text-blue-600 text-2xl">⏳</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Interview Room</h1>
            <span className="text-sm font-mono text-gray-500">Q{currentQIndex + 1}/{questions.length || '-'}</span>
          </div>
          <div className="flex items-center gap-6">
            <CountdownTimer startTime={interviewStartTime} onTimeUp={handleEndInterview} />
            <Button
              onClick={handleEndInterview}
              className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all shadow-lg"
            >
              ⏹ End Interview
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3-Column Bento Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-150px)]">
          {/* Left Column: Question Panel */}
          <div className="col-span-2 space-y-6 overflow-y-auto">
            {/* Question Card */}
            <div className="backdrop-blur-md bg-white/80 border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Question</span>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {questions[currentQIndex]?.type.replace('-', ' ').toUpperCase() || 'LOADING'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${questions[currentQIndex]?.difficulty === 'easy'
                      ? 'bg-green-100 text-green-700'
                      : questions[currentQIndex]?.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {questions[currentQIndex]?.difficulty.toUpperCase() || 'LOADING'}
                    </span>
                  </div>
                </div>
              </div>

              {isGenerating ? (
                <p className="text-blue-600 font-medium animate-pulse">⏳ Generating questions...</p>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {questions[currentQIndex]?.text || 'Loading...'}
                </h2>
              )}
            </div>

            {/* Answer Mode Selector */}
            <div className="flex gap-3">
              {(['text', 'voice', 'code'] as const).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setAnswerMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${answerMode === mode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/60 text-gray-700 border border-white/40 hover:bg-white/80'
                    }`}
                >
                  {mode === 'text' ? '📝 Text' : mode === 'voice' ? '🎤 Voice' : '💻 Code'}
                </Button>
              ))}
            </div>

            {/* Answer Input Area */}
            <div className="backdrop-blur-md bg-white/80 border border-white/20 rounded-2xl p-8 shadow-lg">
              {answerMode === 'voice' ? (
                <>
                  <VoiceRecorder onTranscript={setTextAnswer} />
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Your voice transcript will appear here... You can edit it before submitting."
                    className="w-full mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </>
              ) : answerMode === 'code' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Language:</span>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border border-gray-200 overflow-hidden h-[400px]">
                    <Editor
                      height="100%"
                      language={selectedLanguage}
                      theme="vs-dark"
                      value={codeAnswer}
                      onChange={(val) => setCodeAnswer(val || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={8}
                />
              )}

              {/* Submit or Next */}
              {!evaluation ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || (!textAnswer.trim() && !codeAnswer.trim())}
                  className="w-full mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEvaluating ? '⏳ Evaluating...' : '✓ Submit Answer'}
                </Button>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="backdrop-blur-md bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-6">
                    <div className="mb-4">
                      <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">Score</p>
                      <p className="text-4xl font-bold text-blue-600">{evaluation.score}/10</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">Feedback</p>
                      <p className="text-gray-900 leading-relaxed">{evaluation.feedback}</p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-2">Improvement</p>
                      <p className="text-gray-900 leading-relaxed">{evaluation.improvement}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {currentQIndex < questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg transition-all"
                      >
                        → Next Question
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEndInterview}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-lg transition-all"
                      >
                        ✓ Finish Interview
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
