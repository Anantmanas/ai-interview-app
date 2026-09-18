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
    <div className="w-full h-full min-h-screen max-h-screen overflow-hidden bg-[#000000] text-white p-0 m-0">
      {children}
    </div>
  )
}
