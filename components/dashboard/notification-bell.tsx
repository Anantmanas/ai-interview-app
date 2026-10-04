'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, CheckCheck, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  action_url: string | null
  created_at: string
}

const TYPE_CONFIG: Record<string, { icon: string; badge: string; badgeColor: string }> = {
  start_journey: {
    icon: '🚀',
    badge: 'JOURNEY',
    badgeColor: 'text-[#2447FF] bg-[#2447FF]/10 border-[#2447FF]/30',
  },
  marketing: {
    icon: '⚡',
    badge: 'PRO OFFER',
    badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  },
  resume_grounding: {
    icon: '📄',
    badge: 'GROUNDING',
    badgeColor: 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30',
  },
  roadmap_ready: {
    icon: '🗺️',
    badge: 'STUDY PLAN',
    badgeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
  },
  daily_challenge: {
    icon: '🔥',
    badge: 'WARMUP',
    badgeColor: 'text-[#EC4899] bg-[#EC4899]/10 border-[#EC4899]/30',
  },
  interview_complete: {
    icon: '🎯',
    badge: 'COMPLETED',
    badgeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
  },
  system: {
    icon: '🔔',
    badge: 'SYSTEM',
    badgeColor: 'text-[#8C8C88] bg-white/[0.05] border-white/10',
  },
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Supabase Realtime subscription (if available)
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe()

    // Close on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
    } catch (err) {
      console.warn('Error marking all notifications as read:', err)
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: n.id }),
        })
      } catch (err) {
        console.warn('Error marking notification as read:', err)
      }
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    setOpen(false)

    if (n.action_url) {
      router.push(n.action_url)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open notifications"
        className="relative h-9 w-9 flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 transition-all text-[#8C8C88] hover:text-[#F4F2EC]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#2447FF] text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(36,71,255,0.7)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-11 z-50 w-[350px] max-w-[calc(100vw-24px)] bg-[#0A0A0A] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#F4F2EC] uppercase tracking-[0.1em]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="font-mono text-[10px] text-[#2447FF] bg-[#2447FF]/15 border border-[#2447FF]/30 px-1.5 py-0.2 rounded font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 font-mono text-[10px] text-[#8C8C88] hover:text-white uppercase tracking-[0.06em] transition-colors"
                >
                  <CheckCheck className="h-3 w-3 text-[#2447FF]" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification items */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.05]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-6 w-6 text-white/20 mb-2" />
                  <p className="font-mono text-[11px] text-[#8C8C88] uppercase tracking-[0.06em]">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 cursor-pointer transition-colors hover:bg-white/[0.04] text-left group ${
                        !n.read ? 'bg-[#2447FF]/[0.04]' : 'opacity-85'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5 shrink-0">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`font-mono text-[9px] uppercase tracking-wider font-semibold border px-1.5 py-0.5 rounded ${cfg.badgeColor}`}
                            >
                              {cfg.badge}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-[#8C8C88]">
                                {timeAgo(n.created_at)}
                              </span>
                              {!n.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF] shadow-[0_0_6px_#2447FF] shrink-0" />
                              )}
                            </div>
                          </div>

                          <p
                            className={`font-display text-[13px] leading-snug mb-1 transition-colors ${
                              !n.read
                                ? 'text-[#F4F2EC] font-semibold group-hover:text-white'
                                : 'text-[#A09E96]'
                            }`}
                          >
                            {n.title}
                          </p>

                          {n.body && (
                            <p className="font-body text-[12px] text-[#8C8C88] leading-relaxed line-clamp-2">
                              {n.body}
                            </p>
                          )}

                          {n.action_url && (
                            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#2447FF] group-hover:text-[#4B6BFF] uppercase tracking-[0.06em] font-medium">
                              <span>Action</span>
                              <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
