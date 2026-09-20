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
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#2b292d] bg-[#121113] px-5">
      <SidebarTrigger className="-ml-1 text-[#7c7a85] hover:text-[#71d083] hover:bg-[#1a191b]" />
      <div className="h-3.5 w-px bg-[#2b292d] mx-2" />
      <Breadcrumb>
        <BreadcrumbList className="font-mono text-[11px] text-[#7c7a85]">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="text-[#e5e5e5] font-semibold">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href} className="text-[#7c7a85] hover:text-[#71d083] transition-colors">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-[#49474e]" />}
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
