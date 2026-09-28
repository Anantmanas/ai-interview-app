'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Calendar, TrendingUp, Clock, Target, ArrowUpRight, Zap } from 'lucide-react'

/* ── Count-up animation hook ──────────────────────────────────── */

function useCountUp(target: number, duration = 1200, startDelay = 300) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const delay = setTimeout(() => {
      const startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, startDelay)
    return () => clearTimeout(delay)
  }, [target, duration, startDelay])

  return count
}

/* ── Component ────────────────────────────────────────────────── */

interface StatsCardsProps {
  totalInterviews: number
  completedCount: number
  averageScore: number
  practiceHours: number
  weaknessCount: number
}

export function StatsCards({
  totalInterviews,
  completedCount,
  averageScore,
  practiceHours,
  weaknessCount,
}: StatsCardsProps) {
  const practiceHoursTenths = Math.round(practiceHours * 10)

  const totalCount = useCountUp(totalInterviews, 1000, 200)
  const avgCount = useCountUp(averageScore, 1200, 350)
  const hoursCount = useCountUp(practiceHoursTenths, 1000, 300)
  const weakCount = useCountUp(weaknessCount, 800, 150)

  const stats = [
    {
      telemetryId: 'TEL-01',
      label: 'TOTAL SESSIONS',
      display: `${totalCount}`,
      sub: `${completedCount} completed sessions`,
      icon: Calendar,
      accent: 'border-[#2563eb] text-[#60a5fa]',
      glow: 'shadow-[0_0_20px_rgba(37,99,235,0.15)]',
      progress: Math.min(100, Math.round((completedCount / (totalInterviews || 1)) * 100)),
    },
    {
      telemetryId: 'TEL-02',
      label: 'AVERAGE ACCURACY',
      display: `${avgCount}%`,
      sub: 'Across completed evaluations',
      icon: TrendingUp,
      accent: 'border-[#3b82f6] text-[#38bdf8]',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      progress: avgCount,
    },
    {
      telemetryId: 'TEL-03',
      label: 'COCKPIT RUNTIME',
      display: `${(hoursCount / 10).toFixed(1)}h`,
      sub: 'Total deliberate practice',
      icon: Clock,
      accent: 'border-[#818cf8] text-[#a5b4fc]',
      glow: 'shadow-[0_0_20px_rgba(129,140,248,0.15)]',
      progress: Math.min(100, Math.round((practiceHours / 10) * 100)),
    },
    {
      telemetryId: 'TEL-04',
      label: 'ACTIVE BLINDSPOTS',
      display: `${weakCount}`,
      sub: weakCount === 0 ? 'No critical gaps diagnosed' : 'Queued for remediation',
      icon: Target,
      accent: weakCount > 0 ? 'border-[#f43f5e] text-[#fb7185]' : 'border-[#10b981] text-[#34d399]',
      glow: weakCount > 0 ? 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      progress: Math.min(100, weakCount * 25),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="rounded-2xl border border-[#142347] bg-[#060b18] hover:border-[#2563eb]/60 transition-all p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden group"
        >
          {/* Subtle Top Edge Rim Light */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2563eb]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#64748b] tracking-widest font-semibold uppercase">
                // {stat.telemetryId}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#2563eb] led-pulse" />
            </div>
            <div className={`p-1.5 rounded-lg bg-[#0a1226] border border-[#142347] ${stat.accent} transition-colors`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Metric Value */}
          <div className="mb-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] block mb-1">
              {stat.label}
            </span>
            <p className="font-display text-[34px] sm:text-[38px] font-bold text-[#f8fafc] leading-none tracking-[-0.03em]">
              {stat.display}
            </p>
          </div>

          {/* Micro Progress Bar & Subtext */}
          <div className="space-y-2 pt-2 border-t border-[#142347]/60">
            <div className="h-1 w-full bg-[#0a1226] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] rounded-full"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-[#64748b]">
              <span className="truncate">{stat.sub}</span>
              <span className="text-[#60a5fa] font-semibold">{stat.progress}%</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
