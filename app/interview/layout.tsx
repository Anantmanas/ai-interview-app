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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
