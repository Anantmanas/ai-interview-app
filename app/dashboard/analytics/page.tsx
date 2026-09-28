'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Target, Zap, Activity } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  dsa: '#2563eb',
  system_design: '#3b82f6',
  behavioral: '#60a5fa',
  frontend: '#38bdf8',
  backend: '#818cf8',
  technical: '#1d4ed8',
}

interface AnalyticsData {
  scoreOverTime: Array<{ date: string; score: number; rollingAvg: number; type: string }>
  typeBreakdown: Array<{ name: string; value: number }>
  weaknesses: Array<{ topic: string; score: number; count: number }>
  totalInterviews: number
  avgScore: number
  bestScore: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  telemetryId,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
  telemetryId?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-xl hover:border-white/20 transition-all p-6 flex flex-col justify-between group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-[#8C8C88] tracking-widest font-semibold uppercase">
          // {telemetryId || 'STAT'}
        </span>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#2447FF]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider mb-1">{label}</p>
        <p className="font-display text-[38px] font-bold text-[#F4F2EC] leading-none tracking-tight">{value}</p>
      </div>
      {sub && (
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8C8C88] mt-4 pt-3 border-t border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
          <span className="truncate">{sub}</span>
        </div>
      )}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141414] border border-white/15 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="font-mono text-[11px] text-[#8C8C88] mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="font-mono text-[12px] font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-[#2563eb]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1300px] mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#2447FF] uppercase tracking-widest font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
          <span>[INTELLIGENCE // 07] PERFORMANCE TELEMETRY</span>
        </div>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-[#F4F2EC] tracking-[-0.03em]">
          Performance Analytics
        </h1>
        <p className="font-body text-[14px] sm:text-[15px] text-[#8C8C88] mt-2">
          Quantitative telemetry of your mock practice accuracy, speed, and topic mastery.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard telemetryId="KPI-01" label="Total Interviews" value={data?.totalInterviews ?? 0} icon={BarChart3} sub="Recorded sessions" />
        <StatCard telemetryId="KPI-02" label="Average Accuracy" value={`${data?.avgScore ?? 0}%`} icon={Target} sub="Across completed runs" />
        <StatCard telemetryId="KPI-03" label="Peak Performance" value={`${data?.bestScore ?? 0}%`} icon={TrendingUp} sub="Personal best score" />
      </div>

      {/* Score Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-[#2447FF]" />
            <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
              ACCURACY PROGRESSION // 7-SESSION ROLLING AVERAGE
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#2447FF] bg-[#2447FF]/10 border border-[#2447FF]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            SYNCHRONIZED
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {data?.scoreOverTime && data.scoreOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.scoreOverTime}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2447FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2447FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" tick={{ fill: '#8C8C88', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8C8C88', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#2447FF" fill="url(#scoreGrad)" strokeWidth={2} name="Session Score" dot={{ fill: '#2447FF', r: 3 }} />
                <Line type="monotone" dataKey="rollingAvg" stroke="#8C8C88" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="7-Session Average" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-[#8C8C88] font-mono text-[12px]">
              Complete more mock interviews to populate historical progression.
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid: Type Breakdown & Topic Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-[#2447FF]" />
              <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
                INTERVIEW TYPE DISTRIBUTION
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {data?.typeBreakdown && data.typeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={data.typeBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                    {data.typeBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? '#2447FF'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: '#8C8C88', fontSize: 11, fontFamily: 'monospace' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-44 text-[#8C8C88] font-mono text-[12px]">No data logged yet</div>
            )}
          </div>
        </motion.div>

        {/* Weakness heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-[#0D0D0D] shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
            <div className="flex items-center gap-2.5">
              <Target className="h-4 w-4 text-[#f43f5e]" />
              <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
                TOPIC WEAKNESS MATRIX
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {data?.weaknesses && data.weaknesses.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.weaknesses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8C8C88', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis type="category" dataKey="topic" tick={{ fill: '#F4F2EC', fontSize: 10, fontFamily: 'monospace' }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Accuracy Score" radius={[0, 4, 4, 0]}>
                    {data.weaknesses.map((entry) => (
                      <Cell key={entry.topic} fill={entry.score < 40 ? '#f43f5e' : entry.score < 65 ? '#fbbf24' : '#2447FF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-44 text-[#8C8C88] font-mono text-[12px]">No topic weakness data logged yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
