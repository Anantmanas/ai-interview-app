'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Loader2,
  Trophy
} from 'lucide-react'

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRoadmap()
  }, [])

  async function fetchRoadmap() {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
      setItems(data || [])
    }
    setIsLoading(false)
  }

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        toast.success(`Generated ${data.count} new roadmap items!`)
        fetchRoadmap()
      } else {
        toast.error(data.error || data.message || 'Failed to generate roadmap')
      }
    } catch (error) {
      toast.error('Error generating roadmap')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase
      .from('roadmap_items')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item))
    }
  }

  const completedCount = items.filter(i => i.status === 'completed').length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            AI-generated study plan based on your interview performance.
          </p>
        </div>
        <Button 
          onClick={handleGenerateRoadmap} 
          disabled={isGenerating}
          className="bg-primary hover:bg-primary/90"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate New Plan
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold">{Math.round(progress)}%</span>
                    <span className="text-xs text-muted-foreground">{completedCount}/{items.length} Tasks</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Filters</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer">All Topics</Badge>
                <Badge variant="outline" className="cursor-pointer">Coding</Badge>
                <Badge variant="outline" className="cursor-pointer">System Design</Badge>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id} className={item.status === 'completed' ? 'opacity-70 bg-muted/30' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.priority <= 2 ? "destructive" : "secondary"}>
                            Priority {item.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground capitalize">{item.topic}</span>
                        </div>
                        <CardTitle className={item.status === 'completed' ? 'line-through' : ''}>
                          {item.title}
                        </CardTitle>
                      </div>
                      <Button
                        variant={item.status === 'completed' ? 'default' : 'outline'}
                        size="icon"
                        className="rounded-full h-10 w-10 shrink-0"
                        onClick={() => toggleStatus(item.id, item.status)}
                      >
                        {item.status === 'completed' ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>~{item.estimated_hours} hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{item.resources?.length || 0} Resources</span>
                      </div>
                    </div>

                    {item.status !== 'completed' && item.resources && item.resources.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {item.resources.map((res: any, idx: number) => (
                          <a 
                            key={idx}
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <ExternalLink className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{res.title}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{res.type}</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>No roadmap items yet</CardTitle>
          <CardDescription className="mt-2 max-w-sm mx-auto">
            Complete an interview first, or click the button above to generate a roadmap based on your profile and weaknesses.
          </CardDescription>
          <Button onClick={handleGenerateRoadmap} className="mt-8" disabled={isGenerating}>
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate Roadmap
          </Button>
        </Card>
      )}
    </div>
  )
}
