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
  title: 'InterviewAI - Master Your Technical Interviews',
  description: 'AI-powered interview simulator that helps you prepare for technical interviews with real-time feedback, weakness detection, and personalized learning roadmaps.',
  generator: 'v0.app',
  keywords: ['interview prep', 'technical interview', 'AI interviewer', 'coding interview', 'software engineering'],
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
