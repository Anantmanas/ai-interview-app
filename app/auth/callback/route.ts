import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const isRecovery =
          next.includes('settings') ||
          next.includes('password') ||
          next.includes('reset') ||
          searchParams.get('type') === 'recovery'

        if (!isRecovery) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('target_role')
            .eq('id', user.id)
            .maybeSingle()

          // If user has no profile record or has not set target_role, route to onboarding welcome
          if (!profile || !profile.target_role || !profile.target_role.trim()) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }
      }

      const destination = next === '/' ? '/dashboard' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
