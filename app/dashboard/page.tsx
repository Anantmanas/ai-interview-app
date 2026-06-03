import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Mic,
  Clock,
  Target,
  TrendingUp,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { ResumeUploadCard } from '@/components/dashboard/resume-upload-card'


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch dashboard stats
  const [
    { data: profile },
    { data: interviews },
    { data: weaknesses },
    { data: roadmapItems },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('interviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('user_weaknesses').select('*').eq('user_id', user.id).order('weakness_score', { ascending: false }),
    supabase.from('roadmap_items').select('*').eq('user_id', user.id),
  ])

  const completedInterviews = interviews?.filter(i => i.status === 'completed') ?? []
  const averageScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.overall_score ?? 0), 0) / completedInterviews.length)
    : 0
  const totalPracticeTime = interviews?.reduce((sum, i) => sum + (i.duration_seconds ?? 0), 0) ?? 0
  const practiceHours = Math.round(totalPracticeTime / 3600 * 10) / 10

  const completedRoadmapItems = roadmapItems?.filter(r => r.status === 'completed').length ?? 0
  const totalRoadmapItems = roadmapItems?.length ?? 0
  const roadmapProgress = totalRoadmapItems > 0 ? Math.round((completedRoadmapItems / totalRoadmapItems) * 100) : 0

  const recentInterviews = interviews?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Ready to practice? Start a new interview session or review your progress.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/interview/new">
            <Mic className="mr-2 h-5 w-5" />
            Start Interview
          </Link>
        </Button>
      </div>

      {/* AI Resume Upload & Insights */}
      <ResumeUploadCard />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {completedInterviews.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <Progress value={averageScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total time spent practicing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Weaknesses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weaknesses?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Areas to improve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Interviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Interviews</CardTitle>
                <CardDescription>Your latest practice sessions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/history">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInterviews.length > 0 ? (
              <div className="space-y-4">
                {recentInterviews.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`/interview/${interview.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        interview.status === 'completed' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {interview.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{interview.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={interview.status === 'completed' ? 'default' : 'secondary'}>
                        {interview.status === 'completed' && interview.overall_score !== null
                          ? `${interview.overall_score}%`
                          : interview.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No interviews yet</p>
                <p className="text-sm">Start your first practice session!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses & Roadmap */}
        <div className="space-y-6">
          {/* Top Weaknesses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Weaknesses</CardTitle>
                  <CardDescription>Areas that need attention</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/roadmap">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {weaknesses && weaknesses.length > 0 ? (
                <div className="space-y-3">
                  {weaknesses.slice(0, 4).map((weakness) => (
                    <div
                      key={weakness.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${
                          weakness.weakness_score > 70 
                            ? 'text-destructive' 
                            : weakness.weakness_score > 40
                            ? 'text-orange-500'
                            : 'text-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{weakness.topic}</p>
                          <p className="text-xs text-muted-foreground">{weakness.subtopic}</p>
                        </div>
                      </div>
                      <Badge variant={
                        weakness.weakness_score > 70 
                          ? 'destructive' 
                          : weakness.weakness_score > 40
                          ? 'secondary'
                          : 'outline'
                      }>
                        {weakness.weakness_score > 70 ? 'Critical' : weakness.weakness_score > 40 ? 'Moderate' : 'Low'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No weaknesses identified yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Roadmap Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Your personalized roadmap</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/roadmap">
                    View roadmap
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{roadmapProgress}%</span>
                </div>
                <Progress value={roadmapProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {completedRoadmapItems} of {totalRoadmapItems} items completed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

