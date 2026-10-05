'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
import { motion, AnimatePresence } from 'motion/react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Resource {
  type: 'video' | 'docs' | 'practice' | 'course'
  title: string
  url: string
  thumbnail?: string
  channel?: string
  duration?: string
  provider?: string
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
  if (p <= 1) return { label: 'Priority 1 — Critical', color: '#f43f5e', bg: '#2a0e15', border: '#5c1d28' }
  if (p <= 2) return { label: 'Priority 2 — High', color: '#fb923c', bg: '#2a1608', border: '#7c2d12' }
  if (p <= 3) return { label: 'Priority 3 — Medium', color: '#fbbf24', bg: '#1c1608', border: '#78350f' }
  if (p <= 4) return { label: 'Priority 4 — Low', color: '#34d399', bg: '#052016', border: '#065f46' }
  return { label: 'Priority 5 — Optional', color: '#60a5fa', bg: '#0a1226', border: '#1e3a8a' }
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
      <div className="p-4 bg-[#141414] border border-white/10 rounded-xl text-center font-mono text-xs text-[#8C8C88]">
        No video recommendations available for this topic.
      </div>
    )
  }

  return (
    <div className="relative space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium text-[#F4F2EC] uppercase tracking-wider flex items-center gap-1.5">
          <Youtube className="h-3.5 w-3.5 text-[#2447FF]" />
          Recommended Video Tutorials ({videos.length})
        </span>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-lg bg-[#141414] border border-white/10 text-[#8C8C88] hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-1.5 rounded-lg bg-[#141414] border border-white/10 text-[#8C8C88] hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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
            className="flex-shrink-0 w-[240px] sm:w-[280px] max-w-[78vw] snap-start bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 hover:border-[#2447FF]/50 rounded-xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video w-full bg-[#0D0D0D] overflow-hidden">
              {vid.thumbnail ? (
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0D0D0D]">
                  <Youtube className="h-8 w-8 text-[#2447FF] opacity-80" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <div className="h-10 w-10 rounded-full bg-[#2447FF] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
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
            <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
              <h4 className="font-sans text-xs font-semibold text-white group-hover:text-[#2447FF] line-clamp-2 leading-snug transition-colors">
                {vid.title}
              </h4>

              <div className="flex items-center justify-between font-mono text-[10px] text-[#8C8C88] pt-2 border-t border-white/10">
                <span className="truncate max-w-[170px] text-[#8C8C88]">
                  {vid.channel || 'Video Guide'}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[#2447FF] group-hover:text-white transition-colors shrink-0">
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
  index = 0,
  onToggle,
}: {
  item: RoadmapItem
  index?: number
  onToggle: (id: string, status: string) => void
}) {
  const { label, color, bg, border } = priorityLabel(item.priority)
  const completed = item.status === 'completed'

  const videoResources = item.resources?.filter((r) => r.type === 'video') || []
  const courseResources = item.resources?.filter((r) => r.type === 'course') || []
  const docsResources = item.resources?.filter((r) => r.type === 'docs') || []
  const practiceResources = item.resources?.filter((r) => r.type === 'practice') || []

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        completed
          ? 'border-white/[0.06] bg-[#0D0D0D]/60 opacity-75'
          : 'border-white/10 bg-[#0D0D0D] shadow-xl hover:border-white/20'
      }`}
    >
      {/* Visual Journey Stepper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] gap-3 select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-[#2447FF]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C8C88]">
            <span className="text-white font-medium">WEAKNESS</span>
            <span>↓</span>
            <span className="text-white font-medium">SKILL</span>
            <span>↓</span>
            <span className="text-white font-medium">MODULE</span>
            <span>↓</span>
            <span className="text-[#2447FF] font-semibold">RE-TEST</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
            style={{ color, backgroundColor: bg, borderColor: border }}
          >
            {label}
          </span>
          <span className="font-mono text-[10px] text-[#8C8C88] bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full">
            {item.estimated_hours}h
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Header & Mark Complete */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
                ⚡ {item.topic}
              </span>
              {item.weakness_score && (
                <span className="font-mono text-[10px] text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/20 px-2 py-0.5 rounded-md font-semibold">
                  Blindspot: {item.weakness_score}%
                </span>
              )}
            </div>
            <h3
              className={`font-display text-xl font-bold tracking-tight transition-colors ${
                completed ? 'line-through text-[#8C8C88]' : 'text-[#F4F2EC]'
              }`}
            >
              {item.title}
            </h3>
            <p className="font-sans text-[13px] text-[#8C8C88] leading-relaxed max-w-3xl">
              {item.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/interview/new?topic=${encodeURIComponent(item.topic)}&type=technical&mode=targeted`}
              className="font-mono text-xs font-semibold px-4 py-2 rounded-xl border border-[#2447FF]/50 bg-[#2447FF]/10 text-white hover:bg-[#2447FF] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 text-[#2447FF] group-hover:text-white" />
              <span>Practice Topic</span>
            </Link>

            <button
              onClick={() => onToggle(item.id, item.status)}
              className={`font-mono text-xs font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                completed
                  ? 'bg-[#052016] border-[#065f46] text-[#34d399]'
                  : 'bg-white/5 border-white/10 text-[#8C8C88] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{completed ? 'Completed' : 'Mark Done'}</span>
            </button>
          </div>
        </div>

        {/* YouTube Video Carousel */}
        <VideoCarousel videos={videoResources} topicTitle={item.topic} />

        {/* Curated Interactive Courses & Full Curriculum */}
        {courseResources.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <span className="font-mono text-[10px] text-[#8C8C88] uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#2447FF]" />
              RECOMMENDED COURSES ({courseResources.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courseResources.map((c, i) => (
                <a
                  key={`course-${i}`}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-sans text-xs font-semibold text-white group-hover:text-[#2447FF] truncate">
                      {c.title}
                    </p>
                    <span className="font-mono text-[10px] text-[#8C8C88] block">
                      {c.provider || 'Interactive Course'}
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-[#8C8C88] shrink-0 opacity-70 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Resources: Docs & Practice Links */}
        {(docsResources.length > 0 || practiceResources.length > 0) && (
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider mr-1">
              ADDITIONAL MATERIALS:
            </span>

            {docsResources.map((d, i) => (
              <a
                key={`doc-${i}`}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#8C8C88] hover:text-white bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
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
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#8C8C88] hover:text-white bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
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

const ROADMAP_STORAGE_KEY = 'interviewai_roadmap_cached_items'

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [focusTopics, setFocusTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [hasEvaluations, setHasEvaluations] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setInitialLoading(true)
      try {
        // Hydrate from localStorage first to prevent disappearance on reload
        try {
          const cached = localStorage.getItem(ROADMAP_STORAGE_KEY)
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setItems(parsed)
            }
          }
        } catch {}

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: roadmapData } = await supabase
          .from('roadmap_items')
          .select('*')
          .eq('user_id', user.id)
          .order('priority', { ascending: true })

        const hasExistingRoadmap = Boolean(roadmapData && roadmapData.length > 0)
        if (hasExistingRoadmap) {
          setItems(roadmapData as RoadmapItem[])
          try {
            localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmapData))
          } catch {}
        }

        const { data: weaknesses } = await supabase
          .from('user_weaknesses')
          .select('topic, weakness_score')
          .eq('user_id', user.id)
          .order('weakness_score', { ascending: false })
          .limit(10)

        const { data: recentInterviews } = await supabase
          .from('interviews')
          .select('weaknesses, title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        const extractedInterviewTopics: string[] = []
        if (recentInterviews) {
          for (const inv of recentInterviews) {
            if (Array.isArray(inv.weaknesses)) {
              for (const w of inv.weaknesses) {
                if (w?.topic) extractedInterviewTopics.push(w.topic)
              }
            }
          }
        }

        const dbWeaknessTopics = (weaknesses || []).map((w) => w.topic).filter(Boolean)
        const combined = Array.from(new Set([...extractedInterviewTopics, ...dbWeaknessTopics]))

        if (combined.length > 0) {
          setHasEvaluations(true)
          setFocusTopics(combined.slice(0, 6))
        } else {
          setHasEvaluations(false)
          setFocusTopics([
            'JavaScript Data Types',
            'React Hooks & State Management',
            'Dynamic Programming',
            'System Design & Microservices',
          ])
        }

        // If no roadmap plan exists yet, but candidate has completed interviews / weak areas:
        // Automatically generate their personalized curriculum so it is ready when they arrive!
        if (!hasExistingRoadmap && combined.length > 0) {
          try {
            const autoTopics = combined.slice(0, 6)
            const res = await fetch('/api/roadmap/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topics: autoTopics }),
            })
            if (res.ok) {
              const data = await res.json()
              if (Array.isArray(data.items) && data.items.length > 0) {
                setItems(data.items as RoadmapItem[])
                try {
                  localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data.items))
                } catch {}
              }
            }
          } catch (autoGenErr) {
            console.warn('[Roadmap] Auto-generate curriculum error:', autoGenErr)
          }
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
    // If no topics selected, auto-seed starter curriculum topics
    const topicsToUse = focusTopics.length > 0 ? focusTopics : [
      'Algorithms & Data Structures',
      'System Design & Scalability',
      'Concurrency & Performance',
      'API Architecture',
    ]

    if (focusTopics.length === 0) {
      setFocusTopics(topicsToUse)
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: topicsToUse }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to generate roadmap')
      }

      toast.success('Curated video roadmap generated successfully!')

      if (Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items as RoadmapItem[])
        try {
          localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data.items))
        } catch {}
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: updated } = await supabase
            .from('roadmap_items')
            .select('*')
            .eq('user_id', user.id)
            .order('priority', { ascending: true })

          if (updated && updated.length > 0) {
            setItems(updated as RoadmapItem[])
            try {
              localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(updated))
            } catch {}
          }
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

    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, status: newStatus as any, completed_at: completedAt || undefined } : item
      )
      try {
        localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })

    try {
      await fetch('/api/roadmap/item', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, completed_at: completedAt }),
      })
    } catch (err) {
      console.warn('Failed to update status on server:', err)
    }
  }

  const completedCount = items.filter((i) => i.status === 'completed').length
  const totalHours = items.reduce((sum, i) => sum + (i.estimated_hours || 0), 0)
  const remainingHours = items
    .filter((i) => i.status !== 'completed')
    .reduce((sum, i) => sum + (i.estimated_hours || 0), 0)
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1300px] mx-auto space-y-8 pb-32 sm:pb-16 font-sans">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#2447FF] uppercase tracking-widest font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
          <span>[JOURNEY // 05] CURRICULUM ARCHITECTURE</span>
        </div>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-[#F4F2EC] leading-[1.05] tracking-[-0.03em]">
          Adaptive Video Roadmap
        </h1>
        <p className="font-body text-[14px] sm:text-[15px] text-[#8C8C88] mt-2 max-w-2xl">
          Auto-calibrated based on your interview weak signals with high-yield video modules and targeted practice drills.
        </p>
      </div>

      {/* Focus Topics Selection Panel */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
          <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
            TARGETED FOCUS AREAS ({focusTopics.length} SKILLS)
          </span>
          <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
            hasEvaluations
              ? 'text-[#34d399] bg-[#052016] border border-[#065f46]'
              : 'text-[#60a5fa] bg-[#0a1226] border border-[#1e3a8a]'
          }`}>
            {hasEvaluations ? 'TELEMETRY SYNC' : 'STARTER TOPICS'}
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-[#2447FF]" />
                {hasEvaluations ? 'Target Identified Blindspots' : 'Starter Curriculum Skills'}
              </h2>
              <p className="text-xs text-[#8C8C88] mt-1">
                {hasEvaluations
                  ? 'Customize the weak topics detected from your mock interviews to build a personalized study track.'
                  : 'Recommended foundation skills to build your initial study track. As you complete mock interviews, this list updates with your diagnosed blindspots.'}
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#2447FF] hover:bg-[#1f3ce0] text-white font-mono text-[12px] font-semibold uppercase tracking-wider px-6 py-3 rounded-xl disabled:opacity-40 flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Curating Video Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{focusTopics.length === 0 ? 'Generate Starter Roadmap' : 'Generate Video Roadmap'}</span>
                </>
              )}
            </button>
          </div>

          {/* Active Focus Tags */}
          <div className="min-h-[52px] p-3 bg-[#141414] border border-white/10 rounded-xl flex flex-wrap items-center gap-2">
            <AnimatePresence>
              {focusTopics.length === 0 ? (
                <span className="text-xs text-[#8C8C88] font-mono px-2">
                  No skills selected. Type a topic below or add from interview weaknesses.
                </span>
              ) : (
                focusTopics.map((topic) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-white/15 text-white font-mono text-xs pl-3.5 pr-2 py-1.5 rounded-lg shadow-sm group"
                  >
                    <span className="truncate">{topic}</span>
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="p-1 hover:bg-white/10 rounded text-[#8C8C88] hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Remove skill"
                      aria-label={`Remove ${topic}`}
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
              placeholder="Add skill or weak topic (e.g. Distributed Consensus, Dynamic Programming) & press Enter..."
              className="bg-[#141414] border border-white/10 focus:border-[#2447FF] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-[#8C8C88] focus:outline-none transition-all w-full font-mono"
            />
            <button
              type="submit"
              disabled={!topicInput.trim()}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-[#2447FF] text-white font-mono text-xs font-semibold flex items-center gap-2 shrink-0 border border-white/10 hover:border-[#2447FF] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Topic</span>
            </button>
          </form>
        </div>
      </div>

      {/* OVERVIEW STATS BAR */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider block">
              TOTAL MODULES
            </span>
            <p className="font-display text-3xl font-bold text-[#F4F2EC] mt-1">{items.length}</p>
          </div>

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider block">
              COMPLETED
            </span>
            <p className="font-display text-3xl font-bold text-[#34d399] mt-1">{completedCount}</p>
          </div>

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider block">
              REMAINING TIME
            </span>
            <p className="font-display text-3xl font-bold text-[#F4F2EC] mt-1">{remainingHours}h</p>
          </div>

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-sm">
            <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider block">
              MASTERY RATE
            </span>
            <p className="font-display text-3xl font-bold text-[#2447FF] mt-1">{progressPercent}%</p>
          </div>
        </div>
      )}

      {/* ROADMAP ITEMS LIST */}
      <div className="space-y-6">
        {initialLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-[#2447FF] animate-spin" />
            <p className="font-mono text-xs text-[#8C8C88]">SYNCHRONIZING CURRICULUM TELEMETRY...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item, idx) => (
              <RoadmapCard key={item.id} item={item} index={idx} onToggle={handleToggle} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1C1C36] border border-[#3A3A5C] flex items-center justify-center mb-4">
              <span className="text-[#6B6B8A] text-xl">🗺</span>
            </div>
            <p className="font-mono text-[11px] text-[#00D4AA] uppercase tracking-[0.1em] mb-2">
              {hasEvaluations ? 'Weak Areas Diagnosed — Generate Study Plan' : 'No plan generated yet'}
            </p>
            <p className="text-[#6B6B8A] text-[13px] max-w-[420px] leading-relaxed mb-6">
              {hasEvaluations
                ? 'Your mock interview telemetry has diagnosed key target skills. Generate your personalized study curriculum with curated videos and practice drills.'
                : 'Complete a mock interview session to diagnose your weak areas, or generate a starter curriculum covering core engineering foundations.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="font-mono text-[12px] bg-gradient-to-r from-[#00D4AA] to-[#7B6FFF] text-[#080810] font-semibold px-5 py-2.5 rounded-lg hover:opacity-95 transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generating Plan...</span>
                  </>
                ) : (
                  <span>{hasEvaluations ? 'Generate My Study Plan Now →' : 'Generate Starter Plan →'}</span>
                )}
              </button>
              {!hasEvaluations && (
                <a
                  href="/interview/new"
                  className="font-mono text-[12px] bg-[#141414] hover:bg-[#1f1f1f] text-[#8C8C88] hover:text-white border border-white/10 px-5 py-2.5 rounded-lg transition-all"
                >
                  Run an interview first →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
