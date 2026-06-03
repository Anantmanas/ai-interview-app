import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Mail, CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
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
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link to verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open the email we sent you</li>
                  <li>Click the confirmation link</li>
                  <li>Start preparing for your interviews!</li>
                </ol>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href="/auth/login">
                Return to sign in
              </Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {"Didn't receive the email? Check your spam folder or"}{' '}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                try again
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
