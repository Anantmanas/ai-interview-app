import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  User,
  Star,
  Trophy
} from 'lucide-react'

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single()

  if (!interview) {
    notFound()
  }

  const { data: questions } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('interview_id', id)
    .order('sequence_order', { ascending: true })

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{interview.title}</h1>
            <Badge variant="outline">{interview.type.replace('_', ' ')}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(interview.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(interview.duration_seconds)}
            </span>
            <span className="flex items-center gap-1 font-medium capitalize">
              Difficulty: {interview.difficulty}
            </span>
          </div>
        </div>
        
        {interview.overall_score !== null && (
          <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 pr-8">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{interview.overall_score}%</div>
              <div className="text-sm font-medium text-muted-foreground">Overall Score</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Question Review */}
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Question-by-Question Review
          </h2>
          
          {questions && questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <Card key={q.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                          {i + 1}
                        </Badge>
                        <CardTitle className="text-base">{q.question_text}</CardTitle>
                      </div>
                      {q.ai_evaluation?.score !== undefined && (
                        <Badge variant={q.ai_evaluation.score >= 70 ? 'default' : 'destructive'}>
                          {q.ai_evaluation.score}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" /> Your Answer
                      </p>
                      <p className="text-sm italic">{q.user_answer || "No answer provided"}</p>
                    </div>
                    
                    {q.ai_evaluation && (
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary uppercase mb-1 flex items-center gap-1">
                          <BrainCircuit className="h-3 w-3" /> AI Feedback
                        </p>
                        <p className="text-sm leading-relaxed">{q.ai_evaluation.feedback}</p>
                        {q.ai_evaluation.technical_accuracy && (
                          <div className="mt-2 pt-2 border-t border-primary/10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Technical Accuracy</p>
                            <p className="text-xs text-muted-foreground">{q.ai_evaluation.technical_accuracy}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No questions recorded for this interview.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Strengths & Weaknesses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {interview.strengths && interview.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5 text-green-600">
                    <Star className="h-4 w-4" /> Key Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {interview.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {interview.weaknesses && interview.weaknesses.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="h-4 w-4" /> Areas for Improvement
                  </h4>
                  <ul className="space-y-1.5">
                    {interview.weaknesses.map((w: any, i: number) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <div>
                          <span className="font-semibold">{w.topic}:</span> {w.feedback}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!interview.strengths && !interview.weaknesses && (
                <div className="text-sm text-muted-foreground italic">
                  Complete an evaluation to see strengths and weaknesses.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
