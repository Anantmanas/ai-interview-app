import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SupportWidget } from '@/components/help/support-widget'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // User's signup name is the source of truth for display across sidebar and header
  const signupName = user.user_metadata?.full_name?.trim() || user.user_metadata?.name?.trim()
  const effectiveFullName = signupName || profile?.full_name?.trim() || user.email?.split('@')[0] || 'Engineer'

  const effectiveProfile = {
    ...profile,
    id: user.id,
    email: user.email,
    full_name: effectiveFullName,
    target_role: profile?.target_role || 'Software Engineer',
  }

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} profile={effectiveProfile} />
      <SidebarInset className="bg-[#000000] min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Subtle Ambient Electric Iris Glow */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#8052ff] opacity-[0.05] blur-[150px]" />
          <div className="cyber-grid absolute inset-0 opacity-[0.08]" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <DashboardHeader user={user} profile={effectiveProfile} />
          <main className="flex-1 bg-[#000000] pb-28 sm:pb-12">
            {children}
          </main>
        </div>
        <SupportWidget />
      </SidebarInset>
    </SidebarProvider>
  )
}
