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
    title: 'PRACTICE',
    items: [
      { title: 'Home', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Practice Now', href: '/interview/new', icon: Mic },
      { title: 'Past Sessions', href: '/dashboard/history', icon: History },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { title: 'My Progress', href: '/dashboard/analytics', icon: BarChart3 },
      { title: 'Study Plan', href: '/dashboard/roadmap', icon: Map },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { title: 'Referrals', href: '/dashboard/referrals', icon: Gift },
      { title: 'Profile', href: '/dashboard/profile', icon: UserIcon },
      { title: 'My Resume', href: '/dashboard/resume', icon: FileText },
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

  const accountName =
    user.user_metadata?.full_name?.trim() ||
    user.user_metadata?.name?.trim() ||
    profile?.full_name?.trim() ||
    user.email?.split('@')[0] ||
    'Engineer'

  const getInitials = () => {
    if (accountName) {
      return accountName
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.slice(0, 2).toUpperCase() ?? 'EN'
  }

  return (
    <SidebarBody className="justify-between h-screen h-[100dvh] min-h-screen w-full bg-[#000000] text-white border-r border-white/10">
      {/* Top Header / Logo & Navigation Items */}
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto min-h-0">
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center gap-2.5 pb-4 border-b border-white/10 min-h-[56px]',
            !open && 'justify-center px-0'
          )}
        >
          <div className="h-7 w-7 rounded-full bg-[#8052ff]/15 border border-[#8052ff]/40 flex items-center justify-center shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
          </div>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap min-w-0"
            >
              <span className="font-sans text-[15px] font-semibold text-white tracking-tight truncate">
                InterviewAI
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8052ff] bg-[#8052ff]/10 border border-[#8052ff]/30 px-1.5 py-0.5 rounded-full font-semibold">
                v2.4
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
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9a9a9a] px-3 py-1 font-medium whitespace-nowrap">
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
                        'flex items-center rounded-xl text-xs font-sans transition-all duration-150 cursor-pointer group',
                        open
                          ? 'gap-3 px-3 py-2 justify-start'
                          : 'justify-center p-2 w-9 h-9 mx-auto',
                        isActive
                          ? 'bg-white/[0.08] text-white font-medium border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                          : 'text-[#9a9a9a] hover:bg-white/[0.04] hover:text-white'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-[#8052ff]' : 'text-[#9a9a9a] group-hover:text-white'
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
      <div className="pt-3 border-t border-white/10 shrink-0 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/10',
                open ? 'gap-3 p-2 w-full' : 'justify-center p-1 w-10 h-10 mx-auto'
              )}
              title={!open ? (profile?.full_name ?? user.email ?? 'Account') : undefined}
            >
              {/* Avatar with Initials */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8052ff] to-[#a882ff] border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(128,82,255,0.35)]">
                <span className="font-mono text-[11px] text-white font-bold">
                  {getInitials()}
                </span>
              </div>

              {/* User Info when expanded */}
              {open && (
                <>
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden text-left">
                    <p className="font-mono text-[11px] text-white font-medium uppercase tracking-[0.04em] truncate">
                      {accountName}
                    </p>
                    <p className="font-mono text-[10px] text-[#9a9a9a] truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronUp className="h-3.5 w-3.5 text-[#9a9a9a] ml-auto shrink-0" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-[#0a0a0a] border border-white/10 text-white shadow-2xl rounded-2xl p-1.5 backdrop-blur-xl"
            side="top"
            align="start"
          >
            <DropdownMenuItem asChild className="focus:bg-white/[0.08] focus:text-white cursor-pointer rounded-xl font-mono text-[11px] uppercase tracking-wider py-2">
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4 text-[#8052ff]" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/[0.08] focus:text-white cursor-pointer rounded-xl font-mono text-[11px] uppercase tracking-wider py-2">
              <Link href="/dashboard/resume">
                <FileText className="mr-2 h-4 w-4 text-[#8052ff]" />
                My Resume
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/[0.08] focus:text-white cursor-pointer rounded-xl font-mono text-[11px] uppercase tracking-wider py-2">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4 text-[#8052ff]" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[#f43f5e] focus:bg-[#f43f5e]/10 focus:text-[#f43f5e] cursor-pointer rounded-xl font-mono text-[11px] uppercase tracking-wider py-2"
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
