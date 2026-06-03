import { parseResumeMarkdown } from '@/lib/resume/format'
import type { ResumeLifecycleState, ResumeSnapshot, StructuredResumeData } from '@/lib/resume/types'

type SupabaseClientLike = {
  from: (table: string) => any
}

function isMissingResumeTableError(error: any) {
  return error?.code === '42P01' || String(error?.message || '').includes('schema cache')
}

function fallbackSnapshot(userId: string, profile: any): ResumeSnapshot {
  const parsed = profile?.resume_text ? parseResumeMarkdown(profile.resume_text) : null
  const structuredData = parsed
    ? {
        ...parsed,
        name: parsed.name || profile.full_name || null,
        position: parsed.position || profile.target_role || null,
        experience_level: parsed.experience_level || profile.experience_level || null,
      } as StructuredResumeData
    : null

  return {
    id: null,
    versionId: null,
    userId,
    fileUrl: profile?.resume_url || null,
    fileName: null,
    versionNumber: profile?.resume_url ? 1 : 0,
    status: profile?.resume_text ? 'READY' : profile?.resume_url ? 'PARSING' : 'FAILED',
    structuredData,
    markdown: profile?.resume_text || null,
    createdAt: profile?.created_at || null,
    updatedAt: profile?.updated_at || null,
    error: null,
  }
}

export class ResumeDataService {
  constructor(private supabase: SupabaseClientLike) {}

  async getActiveResume(userId: string): Promise<ResumeSnapshot | null> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: resume, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (error && !isMissingResumeTableError(error)) {
      throw error
    }

    if (!resume || error) {
      return profile?.resume_url || profile?.resume_text ? fallbackSnapshot(userId, profile) : null
    }

    const { data: version } = resume.active_version_id
      ? await this.supabase
          .from('resume_versions')
          .select('*')
          .eq('id', resume.active_version_id)
          .maybeSingle()
      : { data: null }

    const { data: parsed } = version?.id
      ? await this.supabase
          .from('parsed_resume_data')
          .select('*')
          .eq('resume_version_id', version.id)
          .maybeSingle()
      : { data: null }

    const structuredData = parsed?.structured_data || (profile?.resume_text ? parseResumeMarkdown(profile.resume_text) : null)

    return {
      id: resume.id,
      versionId: version?.id || null,
      userId,
      fileUrl: version?.file_url || profile?.resume_url || null,
      fileName: version?.file_name || null,
      versionNumber: version?.version_number || 1,
      status: (resume.status || version?.status || (parsed ? 'READY' : 'PARSING')) as ResumeLifecycleState,
      structuredData,
      markdown: parsed?.markdown || profile?.resume_text || null,
      createdAt: resume.created_at || null,
      updatedAt: resume.updated_at || null,
      error: resume.error_message || version?.error_message || null,
    }
  }

  async syncProfile(userId: string, fileUrl: string, structuredData: StructuredResumeData, markdown: string) {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        resume_url: fileUrl,
        resume_text: markdown,
        full_name: structuredData.name || null,
        target_role: structuredData.position || null,
        experience_level: structuredData.experience_level || 'mid',
      })
      .eq('id', userId)

    if (error) throw error
  }

  async markProfileUploaded(userId: string, fileUrl: string) {
    await this.supabase
      .from('profiles')
      .update({ resume_url: fileUrl })
      .eq('id', userId)
  }

  async createVersion(userId: string, file: { url: string; name?: string; size?: number | null }) {
    const resume = await this.ensureActiveResume(userId)

    if (!resume) return null

    const { count } = await this.supabase
      .from('resume_versions')
      .select('id', { count: 'exact', head: true })
      .eq('resume_id', resume.id)

    const { data: version, error } = await this.supabase
      .from('resume_versions')
      .insert({
        resume_id: resume.id,
        user_id: userId,
        file_url: file.url,
        file_name: file.name || null,
        file_size: file.size || null,
        version_number: (count || 0) + 1,
        status: 'PARSING',
      })
      .select('*')
      .single()

    if (error) {
      if (isMissingResumeTableError(error)) return null
      throw error
    }

    await this.supabase
      .from('resumes')
      .update({ active_version_id: version.id, status: 'PARSING', error_message: null })
      .eq('id', resume.id)

    return { resumeId: resume.id, version }
  }

  async markVersionReady(
    userId: string,
    resumeId: string | null,
    versionId: string | null,
    rawText: string,
    structuredData: StructuredResumeData,
    markdown: string,
  ) {
    if (!resumeId || !versionId) return

    await this.supabase
      .from('parsed_resume_data')
      .upsert({
        resume_version_id: versionId,
        user_id: userId,
        raw_text: rawText,
        structured_data: structuredData,
        markdown,
      }, { onConflict: 'resume_version_id' })

    await this.supabase
      .from('resume_versions')
      .update({ status: 'READY', parsed_at: new Date().toISOString(), error_message: null })
      .eq('id', versionId)

    await this.supabase
      .from('resumes')
      .update({ status: 'READY', active_version_id: versionId, error_message: null })
      .eq('id', resumeId)
  }

  async markVersionFailed(resumeId: string | null, versionId: string | null, message: string) {
    if (!resumeId || !versionId) return

    await this.supabase
      .from('resume_versions')
      .update({ status: 'FAILED', error_message: message })
      .eq('id', versionId)

    await this.supabase
      .from('resumes')
      .update({ status: 'FAILED', error_message: message })
      .eq('id', resumeId)
  }

  private async ensureActiveResume(userId: string) {
    const { data: existing, error: selectError } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (selectError) {
      if (isMissingResumeTableError(selectError)) return null
      throw selectError
    }

    if (existing) return existing

    const { data: inserted, error: insertError } = await this.supabase
      .from('resumes')
      .insert({ user_id: userId, is_active: true, status: 'PARSING' })
      .select('*')
      .single()

    if (insertError) {
      if (isMissingResumeTableError(insertError)) return null
      throw insertError
    }

    return inserted
  }
}
