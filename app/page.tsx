import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BrainCircuit, 
  Mic, 
  MessageSquare, 
  FileText, 
  Target, 
  TrendingUp, 
  Map, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react'

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Interviewer',
    description: 'Practice with an AI that adapts to your skill level and provides realistic interview scenarios.',
  },
  {
    icon: Mic,
    title: 'Voice + Text',
    description: 'Choose your preferred mode - speak naturally or type responses for a flexible practice experience.',
  },
  {
    icon: FileText,
    title: 'Resume Analysis',
    description: 'Upload your resume and get personalized questions tailored to your background and target role.',
  },
  {
    icon: Target,
    title: 'Dynamic Questions',
    description: 'Questions adapt in real-time based on your answers, just like a real interview.',
  },
  {
    icon: TrendingUp,
    title: 'Weakness Detection',
    description: 'AI identifies knowledge gaps and areas that need improvement across your practice sessions.',
  },
  {
    icon: BarChart3,
    title: 'AI Scoring',
    description: 'Get detailed feedback and scores on technical accuracy, communication, and problem-solving.',
  },
  {
    icon: Sparkles,
    title: 'Session Memory',
    description: 'Your AI interviewer remembers context throughout the interview for natural conversations.',
  },
  {
    icon: Map,
    title: 'Learning Roadmap',
    description: 'Receive a personalized study plan with resources to address your specific weaknesses.',
  },
]

const benefits = [
  'Practice anytime, anywhere',
  'No scheduling needed',
  'Unlimited interview sessions',
  'Detailed performance analytics',
  'Personalized feedback',
  'Track your progress over time',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <BrainCircuit className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">InterviewAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              AI-Powered Interview Prep
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Master Technical Interviews with{' '}
              <span className="text-primary">AI-Powered Practice</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Practice with an intelligent AI interviewer that adapts to your skill level, 
              identifies your weaknesses, and creates a personalized roadmap for success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  See Features
                </Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {benefits.slice(0, 3).map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools to help you ace your next technical interview.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/50 hover:bg-card transition-colors">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and begin improving your interview skills immediately.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Our AI analyzes your background to create personalized interview questions.',
              },
              {
                step: '02',
                title: 'Start Practicing',
                description: 'Choose voice or text mode and begin your realistic interview simulation.',
              },
              {
                step: '03',
                title: 'Get Feedback & Improve',
                description: 'Review detailed feedback, track progress, and follow your learning roadmap.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of developers who have improved their interview skills with InterviewAI.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/sign-up">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <BrainCircuit className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">InterviewAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built to help you succeed in technical interviews.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
