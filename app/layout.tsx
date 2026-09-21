import type { Metadata } from 'next'
import { Red_Hat_Display, Red_Hat_Text, Red_Hat_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { ResumeProvider } from '@/components/resume/resume-provider'
import './globals.css'

const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-red-hat-display-variable',
  display: 'swap',
  preload: true,
})

const redHatText = Red_Hat_Text({
  subsets: ['latin'],
  variable: '--font-red-hat-text-variable',
  display: 'swap',
  preload: true,
})

const redHatMono = Red_Hat_Mono({
  subsets: ['latin'],
  variable: '--font-red-hat-mono-variable',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'InterviewAI — Master Technical Interviews with AI',
  description: 'Practice with an AI interviewer that adapts to your skill level. Real-time scoring, weakness detection, and personalized learning roadmaps.',
  keywords: ['technical interview', 'AI mock interview', 'coding interview prep', 'system design', 'FAANG prep', 'interview simulator'],
  openGraph: {
    title: 'InterviewAI — Master Technical Interviews with AI',
    description: 'AI-powered mock interviews with real-time scoring, weakness detection, and personalized study roadmaps.',
    url: 'https://ai-interview-app-virid.vercel.app',
    siteName: 'InterviewAI',
    type: 'website',
    images: [
      {
        url: `https://og-image.vercel.app/InterviewAI%20%E2%80%94%20Master%20Technical%20Interviews.png?theme=dark&md=1&fontSize=75px`,
        width: 1200,
        height: 630,
        alt: 'InterviewAI — AI-Powered Technical Interview Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewAI — Master Technical Interviews with AI',
    description: 'AI-powered mock interviews with real-time scoring and personalized roadmaps.',
    images: [`https://og-image.vercel.app/InterviewAI%20%E2%80%94%20Master%20Technical%20Interviews.png?theme=dark&md=1&fontSize=75px`],
  },
  other: {
    generator: '',   // overrides the v0.app generator tag — do not remove
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${redHatDisplay.variable} ${redHatText.variable} ${redHatMono.variable}`}
    >
      <body className="font-sans antialiased bg-[#000000] text-[#f8fafc] selection:bg-[#4f46e5]/35 selection:text-[#ffffff]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ResumeProvider>
            {children}
          </ResumeProvider>
          <Toaster position="top-right" richColors />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
