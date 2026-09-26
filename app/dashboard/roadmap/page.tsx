'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  BookOpen,
  ExternalLink,
  Clock,
  Sparkles,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  Code2,
  Trophy,
  Target,
  Zap,
  Plus,
  X,
  RotateCcw,
  Youtube,
  CheckCircle2,
} from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { motion, AnimatePresence } from 'motion/react'

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

// ── YouTube Video Carousel Component ──────────────────────────────────────────

function VideoCarousel({ videos, topicTitle }: { videos: Resource[]; topicTitle: string }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (container) container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [videos])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const offset = 320
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    })
  }

  if (videos.length === 0) {
    return (
      <div className="p-4 bg-[#0c0d15] border border-[#1e2030] rounded-xl text-center font-mono text-xs text-[#64748b]">
        No video recommendations available for this topic.
      </div>
    )
  }

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-[#f87171] uppercase tracking-wider flex items-center gap-1.5">
          <Youtube className="h-3.5 w-3.5" />
          Recommended Video Tutorials ({videos.length})
        </span>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-md bg-[#14142b] border border-[#1e2030] text-[#9ca3af] hover:text-white hover:border-[#3730a3] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-1.5 rounded-md bg-[#14142b] border border-[#1e2030] text-[#9ca3af] hover:text-white hover:border-[#3730a3] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((vid, idx) => (
          <motion.a
            key={idx}
            href={vid.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -3 }}
            className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start bg-[#0c0d15] hover:bg-[#12131f] border border-[#1e2030] hover:border-[#6366f1]/60 rounded-xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video w-full bg-[#14142b] overflow-hidden">
              {vid.thumbnail ? (
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#14142b] to-[#1e1b4b]">
                  <Youtube className="h-8 w-8 text-[#f87171] opacity-80" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <div className="h-10 w-10 rounded-full bg-[#f87171]/90 group-hover:bg-[#f87171] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                </div>
              </div>

              {/* Duration Badge */}
              {vid.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 font-mono text-[10px] text-white px-1.5 py-0.5 rounded font-medium">
                  {vid.duration}
                </span>
              )}
            </div>

            {/* Video Meta info */}
            <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
              <h4 className="font-sans text-xs font-semibold text-white group-hover:text-[#818cf8] line-clamp-2 leading-snug transition-colors">
                {vid.title}
              </h4>

              <div className="flex items-center justify-between font-mono text-[10px] text-[#9ca3af] pt-1 border-t border-[#1e2030]/60">
                <span className="truncate max-w-[170px] text-[#c7d2fe]">
                  {vid.channel || 'YouTube Video'}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[#818cf8] group-hover:text-white transition-colors shrink-0">
                  Watch <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  )
}

// ── Roadmap Card with Videos & Resources ──────────────────────────────────────

function RoadmapCard({
  item,
  onToggle,
}: {
  item: RoadmapItem
  onToggle: (id: string, status: string) => void
}) {
  const { label, color, bg, border } = priorityLabel(item.priority)
  const completed = item.status === 'completed'

  const videoResources = item.resources?.filter((r) => r.type === 'video') || []
  const docsResources = item.resources?.filter((r) => r.type === 'docs') || []
  const practiceResources = item.resources?.filter((r) => r.type === 'practice') || []

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        completed
          ? 'border-[#1e2030]/50 bg-[#09090f]/60 opacity-80'
          : 'border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3730a3]/80'
      }`}
    >
      {/* Titlebar */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-2.5">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[10px] text-[#9ca3af] font-medium truncate max-w-[300px]">
            {item.topic.toLowerCase().replace(/\s+/g, '-')}.module.ts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider"
            style={{ color, backgroundColor: bg, borderColor: border }}
          >
            {label}
          </span>
          <span className="font-mono text-[9px] text-[#9ca3af] bg-[#0c0d15] border border-[#1e2030] px-2 py-0.5 rounded">
            {item.estimated_hours}h
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header & Mark Complete */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#818cf8] bg-[#14142b] border border-[#3730a3]/40 px-2 py-0.5 rounded">
                ⚡ {item.topic}
              </span>
              {item.weakness_score && (
                <span className="font-mono text-[10px] text-[#f87171] bg-[#2a0e15] border border-[#5c1d28] px-1.5 py-0.5 rounded">
                  Weakness: {item.weakness_score}%
                </span>
              )}
            </div>
            <h3
              className={`font-display text-lg font-bold transition-colors ${
                completed ? 'line-through text-[#64748b]' : 'text-white'
              }`}
            >
              {item.title}
            </h3>
            <p className="font-sans text-xs text-[#9ca3af] leading-relaxed max-w-3xl">
              {item.description}
            </p>
          </div>

          <button
            onClick={() => onToggle(item.id, item.status)}
            className={`font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              completed
                ? 'bg-[#052016] border-[#065f46] text-[#34d399]'
                : 'bg-[#14142b] border-[#3730a3] text-[#818cf8] hover:bg-[#1e1b4b] hover:text-white'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            <span>{completed ? 'Completed' : 'Mark Done'}</span>
          </button>
        </div>

        {/* YouTube Video Carousel */}
        <VideoCarousel videos={videoResources} topicTitle={item.topic} />

        {/* Secondary Resources: Docs & Practice Links */}
        {(docsResources.length > 0 || practiceResources.length > 0) && (
          <div className="pt-2 border-t border-[#1e2030]/60 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider mr-1">
              ADDITIONAL MATERIALS:
            </span>

            {docsResources.map((d, i) => (
              <a
                key={`doc-${i}`}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#60a5fa] hover:text-white bg-[#0c0d15] hover:bg-[#1e2030] border border-[#1e2030] px-2.5 py-1 rounded-md transition-colors"
              >
                <FileText className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{d.title}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            ))}

            {practiceResources.map((p, i) => (
              <a
                key={`prac-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#34d399] hover:text-white bg-[#0c0d15] hover:bg-[#1e2030] border border-[#1e2030] px-2.5 py-1 rounded-md transition-colors"
              >
                <Code2 className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{p.title}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [focusTopics, setFocusTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  // Load Roadmap items and extract weak skills from past interview weaknesses
  useEffect(() => {
    async function loadData() {
      setInitialLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch existing roadmap items
        const { data: roadmapData } = await supabase
          .from('roadmap_items')
          .select('*')
          .eq('user_id', user.id)
          .order('priority', { ascending: true })

        if (roadmapData) {
          setItems(roadmapData as RoadmapItem[])
        }

        // 2. Fetch measured weaknesses from user_weaknesses table
        const { data: weaknesses } = await supabase
          .from('user_weaknesses')
          .select('topic, weakness_score')
          .eq('user_id', user.id)
          .order('weakness_score', { ascending: false })
          .limit(6)

        if (weaknesses && weaknesses.length > 0) {
          const uniqueTopics = Array.from(new Set(weaknesses.map((w) => w.topic).filter(Boolean)))
          setFocusTopics(uniqueTopics)
        } else {
          // Default starter weak topics if no interview recorded yet
          setFocusTopics([
            'JavaScript Data Types',
            'React Hooks & State Management',
            'Dynamic Programming',
            'System Design & Microservices',
          ])
        }
      } catch (err) {
        console.error('Failed to load roadmap data:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    void loadData()
  }, [supabase])

  const handleAddTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = topicInput.trim()
    if (!trimmed) return

    if (!focusTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setFocusTopics((prev) => [...prev, trimmed])
    }
    setTopicInput('')
  }

  const removeTopic = (topicToRemove: string) => {
    setFocusTopics((prev) => prev.filter((t) => t.toLowerCase() !== topicToRemove.toLowerCase()))
  }

  const handleGenerate = async () => {
    if (focusTopics.length === 0) {
      toast.error('Please add at least one weak skill or focus topic.')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: focusTopics }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to generate roadmap')
      }

      toast.success('Curated video roadmap generated successfully!')

      // Reload updated roadmap items
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: updated } = await supabase
          .from('roadmap_items')
          .select('*')
          .eq('user_id', user.id)
          .order('priority', { ascending: true })

        if (updated) {
          setItems(updated as RoadmapItem[])
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus as any, completed_at: completedAt || undefined } : item))
    )

    try {
      await supabase
        .from('roadmap_items')
        .update({ status: newStatus, completed_at: completedAt })
        .eq('id', id)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update item status')
    }
  }

  const completedCount = items.filter((i) => i.status === 'completed').length
  const totalHours = items.reduce((sum, i) => sum + (i.estimated_hours || 0), 0)
  const remainingHours = items
    .filter((i) => i.status !== 'completed')
    .reduce((sum, i) => sum + (i.estimated_hours || 0), 0)
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className="max-w-[1200px] space-y-6 pb-16 font-sans">
      {/* Page Header */}
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">
          // AI LEARNING ROADMAP & VIDEO CURATION
        </p>
        <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">
          Adaptive Video Roadmap
        </h1>
        <p className="font-body text-[14px] text-[#9ca3af] mt-1 max-w-2xl">
          Auto-calibrated based on your interview weak skills with high-yield YouTube video suggestions and practice modules.
        </p>
      </div>

      {/* WEAK SKILLS & TOPICS SELECTION PANEL */}
      <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
        <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
          <div className="flex items-center gap-2.5">
            <MacTrafficLights size="sm" />
            <span className="font-mono text-[10px] text-[#9ca3af] font-medium">
              interview-weakness-grabber.sh — focus-targets
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            INTERVIEW SYNC
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-mono text-[12px] uppercase tracking-[0.08em] font-bold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-[#818cf8]" />
                Target Weak Skills ({focusTopics.length} Focus Areas)
              </h2>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Remove, add, or customize the weak skills identified from your single interview assessment.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || focusTopics.length === 0}
              className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-lg disabled:opacity-40 flex items-center gap-2 shadow-[0_0_25px_rgba(79,70,229,0.35)] transition-all hover:scale-[1.02] cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Curating Video Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Video Roadmap</span>
                </>
              )}
            </button>
          </div>

          {/* Active Focus Tags */}
          <div className="min-h-[48px] p-2.5 bg-[#050508] border border-[#1e2030] rounded-xl flex flex-wrap items-center gap-2">
            <AnimatePresence>
              {focusTopics.length === 0 ? (
                <span className="text-xs text-[#64748b] font-mono px-2">
                  No skills selected. Type a topic below or add from interview weaknesses.
                </span>
              ) : (
                focusTopics.map((topic) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="inline-flex items-center gap-1.5 bg-[#14142b] border border-[#6366f1]/50 text-white font-mono text-xs pl-3 pr-1.5 py-1.5 rounded-lg shadow-sm group"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="p-1 hover:bg-[#6366f1]/30 rounded text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Input to Add Custom Topic */}
          <form onSubmit={handleAddTopic} className="flex gap-2">
            <input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Type any skill or weak topic (e.g. JavaScript Data Types, Binary Trees) & press Enter..."
              className="bg-[#050508] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all w-full font-mono"
            />
            <button
              type="submit"
              disabled={!topicInput.trim()}
              className="px-4 py-2 rounded-lg bg-[#14142b] hover:bg-[#6366f1] text-white font-mono text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-[#1e2030] hover:border-[#6366f1] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Tag</span>
            </button>
          </form>
        </div>
      </div>

      {/* OVERVIEW STATS BAR */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#09090f] border border-[#1e2030] rounded-xl p-3.5 shadow-sm">
            <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-wider block">
              TOTAL MODULES
            </span>
            <p className="font-mono text-xl font-bold text-white mt-0.5">{items.length}</p>
          </div>

          <div className="bg-[#09090f] border border-[#1e2030] rounded-xl p-3.5 shadow-sm">
            <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-wider block">
              COMPLETED
            </span>
            <p className="font-mono text-xl font-bold text-[#22c55e] mt-0.5">{completedCount}</p>
          </div>

          <div className="bg-[#09090f] border border-[#1e2030] rounded-xl p-3.5 shadow-sm">
            <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-wider block">
              REMAINING HOURS
            </span>
            <p className="font-mono text-xl font-bold text-[#818cf8] mt-0.5">{remainingHours}h</p>
          </div>

          <div className="bg-[#09090f] border border-[#1e2030] rounded-xl p-3.5 shadow-sm">
            <span className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-wider block">
              PROGRESS
            </span>
            <p className="font-mono text-xl font-bold text-[#38bdf8] mt-0.5">{progressPercent}%</p>
          </div>
        </div>
      )}

      {/* ROADMAP ITEMS LIST */}
      <div className="space-y-6">
        {initialLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#818cf8] animate-spin" />
            <p className="font-mono text-xs text-[#9ca3af]">LOADING ROADMAP MODULES...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item) => (
              <RoadmapCard key={item.id} item={item} onToggle={handleToggle} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1e2030] bg-[#09090f] p-16 text-center space-y-4">
            <BookOpen className="h-12 w-12 mx-auto text-[#64748b]" />
            <div className="space-y-1">
              <p className="font-mono text-sm text-[#818cf8] uppercase tracking-wider font-semibold">
                // NO ACTIVE ROADMAP FOUND
              </p>
              <p className="font-sans text-xs text-[#9ca3af] max-w-md mx-auto">
                Customize your focus skills in the box above and click &quot;Generate Video Roadmap&quot; to build your tailored video curriculum.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-neo-violet font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Starter Roadmap</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
