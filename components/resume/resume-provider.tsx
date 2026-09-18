'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export interface ResumeData {
  name: string
  skills: string[]
  experience: { role: string; company: string; years: number }[]
  education: string[]
  targetRole?: string
  summary?: string
}

export interface ResumeMeta {
  uploadedAt: string
  fileName: string
  source: 'onboarding' | 'dashboard' | 'interview-setup'
}

interface ResumeContextValue {
  resumeData: ResumeData | null
  resumeMeta: ResumeMeta | null
  isResumeReady: boolean
  isExtracting: boolean
  extractionError: string | null
  handleResumeUpload: (file: File, source: ResumeMeta['source']) => Promise<void>
  replaceResume: () => void
}

const DATA_KEY = 'interviewai_resume_data'
const META_KEY = 'interviewai_resume_meta'

function isCorruptedResumeData(data: ResumeData): boolean {
  const name = (data.name || '').trim()
  const summary = (data.summary || '').trim()
  if (name.startsWith('%PDF-')) return true
  if (summary.includes('/Type/Catalog')) return true
  return false
}

function isStaleResumeData(data: ResumeData): boolean {
  return (data.skills?.length ?? 0) === 0
}

export function saveResumePersistent(data: ResumeData, meta: ResumeMeta): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    // localStorage might be full or restricted
  }
}

export function loadResumePersistent(): ResumeData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(DATA_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ResumeData
    if (isCorruptedResumeData(parsed)) {
      localStorage.removeItem(DATA_KEY)
      localStorage.removeItem(META_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function loadResumeMetaPersistent(): ResumeMeta | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(META_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function hasResumePersistent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DATA_KEY) !== null
}

export function clearResumePersistent(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DATA_KEY)
  localStorage.removeItem(META_KEY)
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [resumeMeta, setResumeMeta] = useState<ResumeMeta | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      // 1. Fetch from server/DB as source of truth
      try {
        const res = await fetch('/api/resume')
        if (res.ok && !cancelled) {
          const payload = await res.json()
          if (payload?.resume && !cancelled) {
            const serverData = payload.resume as ResumeData
            const serverMeta = (payload.meta as ResumeMeta) || {
              uploadedAt: new Date().toISOString(),
              fileName: 'Saved Resume',
              source: 'dashboard',
            }

            if (!isCorruptedResumeData(serverData)) {
              setResumeData(serverData)
              setResumeMeta(serverMeta)
              saveResumePersistent(serverData, serverMeta) // Sync cache
              return
            }
          }
        }
      } catch (err) {
        console.warn('[ResumeProvider] Server hydration failed, falling back to localStorage:', err)
      }

      // 2. Fall back to localStorage only if server fetch didn't load data
      if (cancelled) return
      let localData = loadResumePersistent()
      let localMeta = loadResumeMetaPersistent()

      if (localData && (isCorruptedResumeData(localData) || isStaleResumeData(localData))) {
        clearResumePersistent()
        localData = null
        localMeta = null
      }

      if (localData) {
        setResumeData(localData)
        if (localMeta) setResumeMeta(localMeta)
      }
    }

    void hydrate()
    return () => { cancelled = true }
  }, [])

  const handleResumeUpload = async (file: File, source: ResumeMeta['source']) => {
    setIsExtracting(true)
    setExtractionError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(body?.error || `API error: ${res.status}`)
      }

      const extracted = body as ResumeData
      const meta: ResumeMeta = {
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        source,
      }

      saveResumePersistent(extracted, meta)
      setResumeData(extracted)
      setResumeMeta(meta)
    } catch (err: any) {
      setExtractionError(err?.message || 'Resume analysis failed. Please try again.')
      console.error('[ResumeProvider] upload error:', err)
    } finally {
      setIsExtracting(false)
    }
  }

  const replaceResume = () => {
    clearResumePersistent()
    setResumeData(null)
    setResumeMeta(null)
    setExtractionError(null)
  }

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        resumeMeta,
        isResumeReady: resumeData !== null,
        isExtracting,
        extractionError,
        handleResumeUpload,
        replaceResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume(): ResumeContextValue {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used inside <ResumeProvider>')
  return ctx
}
