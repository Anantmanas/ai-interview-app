import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function InterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="w-full min-h-screen bg-[var(--color-carbon)] text-[var(--color-ash)] p-0 m-0">
      {children}
    </div>
  )
}
