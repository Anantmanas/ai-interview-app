import { UTApi } from 'uploadthing/server'

/**
 * Extracts the UploadThing file key from a URL or raw key string.
 * Supports URLs like:
 * - https://utfs.io/f/xyz
 * - https://ufs.sh/f/xyz
 * - https://<app-id>.ufs.sh/f/xyz
 * - raw key: xyz
 */
export function extractUploadThingFileKey(fileUrlOrKey: string): string {
  if (!fileUrlOrKey) return ''
  const trimmed = fileUrlOrKey.trim()
  if (trimmed.includes('/f/')) {
    return trimmed.split('/f/')[1].split('?')[0]
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const parts = trimmed.split('/')
    return parts[parts.length - 1].split('?')[0]
  }
  return trimmed
}

/**
 * Permanently deletes a file from UploadThing storage so user accounts never exceed usage limits.
 */
export async function deleteFromUploadThing(fileUrlOrKey: string | null | undefined): Promise<boolean> {
  if (!fileUrlOrKey) return false
  const token = process.env.UPLOADTHING_TOKEN
  if (!token) {
    console.warn('[UploadThing] UPLOADTHING_TOKEN not configured in environment; skipping remote file deletion.')
    return false
  }

  const fileKey = extractUploadThingFileKey(fileUrlOrKey)
  if (!fileKey) return false

  try {
    const utapi = new UTApi()
    console.log('[UploadThing] Purging file from storage:', fileKey)
    const res = await utapi.deleteFiles(fileKey)
    console.log('[UploadThing] Purge result:', res)
    return true
  } catch (error) {
    console.error('[UploadThing] Failed to delete file:', fileKey, error)
    return false
  }
}
