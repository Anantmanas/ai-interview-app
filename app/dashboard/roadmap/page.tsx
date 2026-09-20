'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  BookOpen, 
  ExternalLink, 
  Clock, 
  Sparkles,
  Loader2,
  Check
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
    } catch {
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
        <Loader2 className="h-6 w-6 animate-spin text-[#a855f7]" />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-[#c084fc] uppercase tracking-[0.15em] mb-1 font-semibold">// CURATED SYLLABUS</p>
          <h1 className="font-display text-[32px] font-bold text-[#fdfcff] leading-[1.1] tracking-[-0.02em]">Learning Roadmap</h1>
          <p className="font-body text-[14px] text-[#c8c0e0] mt-1">
            AI-generated study plan dynamically adapted to your mock interview performance.
          </p>
        </div>
        <button 
          onClick={handleGenerateRoadmap} 
          disabled={isGenerating}
          className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-[6px] cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate New Plan
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="card-console p-5 border-[#3b1d66]">
              <p className="font-mono text-[10px] text-[#948bb0] uppercase tracking-[0.1em] mb-3 font-semibold">OVERALL PROGRESS</p>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="font-display text-[32px] font-bold bg-gradient-to-r from-[#c084fc] to-[#a855f7] bg-clip-text text-transparent">{Math.round(progress)}%</span>
                  <span className="text-[11px] text-[#948bb0]">{completedCount}/{items.length} Tasks</span>
                </div>
                <div className="h-2 w-full bg-[#140e24] rounded-full overflow-hidden border border-[#291a45]">
                  <div
                    className="h-full bg-gradient-to-r from-[#9333ea] to-[#c084fc] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`card-console p-5 transition-all ${
                  item.status === 'completed' ? 'border-[#3b1d66]/60 bg-[#0d0918]/90 opacity-80' : 'hover:border-[#a855f7]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase rounded-[4px] px-2 py-0.5 font-semibold ${
                        item.priority <= 2
                          ? 'text-[#f87171] bg-[#2a0e15] border border-[#5c1d28]'
                          : 'text-[#c084fc] bg-[#201138] border border-[#4c1d95]'
                      }`}>
                        Priority {item.priority}
                      </span>
                      <span className="font-mono text-[11px] text-[#948bb0] uppercase tracking-[0.05em]">{item.topic}</span>
                    </div>
                    <h3 className={`font-display text-[16px] font-semibold text-[#fdfcff] ${
                      item.status === 'completed' ? 'line-through text-[#50446b]' : ''
                    }`}>
                      {item.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`h-8 px-3 rounded-[6px] font-mono text-[11px] uppercase tracking-[0.05em] border transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      item.status === 'completed'
                        ? 'bg-[#201138] text-[#c084fc] border-[#4c1d95]'
                        : 'bg-[#140e24] text-[#948bb0] border-[#291a45] hover:text-[#fdfcff] hover:border-[#4c1d95]'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Done
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </button>
                </div>

                <p className="font-body text-[13px] text-[#948bb0] leading-relaxed mb-4">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#50446b]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#948bb0]" />
                    <span>~{item.estimated_hours} hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-[#948bb0]" />
                    <span>{item.resources?.length || 0} Resources</span>
                  </div>
                </div>

                {item.status !== 'completed' && item.resources && item.resources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 mt-3 border-t border-[#140e24]">
                    {item.resources.map((res: any, idx: number) => (
                      <a 
                        key={idx}
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#140e24] border border-[#291a45] hover:border-[#a855f7] hover:bg-[#1b1330] transition-all group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-body text-[12px] text-[#f5f3ff] truncate group-hover:text-[#c084fc] transition-colors">{res.title}</p>
                          <p className="font-mono text-[10px] text-[#50446b] uppercase">{res.type}</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-[#948bb0] group-hover:text-[#c084fc] shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-console p-16 text-center">
          <div className="h-12 w-12 bg-[#140e24] border border-[#3b1d66] rounded-full flex items-center justify-center mx-auto mb-4 text-[#c084fc] shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="font-mono text-[12px] text-[#50446b] uppercase tracking-[0.05em]">// NO ROADMAP GENERATED</p>
          <p className="font-body text-[14px] text-[#948bb0] mt-2 max-w-sm mx-auto mb-6">
            Complete an interview first, or click the button below to generate a roadmap based on your profile and weaknesses.
          </p>
          <button 
            onClick={handleGenerateRoadmap} 
            disabled={isGenerating}
            className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-3 rounded-[6px] cursor-pointer disabled:opacity-50"
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate Roadmap
          </button>
        </div>
      )}
    </div>
  )
}
