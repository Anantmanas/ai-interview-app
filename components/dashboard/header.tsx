'use client'

import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { NotificationBell } from '@/components/dashboard/notification-bell'
import Link from 'next/link'
import { Mic } from 'lucide-react'

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

const pathNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/weaknesses': 'Weaknesses',
  '/interview': 'Interview',
  '/interview/new': 'New Interview',
  '/dashboard/history': 'Interview History',
  '/dashboard/roadmap': 'Learning Roadmap',
  '/dashboard/profile': 'Profile',
  '/dashboard/resume': 'Resume',
  '/dashboard/settings': 'Settings',
  '/dashboard/billing': 'Billing',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/referrals': 'Referrals',
  '/dashboard/activity': 'Activity',
  '/dashboard/api-keys': 'API Keys',
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs: { label: string; href: string }[] = []

    let currentPath = ''
    for (const segment of segments) {
      currentPath += `/${segment}`
      const label = pathNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      crumbs.push({ label, href: currentPath })
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl px-4 sm:px-6">
      <SidebarTrigger className="-ml-1 text-[#8C8C88] hover:text-white hover:bg-white/5 rounded-lg p-1.5 transition-colors shrink-0" />
      <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

      {/* Breadcrumb Navigation */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumb>
          <BreadcrumbList className="font-mono text-[11px] sm:text-[12px] text-[#8C8C88] flex-nowrap overflow-hidden">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem className={!isLast ? 'hidden sm:inline-flex' : 'inline-flex truncate'}>
                    {isLast ? (
                      <BreadcrumbPage className="text-[#F4F2EC] font-semibold truncate tracking-tight">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-[#8C8C88] hover:text-white transition-colors truncate"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-white/20 hidden sm:inline-flex" />
                  )}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right Action Icons & Direct Cockpit Launcher */}
      <div className="ml-auto shrink-0 flex items-center gap-3">
        <Link
          href="/interview/new"
          className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white bg-[#2447FF] hover:bg-[#1f3ce0] px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
        >
          <Mic className="h-3.5 w-3.5" />
          <span>Start Session</span>
        </Link>
        <NotificationBell />
      </div>
    </header>
  )
}
