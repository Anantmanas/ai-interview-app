/**
 * YouTube Data API v3 search helper.
 * Free tier: 10,000 units/day — 1 search = ~100 units → ~100 topics/day free.
 *
 * Returns a video resource for embedding in the roadmap card.
 */

export interface YouTubeResource {
  type: 'video'
  title: string
  url: string
  thumbnail: string
  channel: string
  duration?: string
}

/**
 * Search YouTube for the best tutorial video on a given topic.
 * Returns null if the API key is missing or the quota is exhausted.
 */
export async function searchYouTube(
  query: string
): Promise<YouTubeResource | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.warn('[YouTube] YOUTUBE_API_KEY not set — skipping YouTube search')
    return null
  }

  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', '1')
    searchUrl.searchParams.set('relevanceLanguage', 'en')
    searchUrl.searchParams.set('videoDuration', 'medium') // 4–20 min — best for tutorials
    searchUrl.searchParams.set('order', 'relevance')
    searchUrl.searchParams.set('key', apiKey)

    const searchRes = await fetch(searchUrl.toString())

    if (!searchRes.ok) {
      const errorText = await searchRes.text()
      // 403 = quota exceeded, 400 = bad key
      console.error(`[YouTube] Search failed (${searchRes.status}):`, errorText)
      return null
    }

    const searchData = await searchRes.json()
    const item = searchData.items?.[0]
    if (!item) return null

    const videoId: string = item.id?.videoId
    const snippet = item.snippet
    if (!videoId || !snippet) return null

    // Optionally fetch duration via videos endpoint (costs 1 extra unit)
    let duration: string | undefined
    try {
      const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      videoUrl.searchParams.set('part', 'contentDetails')
      videoUrl.searchParams.set('id', videoId)
      videoUrl.searchParams.set('key', apiKey)

      const videoRes = await fetch(videoUrl.toString())
      if (videoRes.ok) {
        const videoData = await videoRes.json()
        const iso = videoData.items?.[0]?.contentDetails?.duration as
          | string
          | undefined
        if (iso) {
          duration = parseDuration(iso)
        }
      }
    } catch {
      // Duration is optional — swallow errors
    }

    return {
      type: 'video',
      title: snippet.title as string,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail:
        (snippet.thumbnails?.medium?.url as string) ||
        (snippet.thumbnails?.default?.url as string) ||
        '',
      channel: snippet.channelTitle as string,
      duration,
    }
  } catch (err) {
    console.error('[YouTube] Unexpected error during search:', err)
    return null
  }
}

/**
 * Converts ISO 8601 duration (e.g. PT12M30S) → human-readable "12:30"
 */
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, '0')
  const ss = String(seconds).padStart(2, '0')

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}
