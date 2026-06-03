import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BrainCircuit, AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <BrainCircuit className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">InterviewAI</span>
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during the authentication process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              This could happen if the link has expired or was already used. 
              Please try signing in again or create a new account.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Return to sign in
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sign-up">
                  Create new account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
