declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'

      // Supabase (Public Client & Server)
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY?: string
      NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?: string

      // App URL
      NEXT_PUBLIC_APP_URL?: string

      // AI Provider Credentials (Server-only)
      GEMINI_API_KEY?: string
      OPENAI_API_KEY?: string
      OPENROUTER_MODEL?: string
      OPENROUTER_EVAL_MODEL?: string
      GEMINI_MODEL?: string
      OPENAI_MODEL?: string
      OPENAI_EVAL_MODEL?: string

      // Razorpay Credentials (Secured - Server-only)
      RAZORPAY_KEY_ID?: string
      RAZORPAY_KEY_SECRET?: string
      RAZORPAY_PRO_PLAN_ID?: string
      RAZORPAY_WEBHOOK_SECRET?: string

      // Email Service (Server-only)
      RESEND_API_KEY?: string
      RESEND_FROM_EMAIL?: string

      // File Storage (Server-only)
      UPLOADTHING_TOKEN?: string
    }
  }
}

export {}
