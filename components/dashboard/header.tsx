'use client'

import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
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

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

const pathNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/weaknesses': 'Weaknesses',
  '/interview': 'Interview',
  '/interview/new': 'New Interview',
  '/history': 'Interview History',
  '/roadmap': 'Learning Roadmap',
  '/profile': 'Profile',
  '/profile/resume': 'Resume',
  '/settings': 'Settings',
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    // Check for exact match first
    if (pathNames[pathname]) {
      return pathNames[pathname]
    }
    // Check for partial matches (for dynamic routes)
    for (const [path, name] of Object.entries(pathNames)) {
      if (pathname.startsWith(path) && path !== '/dashboard') {
        return name
      }
    }
    return 'Dashboard'
  }

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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
