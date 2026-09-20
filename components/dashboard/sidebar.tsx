'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  Bell,
  HelpCircle,
  Gift,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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
    <Sidebar className="border-r border-[#2b292d] bg-[#121113] text-[#eeeef0] flex flex-col h-screen">
      <SidebarHeader className="p-0 bg-[#121113] border-none">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#2b292d]">
          <span className="h-2 w-2 rounded-full bg-[#71d083] led-pulse" />
          <span className="font-mono text-[13px] font-bold text-[#e5e5e5] tracking-[0.08em] uppercase">
            InterviewAI
          </span>
          <span className="ml-auto font-mono text-[9px] text-[#71d083] border border-[#366740] bg-[#1d3a24] rounded-sm px-1.5 py-0.5 tracking-[0.05em]">
            NEO v2.0
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0 py-2 bg-[#121113] gap-0">
        {navigation.map((group, idx) => (
          <SidebarGroup key={group.title} className="p-0">
            {idx > 0 && <div className="mx-5 my-3 h-px bg-[#2b292d]" />}
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#7c7a85] px-5 pt-3 pb-2 font-semibold">
              {group.title}
            </p>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-[6px] font-mono text-[12px] uppercase tracking-[0.04em] transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-[#1d3a24] border-l-2 border-[#71d083] text-[#71d083] font-semibold shadow-[0_0_15px_rgba(113,208,131,0.2)]'
                            : 'text-[#7c7a85] hover:bg-[#1a191b] hover:text-[#eeeef0]'
                        }`}
                      >
                        <Link href={item.href}>
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#71d083]' : 'text-[#7c7a85]'}`} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-[#2b292d] p-3 pb-8 bg-[#121113]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#1a191b] transition-colors cursor-pointer w-full border border-transparent hover:border-[#2b292d]"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#366740] to-[#71d083] border border-[#71d083]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(113,208,131,0.3)]">
                    <span className="font-mono text-[11px] text-[#04040b] font-bold">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-[#e5e5e5] font-semibold uppercase tracking-[0.04em] truncate">
                      {profile?.full_name ?? 'Engineer'}
                    </p>
                    <p className="font-mono text-[10px] text-[#7c7a85] truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronUp className="ml-auto h-3.5 w-3.5 text-[#7c7a85]" />
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-[#121113] border border-[#2b292d] text-[#eeeef0] shadow-2xl rounded-[8px] p-1.5"
                side="top"
                align="start"
              >
                <DropdownMenuItem asChild className="focus:bg-[#1a191b] focus:text-[#71d083] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase">
                  <Link href="/dashboard/profile">
                    <UserIcon className="mr-2 h-4 w-4 text-[#71d083]" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[#1a191b] focus:text-[#71d083] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase">
                  <Link href="/dashboard/resume">
                    <FileText className="mr-2 h-4 w-4 text-[#71d083]" />
                    Resume
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[#1a191b] focus:text-[#71d083] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4 text-[#70b8ff]" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2b292d] my-1" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-[#f87171] focus:bg-[#2a0e15] focus:text-[#f87171] cursor-pointer rounded-[4px] font-mono text-[12px] uppercase"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
