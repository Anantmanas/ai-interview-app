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
    .single()

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} profile={profile} />
      <SidebarInset className="bg-[#04040b] min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Subtle Ambient Signal Green Orb */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#71d083] opacity-[0.04] blur-[150px]" />
          <div className="cyber-grid absolute inset-0 opacity-[0.15]" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <DashboardHeader user={user} profile={profile} />
          <main className="flex-1 bg-[#04040b]">
            {children}
          </main>
        </div>
        <SupportWidget />
      </SidebarInset>
    </SidebarProvider>
  )
}
