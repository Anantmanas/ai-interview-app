'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'
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

const TYPE_ICONS: Record<string, string> = {
  interview_complete: '🎯',
  plan_upgrade: '⚡',
  quota_warning: '⚠️',
  payment_failed: '🚨',
  system: '🔔',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications')
    if (res.ok) {
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Supabase Realtime subscription
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
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative h-8 w-8 flex items-center justify-center rounded-md border border-[#1e1e2f] bg-[#09090e] hover:border-[#3730a3] transition-colors"
      >
        <Bell className="h-3.5 w-3.5 text-[#9ca3af]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-[#4f46e5] text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-10 z-50 w-[340px] bg-[#09090e] border border-[#1e1e2f] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2f]">
              <span className="font-mono text-[11px] font-bold text-[#ffffff] uppercase tracking-[0.08em]">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-[#818cf8]">({unreadCount})</span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 font-mono text-[10px] text-[#64748b] hover:text-[#818cf8] uppercase tracking-[0.06em] transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-6 w-6 text-[#1e1e2f] mb-3" />
                  <p className="font-mono text-[11px] text-[#64748b] uppercase tracking-[0.06em]">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`px-4 py-3 border-b border-[#1e1e2f] last:border-0 cursor-pointer transition-colors hover:bg-[#0f0f18] ${
                      !n.read ? 'bg-[#4f46e5]/[0.06]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-base mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-mono text-[12px] leading-snug ${!n.read ? 'text-[#ffffff] font-bold' : 'text-[#9ca3af]'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#6366f1] mt-1" />
                          )}
                        </div>
                        {n.body && (
                          <p className="font-body text-[12px] text-[#64748b] mt-0.5 leading-relaxed">
                            {n.body}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="font-mono text-[10px] text-[#64748b]">
                            {timeAgo(n.created_at)}
                          </span>
                          {n.action_url && (
                            <Link
                              href={n.action_url}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-1 font-mono text-[10px] text-[#818cf8] hover:text-white uppercase tracking-[0.04em] transition-colors"
                            >
                              View <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
