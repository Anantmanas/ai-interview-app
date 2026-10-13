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

/**
 * Uploads a resume File to UploadThing storage and returns its CDN URL and file key.
 */
export async function uploadToUploadThing(file: File): Promise<{ url: string; key: string } | null> {
  const token = process.env.UPLOADTHING_TOKEN
  if (!token) {
    console.warn('[UploadThing] UPLOADTHING_TOKEN not configured in environment; skipping remote upload.')
    return null
  }

  try {
    const utapi = new UTApi()
    console.log('[UploadThing] Uploading file to storage:', file.name, `(${file.size} bytes)`)
    const res = await utapi.uploadFiles(file)
    const fileData = Array.isArray(res) ? res[0]?.data : res?.data
    const fileError = Array.isArray(res) ? res[0]?.error : res?.error

    if (fileError) {
      console.error('[UploadThing] Upload returned error:', fileError)
      return null
    }

    if (fileData) {
      const cdnUrl = (fileData as any).ufsUrl || fileData.url
      console.log('[UploadThing] Upload successful:', fileData.key, cdnUrl)
      return {
        url: cdnUrl,
        key: fileData.key,
      }
    }

    return null
  } catch (error) {
    console.error('[UploadThing] Failed to upload file to UploadThing:', error)
    return null
  }
}

