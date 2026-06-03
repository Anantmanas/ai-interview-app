import { ResumeDataService } from '@/lib/resume/data-service'
import { ResumeParsingService } from '@/lib/resume/parser-service'

type SupabaseClientLike = {
  from: (table: string) => any
}

export class ResumeUploadService {
  private dataService: ResumeDataService
  private parsingService: ResumeParsingService

  constructor(private supabase: SupabaseClientLike) {
    this.dataService = new ResumeDataService(supabase)
    this.parsingService = new ResumeParsingService()
  }

  async processUploadedResume(userId: string, file: { url: string; name?: string; size?: number | null }, options?: { force?: boolean }) {
    const existing = await this.dataService.getActiveResume(userId)

    if (!options?.force && existing?.status === 'READY' && existing.fileUrl === file.url) {
      return existing
    }

    await this.dataService.markProfileUploaded(userId, file.url)

    const versionRecord = await this.dataService.createVersion(userId, file)

    try {
      const parsed = await this.parsingService.parseFromUrl(file.url)

      await this.dataService.syncProfile(userId, file.url, parsed.structuredData, parsed.markdown)
      await this.dataService.markVersionReady(
        userId,
        versionRecord?.resumeId || null,
        versionRecord?.version.id || null,
        parsed.rawText,
        parsed.structuredData,
        parsed.markdown,
      )

      return this.dataService.getActiveResume(userId)
    } catch (error: any) {
      await this.dataService.markVersionFailed(
        versionRecord?.resumeId || null,
        versionRecord?.version.id || null,
        error.message || 'Failed to parse resume',
      )
      throw error
    }
  }
}

