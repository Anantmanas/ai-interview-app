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
    title: 'MAIN',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Start Interview', href: '/interview/new', icon: Mic },
      { title: 'Interview History', href: '/dashboard/history', icon: History },
    ],
  },
  {
    title: 'PROGRESS',
    items: [
      { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { title: 'Learning Roadmap', href: '/dashboard/roadmap', icon: Map },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { title: 'Referrals', href: '/dashboard/referrals', icon: Gift },
      { title: 'Profile', href: '/dashboard/profile', icon: UserIcon },
      { title: 'Resume', href: '/dashboard/resume', icon: FileText },
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
    return user.email?.slice(0, 2).toUpperCase() ?? 'U'
  }

  return (
    <SidebarBody className="justify-between h-screen h-[100dvh] min-h-screen w-full bg-[#08080c] text-[#f8fafc]">
      {/* Top Header / Logo & Navigation Items */}
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto min-h-0">
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center gap-2.5 pb-3 border-b border-[#1e1e2f] min-h-[52px]',
            !open && 'justify-center px-0'
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-[#14142b] border border-[#3730a3] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1] led-pulse" />
          </div>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap min-w-0"
            >
              <span className="font-mono text-[13px] font-bold text-[#f8fafc] tracking-[0.08em] uppercase truncate">
                InterviewAI
              </span>
              <span className="font-mono text-[9px] text-[#818cf8] border border-[#3730a3] bg-[#14142b] rounded-sm px-1.5 py-0.5 tracking-[0.05em] shrink-0">
                NEO v2.0
              </span>
            </motion.div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="mt-4 flex flex-col gap-3">
          {navigation.map((group, groupIdx) => (
            <div key={group.title} className="flex flex-col gap-1">
              {groupIdx > 0 && <div className="my-1 h-px bg-[#1e1e2f]" />}
              {open && (
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#64748b] px-2.5 py-1 font-semibold whitespace-nowrap">
                  {group.title}
                </p>
              )}
              <div className="flex flex-col gap-1">
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
                        // Close sidebar on mobile item click
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setOpen(false)
                        }
                      }}
                      className={cn(
                        'flex items-center rounded-lg font-mono text-[12px] uppercase tracking-[0.04em] transition-all duration-150 cursor-pointer group',
                        open
                          ? 'gap-3 px-2.5 py-2 justify-start'
                          : 'justify-center p-2 w-10 h-10 mx-auto',
                        isActive
                          ? 'bg-[#14142b] border-l-2 border-[#6366f1] text-[#818cf8] font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                          : 'text-[#9ca3af] hover:bg-[#0f0f18] hover:text-white'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-[#818cf8]' : 'text-[#9ca3af] group-hover:text-white'
                        )}
                      />
                      {open && (
                        <span className="truncate whitespace-nowrap transition-transform duration-150 group-hover:translate-x-0.5">
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
      <div className="pt-3 border-t border-[#1e1e2f] shrink-0 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center rounded-lg hover:bg-[#0f0f18] transition-colors cursor-pointer border border-transparent hover:border-[#1e1e2f]',
                open ? 'gap-2.5 p-1.5 w-full' : 'justify-center p-1 w-10 h-10 mx-auto'
              )}
              title={!open ? (profile?.full_name ?? user.email ?? 'Account') : undefined}
            >
              {/* Avatar with Initials */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3730a3] to-[#6366f1] border border-[#4f46e5]/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(79,70,229,0.35)]">
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
            className="w-56 bg-[#09090e] border border-[#1e1e2f] text-[#f8fafc] shadow-2xl rounded-lg p-1.5"
            side="top"
            align="start"
          >
            <DropdownMenuItem asChild className="focus:bg-[#14142b] focus:text-[#818cf8] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase">
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4 text-[#818cf8]" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#14142b] focus:text-[#818cf8] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase">
              <Link href="/dashboard/resume">
                <FileText className="mr-2 h-4 w-4 text-[#818cf8]" />
                Resume
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#14142b] focus:text-[#818cf8] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4 text-[#818cf8]" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1e1e2f] my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[#f87171] focus:bg-[#2a0e15] focus:text-[#f87171] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase"
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
