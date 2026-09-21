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
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-[#1e1e2f] bg-[#000000]/90 backdrop-blur-md px-5">
      <SidebarTrigger className="-ml-1 text-[#9ca3af] hover:text-[#818cf8] hover:bg-[#14142b]" />
      <div className="h-3.5 w-px bg-[#1e1e2f] mx-2" />
      <Breadcrumb>
        <BreadcrumbList className="font-mono text-[11px] text-[#9ca3af]">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="text-[#f8fafc] font-semibold">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href} className="text-[#9ca3af] hover:text-[#818cf8] transition-colors">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-[#64748b]" />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <NotificationBell />
      </div>
    </header>
  )
}
