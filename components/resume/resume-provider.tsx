'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { StoredResumeItem } from '@/lib/resume/types'

export interface ResumeData {
  name: string
  skills: string[]
  experience: { role: string; company: string; years?: number; duration?: string; highlights?: string[] }[]
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
  storedResumes: StoredResumeItem[]
  activeResumeId: string | null
  isResumeReady: boolean
  isExtracting: boolean
  isLimitReached: boolean
  extractionError: string | null
  limitModalOpen: boolean
  setLimitModalOpen: (open: boolean) => void
  handleResumeUpload: (file: File, source: ResumeMeta['source']) => Promise<boolean>
  deleteResume: (id: string) => Promise<boolean>
  activateResume: (id: string) => Promise<boolean>
  replaceResume: () => void
  refreshResumes: () => Promise<void>
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

export function saveResumePersistent(data: ResumeData, meta: ResumeMeta): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {}
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

export function clearResumePersistent(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DATA_KEY)
  localStorage.removeItem(META_KEY)
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [storedResumes, setStoredResumes] = useState<StoredResumeItem[]>([])
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [resumeMeta, setResumeMeta] = useState<ResumeMeta | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [limitModalOpen, setLimitModalOpen] = useState(false)

  const isLimitReached = storedResumes.length >= 2

  const activeResumeId = storedResumes.find(r => r.isActive)?.id || (storedResumes[0]?.id ?? null)

  const refreshResumes = useCallback(async () => {
    try {
      const res = await fetch('/api/resume')
      if (res.ok) {
        const payload = await res.json()
        if (payload?.resumes && Array.isArray(payload.resumes)) {
          setStoredResumes(payload.resumes)
          const active = payload.resumes.find((r: StoredResumeItem) => r.isActive) || payload.resumes[0]
          if (active) {
            setResumeData(active.data)
            setResumeMeta({
              uploadedAt: active.uploadedAt,
              fileName: active.fileName,
              source: 'dashboard',
            })
            saveResumePersistent(active.data, {
              uploadedAt: active.uploadedAt,
              fileName: active.fileName,
              source: 'dashboard',
            })
          } else {
            setResumeData(null)
            setResumeMeta(null)
            clearResumePersistent()
          }
        }
      }
    } catch (err) {
      console.warn('[ResumeProvider] refreshResumes failed:', err)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      // 1. Instant local cache for smooth UX
      const localData = loadResumePersistent()
      const localMeta = loadResumeMetaPersistent()

      if (localData && !isCorruptedResumeData(localData)) {
        if (!cancelled) {
          setResumeData(localData)
          if (localMeta) setResumeMeta(localMeta)
        }
      }

      const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
      const isPublicRoute = pathname === '/' || pathname.startsWith('/auth')
      if (isPublicRoute) return

      // 2. Fetch server source of truth
      try {
        const res = await fetch('/api/resume')
        if (res.ok && !cancelled) {
          const payload = await res.json()
          if (payload?.resumes && Array.isArray(payload.resumes)) {
            setStoredResumes(payload.resumes)
            const active = payload.resumes.find((r: StoredResumeItem) => r.isActive) || payload.resumes[0]
            if (active && !cancelled) {
              setResumeData(active.data)
              setResumeMeta({
                uploadedAt: active.uploadedAt,
                fileName: active.fileName,
                source: 'dashboard',
              })
              saveResumePersistent(active.data, {
                uploadedAt: active.uploadedAt,
                fileName: active.fileName,
                source: 'dashboard',
              })
            }
          }
        }
      } catch (err) {
        console.warn('[ResumeProvider] Server hydration failed, using cached state:', err)
      }
    }

    void hydrate()
    return () => { cancelled = true }
  }, [])

  const handleResumeUpload = async (file: File, source: ResumeMeta['source']): Promise<boolean> => {
    if (storedResumes.length >= 2) {
      setLimitModalOpen(true)
      setExtractionError('Maximum 2 resumes allowed. Please remove at least 1 previous resume to upload a new one.')
      return false
    }

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
        if (body?.limitReached) {
          setLimitModalOpen(true)
        }
        throw new Error(body?.error || `API error: ${res.status}`)
      }

      const extracted = body as ResumeData
      const meta: ResumeMeta = {
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        source,
      }

      saveResumePersistent(extracted, meta)
      setResumeData({ ...extracted })
      setResumeMeta({ ...meta })
      if (body?.resumes && Array.isArray(body.resumes)) {
        setStoredResumes(body.resumes)
      } else {
        void refreshResumes()
      }
      return true
    } catch (err: any) {
      const message = err?.message || 'Resume analysis failed. Please try again.'
      setExtractionError(message)
      console.error('[ResumeProvider] upload error:', err)
      return false
    } finally {
      setIsExtracting(false)
    }
  }

  const deleteResume = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/resume?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        if (data.resumes && Array.isArray(data.resumes)) {
          setStoredResumes(data.resumes)
          const active = data.resumes.find((r: StoredResumeItem) => r.isActive) || data.resumes[0]
          if (active) {
            setResumeData(active.data)
            setResumeMeta({
              uploadedAt: active.uploadedAt,
              fileName: active.fileName,
              source: 'dashboard',
            })
            saveResumePersistent(active.data, {
              uploadedAt: active.uploadedAt,
              fileName: active.fileName,
              source: 'dashboard',
            })
          } else {
            setResumeData(null)
            setResumeMeta(null)
            clearResumePersistent()
          }
        } else {
          void refreshResumes()
        }
        return true
      }
      return false
    } catch (err) {
      console.error('[ResumeProvider] deleteResume failed:', err)
      return false
    }
  }

  const activateResume = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/resume', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        if (data.resumes && Array.isArray(data.resumes)) {
          setStoredResumes(data.resumes)
          const active = data.resumes.find((r: StoredResumeItem) => r.id === id || r.isActive)
          if (active) {
            setResumeData(active.data)
            setResumeMeta({
              uploadedAt: active.uploadedAt,
              fileName: active.fileName,
              source: 'dashboard',
            })
            saveResumePersistent(active.data, {
              uploadedAt: active.uploadedAt,
              fileName: active.fileName,
              source: 'dashboard',
            })
          }
        } else {
          void refreshResumes()
        }
        return true
      }
      return false
    } catch (err) {
      console.error('[ResumeProvider] activateResume failed:', err)
      return false
    }
  }

  const replaceResume = () => {
    setLimitModalOpen(false)
    setExtractionError(null)
  }

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        resumeMeta,
        storedResumes,
        activeResumeId,
        isResumeReady: resumeData !== null || storedResumes.length > 0,
        isExtracting,
        isLimitReached,
        extractionError,
        limitModalOpen,
        setLimitModalOpen,
        handleResumeUpload,
        deleteResume,
        activateResume,
        replaceResume,
        refreshResumes,
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

