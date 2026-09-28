'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import {
  Sidebar,
  SidebarBody,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Mic,
  History,
  Map,
  Settings,
  User as UserIcon,
  LogOut,
  ChevronUp,
  FileText,
  CreditCard,
  BarChart3,
  Gift,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navigation = [
  {
    title: 'OPERATING CORE',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Start Interview', href: '/interview/new', icon: Mic },
      { title: 'Session History', href: '/dashboard/history', icon: History },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { title: 'Telemetry Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { title: 'Mastery Roadmap', href: '/dashboard/roadmap', icon: Map },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      { title: 'Billing & Quota', href: '/dashboard/billing', icon: CreditCard },
      { title: 'Referral Engine', href: '/dashboard/referrals', icon: Gift },
      { title: 'Candidate Profile', href: '/dashboard/profile', icon: UserIcon },
      { title: 'Resume Grounding', href: '/dashboard/resume', icon: FileText },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

function SidebarInnerContent({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { open, setOpen } = useSidebar()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.slice(0, 2).toUpperCase() ?? 'EN'
  }

  return (
    <SidebarBody className="justify-between h-screen h-[100dvh] min-h-screen w-full bg-[#050505] text-[#F4F2EC] border-r border-white/10">
      {/* Top Header / Logo & Navigation Items */}
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto min-h-0">
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center gap-2.5 pb-4 border-b border-white/10 min-h-[56px]',
            !open && 'justify-center px-0'
          )}
        >
          <div className="h-7 w-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#2447FF]" />
          </div>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap min-w-0"
            >
              <span className="font-display text-[15px] font-bold text-[#F4F2EC] tracking-tight truncate">
                InterviewAI
              </span>
            </motion.div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="mt-5 flex flex-col gap-5">
          {navigation.map((group, groupIdx) => (
            <div key={group.title} className="flex flex-col gap-1">
              {groupIdx > 0 && <div className="my-1 h-px bg-white/[0.06]" />}
              {open && (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8C8C88] px-3 py-1 font-medium whitespace-nowrap">
                  {group.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!open ? item.title : undefined}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setOpen(false)
                        }
                      }}
                      className={cn(
                        'flex items-center rounded-lg text-xs font-sans transition-all duration-150 cursor-pointer group',
                        open
                          ? 'gap-3 px-3 py-2 justify-start'
                          : 'justify-center p-2 w-9 h-9 mx-auto',
                        isActive
                          ? 'bg-white/[0.08] text-white font-medium'
                          : 'text-[#8C8C88] hover:bg-white/[0.04] hover:text-[#F4F2EC]'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-[#2447FF]' : 'text-[#8C8C88] group-hover:text-white'
                        )}
                      />
                      {open && (
                        <span className="truncate whitespace-nowrap">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile Section */}
      <div className="pt-3 border-t border-[#142347] shrink-0 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center rounded-xl hover:bg-[#060b18] transition-colors cursor-pointer border border-transparent hover:border-[#142347]',
                open ? 'gap-3 p-2 w-full' : 'justify-center p-1 w-10 h-10 mx-auto'
              )}
              title={!open ? (profile?.full_name ?? user.email ?? 'Account') : undefined}
            >
              {/* Avatar with Initials */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1d4ed8] to-[#3b82f6] border border-[#60a5fa]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.35)]">
                <span className="font-mono text-[11px] text-white font-bold">
                  {getInitials()}
                </span>
              </div>

              {/* User Info when expanded */}
              {open && (
                <>
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden text-left">
                    <p className="font-mono text-[11px] text-[#f8fafc] font-semibold uppercase tracking-[0.04em] truncate">
                      {profile?.full_name ?? 'Engineer'}
                    </p>
                    <p className="font-mono text-[10px] text-[#64748b] truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronUp className="h-3.5 w-3.5 text-[#64748b] ml-auto shrink-0" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-[#060b18] border border-[#142347] text-[#f8fafc] shadow-2xl rounded-xl p-1.5 backdrop-blur-xl"
            side="top"
            align="start"
          >
            <DropdownMenuItem asChild className="focus:bg-[#0a1226] focus:text-[#60a5fa] cursor-pointer rounded-lg font-mono text-[11px] uppercase tracking-wider py-2">
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4 text-[#3b82f6]" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#0a1226] focus:text-[#60a5fa] cursor-pointer rounded-lg font-mono text-[11px] uppercase tracking-wider py-2">
              <Link href="/dashboard/resume">
                <FileText className="mr-2 h-4 w-4 text-[#3b82f6]" />
                Resume Grounding
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#0a1226] focus:text-[#60a5fa] cursor-pointer rounded-lg font-mono text-[11px] uppercase tracking-wider py-2">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4 text-[#3b82f6]" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#142347] my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[#f43f5e] focus:bg-[#2a0e15] focus:text-[#f43f5e] cursor-pointer rounded-lg font-mono text-[11px] uppercase tracking-wider py-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarBody>
  )
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  return <SidebarInnerContent user={user} profile={profile} />
}
