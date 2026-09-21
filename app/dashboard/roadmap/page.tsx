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
import { MacTrafficLights } from '@/components/ui/terminal-card'

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
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item))

    try {
      const { error } = await supabase
        .from('roadmap_items')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) {
        toast.error('Failed to update task')
        setItems(items.map(item => item.id === id ? { ...item, status: currentStatus } : item))
      } else {
        toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened')
      }
    } catch {
      toast.error('Error updating task')
      setItems(items.map(item => item.id === id ? { ...item, status: currentStatus } : item))
    }
  }

  const completedCount = items.filter(i => i.status === 'completed').length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// CURATED SYLLABUS</p>
          <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Learning Roadmap</h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-1">
            Personalized curriculum dynamically generated based on your past interview performance.
          </p>
        </div>
        <button 
          onClick={handleGenerateRoadmap} 
          disabled={isGenerating}
          className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-5 py-2.5 rounded-[6px] disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Refresh Roadmap
            </>
          )}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 h-8 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
                <MacTrafficLights size="sm" />
                <span className="font-mono text-[10px] text-[#6b7280]">progress.sh</span>
              </div>
              <div className="p-5">
                <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.1em] mb-3 font-semibold">OVERALL PROGRESS</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="font-display text-[32px] font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent">{Math.round(progress)}%</span>
                    <span className="text-[11px] text-[#64748b]">{completedCount}/{items.length} Tasks</span>
                  </div>
                  <div className="h-2 w-full bg-[#09090e] rounded-full overflow-hidden border border-[#1e1e2f]">
                    <div
                      className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`rounded-xl border transition-all overflow-hidden ${
                  item.status === 'completed'
                    ? 'border-[#1e2030] bg-[#09090f]/75 opacity-80'
                    : 'border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3730a3]'
                }`}
              >
                {/* Apple Terminal Titlebar */}
                <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
                  <div className="flex items-center gap-2.5">
                    <MacTrafficLights size="sm" />
                    <span className="font-mono text-[10px] text-[#9ca3af]">
                      task-{item.priority}.sh // {item.topic}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] uppercase rounded px-2 py-0.5 font-semibold ${
                    item.priority <= 2
                      ? 'text-[#f87171] bg-[#2a0e15] border border-[#5c1d28]'
                      : 'text-[#818cf8] bg-[#14142b] border border-[#3730a3]'
                  }`}>
                    Priority {item.priority}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className={`font-display text-[16px] font-semibold text-[#ffffff] ${
                      item.status === 'completed' ? 'line-through text-[#64748b]' : ''
                    }`}>
                      {item.title}
                    </h3>
                    <button
                      onClick={() => toggleStatus(item.id, item.status)}
                      className={`h-8 px-3 rounded-md font-mono text-[11px] uppercase tracking-[0.05em] border transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        item.status === 'completed'
                          ? 'bg-[#14142b] text-[#818cf8] border-[#3730a3]'
                          : 'bg-[#09090e] text-[#9ca3af] border-[#1e1e2f] hover:text-white hover:border-[#3730a3]'
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

                  <p className="font-body text-[13px] text-[#9ca3af] leading-relaxed mb-4">
                    {item.description}
                  </p>
                
                  <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#64748b]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#818cf8]" />
                      <span>~{item.estimated_hours || 2}h runtime</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#818cf8]" />
                      <span>{item.resources?.length || 0} Resources</span>
                    </div>
                  </div>
                </div>

                {item.status !== 'completed' && item.resources && item.resources.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 mt-3 border-t border-[#1e1e2f]">
                    {item.resources.map((res: any, idx: number) => (
                      <a 
                        key={idx}
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-md bg-[#09090e] border border-[#1e1e2f] hover:border-[#3730a3] hover:bg-[#14142b] transition-all group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-body text-[12px] text-[#f8fafc] truncate group-hover:text-[#818cf8] transition-colors">{res.title}</p>
                          <p className="font-mono text-[10px] text-[#64748b] uppercase">{res.type}</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-[#64748b] group-hover:text-[#818cf8] shrink-0" />
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
          <div className="h-12 w-12 bg-[#14142b] border border-[#3730a3] rounded-full flex items-center justify-center mx-auto mb-4 text-[#818cf8] shadow-[0_0_15px_rgba(79,70,229,0.25)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="font-mono text-[12px] text-[#64748b] uppercase tracking-[0.05em]">// NO ROADMAP GENERATED</p>
          <p className="font-body text-[14px] text-[#9ca3af] mt-2 max-w-sm mx-auto mb-6">
            Complete an interview first, or click the button below to generate a roadmap based on your profile and weaknesses.
          </p>
          <button 
            onClick={handleGenerateRoadmap} 
            disabled={isGenerating}
            className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-3 rounded-md cursor-pointer disabled:opacity-50"
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate Roadmap
          </button>
        </div>
      )}
    </div>
  )
}
