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
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Code2,
  Trophy,
  Target,
  Zap,
} from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Resource {
  type: 'video' | 'docs' | 'practice'
  title: string
  url: string
  thumbnail?: string
  channel?: string
  duration?: string
}

interface RoadmapItem {
  id: string
  topic: string
  title: string
  description: string
  resources: Resource[]
  priority: number
  estimated_hours: number
  weakness_score?: number
  status: 'pending' | 'completed'
  completed_at?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function priorityLabel(p: number): { label: string; color: string; bg: string; border: string } {
  if (p <= 1) return { label: 'Priority 1 — Critical', color: '#f87171', bg: '#2a0e15', border: '#5c1d28' }
  if (p <= 2) return { label: 'Priority 2 — High', color: '#fb923c', bg: '#2a1608', border: '#7c2d12' }
  if (p <= 3) return { label: 'Priority 3 — Medium', color: '#fbbf24', bg: '#1c1608', border: '#78350f' }
  if (p <= 4) return { label: 'Priority 4 — Low', color: '#34d399', bg: '#052016', border: '#065f46' }
  return { label: 'Priority 5 — Optional', color: '#818cf8', bg: '#14142b', border: '#3730a3' }
}

function resourceIcon(type: Resource['type']) {
  if (type === 'video') return <Play className="h-3.5 w-3.5" />
  if (type === 'docs') return <FileText className="h-3.5 w-3.5" />
  return <Code2 className="h-3.5 w-3.5" />
}

function resourceColor(type: Resource['type']): string {
  if (type === 'video') return '#f87171'
  if (type === 'docs') return '#60a5fa'
  return '#34d399'
}

function resourceLabel(type: Resource['type']): string {
  if (type === 'video') return 'VIDEO'
  if (type === 'docs') return 'DOCS'
  return 'PRACTICE'
}

function weaknessBar(score?: number) {
  if (!score) return null
  const pct = Math.min(score, 100)
  const color = pct >= 70 ? '#f87171' : pct >= 50 ? '#fbbf24' : '#34d399'
  return { pct, color }
}

// ── Card Component ────────────────────────────────────────────────────────────

function RoadmapCard({
  item,
  onToggle,
}: {
  item: RoadmapItem
  onToggle: (id: string, status: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { label, color, bg, border } = priorityLabel(item.priority)
  const wb = weaknessBar(item.weakness_score)
  const completed = item.status === 'completed'

  const videoRes = item.resources?.find((r) => r.type === 'video')
  const docsRes = item.resources?.filter((r) => r.type === 'docs') || []
  const practiceRes = item.resources?.filter((r) => r.type === 'practice') || []

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        completed
          ? 'border-[#1e2030] bg-[#09090f]/60 opacity-70'
          : 'border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[#3730a3] hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)]'
      }`}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-2.5">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[10px] text-[#6b7280]">
            task-{item.priority}.sh{' '}
            <span className="text-[#9ca3af]">// {item.topic}</span>
          </span>
        </div>
        <span
          className="font-mono text-[9px] uppercase rounded px-2 py-0.5 font-bold border"
          style={{ color, background: bg, borderColor: border }}
        >
          {label}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-display text-[15px] font-semibold leading-snug ${
                completed ? 'line-through text-[#4b5563]' : 'text-white'
              }`}
            >
              {item.title}
            </h3>

            {/* Weakness score bar */}
            {wb && !completed && (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#64748b] shrink-0">
                  Weakness
                </span>
                <div className="flex-1 h-1.5 bg-[#09090e] rounded-full overflow-hidden border border-[#1e1e2f]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${wb.pct}%`, background: wb.color }}
                  />
                </div>
                <span
                  className="font-mono text-[10px] font-bold shrink-0"
                  style={{ color: wb.color }}
                >
                  {wb.pct}/100
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => onToggle(item.id, item.status)}
            className={`h-8 px-3 rounded-md font-mono text-[10px] uppercase tracking-[0.05em] border transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
              completed
                ? 'bg-[#052016] text-[#34d399] border-[#065f46]'
                : 'bg-[#09090e] text-[#9ca3af] border-[#1e1e2f] hover:text-white hover:border-[#3730a3]'
            }`}
          >
            {completed ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Done
              </>
            ) : (
              'Mark Complete'
            )}
          </button>
        </div>

        {/* Description */}
        <p className="font-body text-[13px] text-[#9ca3af] leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#64748b] mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#818cf8]" />
            <span>~{item.estimated_hours}h to improve</span>
          </div>
          {(item.resources?.length || 0) > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#818cf8]" />
                <span>{item.resources.length} Resources</span>
              </div>
            </>
          )}
        </div>

        {/* Featured YouTube Video */}
        {!completed && videoRes && (
          <a
            href={videoRes.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 mb-3 rounded-lg bg-[#12060a] border border-[#3b1318] hover:border-[#f87171]/60 hover:bg-[#1a080d] transition-all group"
          >
            {videoRes.thumbnail ? (
              <img
                src={videoRes.thumbnail}
                alt={videoRes.title}
                className="h-14 w-24 rounded object-cover shrink-0 border border-[#3b1318]"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="h-14 w-24 rounded bg-[#2a0e15] border border-[#5c1d28] shrink-0 flex items-center justify-center">
                <Play className="h-5 w-5 text-[#f87171]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Play className="h-3 w-3 text-[#f87171] shrink-0" />
                <span className="font-mono text-[9px] text-[#f87171] uppercase font-bold">
                  YouTube
                </span>
                {videoRes.duration && (
                  <span className="font-mono text-[9px] text-[#64748b]">
                    • {videoRes.duration}
                  </span>
                )}
              </div>
              <p className="font-body text-[12px] text-[#f8fafc] leading-snug line-clamp-2 group-hover:text-[#f87171] transition-colors">
                {videoRes.title}
              </p>
              {videoRes.channel && (
                <p className="font-mono text-[10px] text-[#64748b] mt-0.5">
                  {videoRes.channel}
                </p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-[#64748b] group-hover:text-[#f87171] shrink-0 transition-colors" />
          </a>
        )}

        {/* Expandable: Docs + Practice */}
        {!completed && (docsRes.length > 0 || practiceRes.length > 0) && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between py-2 font-mono text-[10px] text-[#64748b] hover:text-[#818cf8] transition-colors uppercase tracking-[0.08em]"
            >
              <span>More resources ({docsRes.length + practiceRes.length})</span>
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {expanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {[...docsRes, ...practiceRes].map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-md bg-[#09090e] border border-[#1e1e2f] hover:border-[#3730a3] hover:bg-[#14142b] transition-all group"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span style={{ color: resourceColor(res.type) }}>
                          {resourceIcon(res.type)}
                        </span>
                        <span
                          className="font-mono text-[8px] uppercase font-bold"
                          style={{ color: resourceColor(res.type) }}
                        >
                          {resourceLabel(res.type)}
                        </span>
                      </div>
                      <p className="font-body text-[12px] text-[#f8fafc] truncate group-hover:text-[#818cf8] transition-colors">
                        {res.title}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#64748b] group-hover:text-[#818cf8] shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRoadmap()
  }, [])

  async function fetchRoadmap() {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
      setItems((data as RoadmapItem[]) || [])
    }
    setIsLoading(false)
  }

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/roadmap/generate', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        toast.success(`Generated ${data.count} personalised roadmap items!`)
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
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
    )

    try {
      const { error } = await supabase
        .from('roadmap_items')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', id)

      if (error) {
        toast.error('Failed to update task')
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: currentStatus as any } : item))
        )
      } else {
        toast.success(newStatus === 'completed' ? '🎉 Task completed!' : 'Task reopened')
      }
    } catch {
      toast.error('Error updating task')
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: currentStatus as any } : item))
      )
    }
  }

  const completedCount = items.filter((i) => i.status === 'completed').length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0
  const pendingItems = items.filter((i) => i.status === 'pending')
  const completedItems = items.filter((i) => i.status === 'completed')
  const totalHours = pendingItems.reduce((acc, i) => acc + (i.estimated_hours || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">
            // CURATED SYLLABUS
          </p>
          <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">
            Learning Roadmap
          </h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-1">
            Personalised curriculum with YouTube tutorials, docs &amp; practice problems — based on your interview performance.
          </p>
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-5 py-2.5 rounded-[6px] disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {items.length > 0 ? 'Refresh Roadmap' : 'Generate Roadmap'}
            </>
          )}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="md:col-span-1 space-y-4">
            {/* Progress Card */}
            <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 h-8 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
                <MacTrafficLights size="sm" />
                <span className="font-mono text-[10px] text-[#6b7280]">progress.sh</span>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="font-mono text-[10px] text-[#64748b] uppercase tracking-[0.1em] mb-3 font-semibold">
                    Overall Progress
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="font-display text-[32px] font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent">
                        {Math.round(progress)}%
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        {completedCount}/{items.length}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#09090e] rounded-full overflow-hidden border border-[#1e1e2f]">
                      <div
                        className="h-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#1e1e2f] bg-[#09090e] p-3 text-center">
                    <Target className="h-4 w-4 text-[#f87171] mx-auto mb-1" />
                    <p className="font-display text-[18px] font-bold text-white">{pendingItems.length}</p>
                    <p className="font-mono text-[9px] text-[#64748b] uppercase">Pending</p>
                  </div>
                  <div className="rounded-lg border border-[#1e1e2f] bg-[#09090e] p-3 text-center">
                    <Trophy className="h-4 w-4 text-[#fbbf24] mx-auto mb-1" />
                    <p className="font-display text-[18px] font-bold text-white">{completedCount}</p>
                    <p className="font-mono text-[9px] text-[#64748b] uppercase">Done</p>
                  </div>
                </div>

                <div className="rounded-lg border border-[#1e1e2f] bg-[#09090e] p-3 flex items-center gap-3">
                  <Zap className="h-4 w-4 text-[#818cf8] shrink-0" />
                  <div>
                    <p className="font-display text-[16px] font-bold text-white">~{Math.round(totalHours)}h</p>
                    <p className="font-mono text-[9px] text-[#64748b] uppercase">Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Legend */}
            <div className="rounded-xl border border-[#1e2030] bg-[#09090f] overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 h-8 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
                <MacTrafficLights size="sm" />
                <span className="font-mono text-[10px] text-[#6b7280]">legend.sh</span>
              </div>
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((p) => {
                  const { label, color, bg, border } = priorityLabel(p)
                  return (
                    <div key={p} className="flex items-center gap-2">
                      <span
                        className="font-mono text-[8px] uppercase rounded px-1.5 py-0.5 font-bold border shrink-0"
                        style={{ color, background: bg, borderColor: border }}
                      >
                        P{p}
                      </span>
                      <span className="font-body text-[11px] text-[#6b7280] truncate">
                        {label.split(' — ')[1]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Cards Column */}
          <div className="md:col-span-3 space-y-4">
            {/* Pending Items */}
            {pendingItems.map((item) => (
              <RoadmapCard key={item.id} item={item} onToggle={toggleStatus} />
            ))}

            {/* Completed Section */}
            {completedItems.length > 0 && (
              <div className="pt-2">
                <p className="font-mono text-[10px] text-[#4b5563] uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Completed ({completedItems.length})
                </p>
                <div className="space-y-3">
                  {completedItems.map((item) => (
                    <RoadmapCard key={item.id} item={item} onToggle={toggleStatus} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card-console p-16 text-center">
          <div className="h-16 w-16 bg-[#14142b] border border-[#3730a3] rounded-full flex items-center justify-center mx-auto mb-5 text-[#818cf8] shadow-[0_0_30px_rgba(79,70,229,0.3)]">
            <Sparkles className="h-7 w-7" />
          </div>
          <p className="font-mono text-[12px] text-[#64748b] uppercase tracking-[0.1em] mb-2">
            // NO ROADMAP GENERATED
          </p>
          <p className="font-body text-[14px] text-[#9ca3af] max-w-sm mx-auto mb-3">
            Complete an interview first, or generate a roadmap based on your profile.
          </p>
          <p className="font-mono text-[11px] text-[#4b5563] max-w-sm mx-auto mb-8">
            The AI will find YouTube tutorials, docs and practice problems for every weak topic.
          </p>
          <button
            onClick={handleGenerateRoadmap}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-8 py-3.5 rounded-md cursor-pointer disabled:opacity-50"
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGenerating ? 'Generating Roadmap...' : 'Generate My Roadmap'}
          </button>
        </div>
      )}
    </div>
  )
}
