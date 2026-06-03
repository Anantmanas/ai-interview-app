'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and target career goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>
                Your target role and companies help the AI generate relevant interview questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={profile?.full_name || ''} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={profile?.email || ''} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input id="targetRole" defaultValue={profile?.target_role || ''} placeholder="Senior Frontend Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetCompanies">Target Companies (comma separated)</Label>
                <Input id="targetCompanies" defaultValue={profile?.target_companies?.join(', ') || ''} placeholder="Google, Meta, Amazon" />
              </div>
              <Button className="w-full">Save Profile</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Full Name</span>
                  {profile?.full_name ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-amber-500">Missing</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Target Role Set</span>
                  {profile?.target_role ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-amber-500">Not set</span>
                  )}
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(profile?.full_name ? 50 : 0) + (profile?.target_role ? 50 : 0)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
