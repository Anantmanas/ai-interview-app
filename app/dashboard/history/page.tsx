import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  Mic,
  History as HistoryIcon
} from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interview History</h1>
          <p className="text-muted-foreground">
            Review your past interviews and track your progress
          </p>
        </div>
        <Button asChild>
          <Link href="/interview/new">
            <Mic className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>

      {interviews && interviews.length > 0 ? (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{interview.title}</h3>
                      <Badge variant={interview.status === 'completed' ? 'default' : 'secondary'}>
                        {interview.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(interview.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(interview.duration_seconds)}
                      </span>
                      <Badge variant="outline">
                        {interview.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {interview.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {interview.overall_score !== null && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {interview.overall_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={interview.status === 'completed' ? `/dashboard/history/${interview.id}` : `/interview/${interview.id}`}>
                        {interview.status === 'completed' ? 'View Results' : 'Resume Interview'}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your first practice interview to begin tracking your progress
            </p>
            <Button asChild>
              <Link href="/interview/new">
                Start Your First Interview
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
