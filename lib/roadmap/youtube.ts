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
 * Search YouTube for 2-4 best tutorial videos on a given topic.
 * Returns empty array if the API key is missing or the quota is exhausted.
 */
export async function searchYouTubeMulti(
  query: string,
  maxResults: number = 3
): Promise<YouTubeResource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.warn('[YouTube] YOUTUBE_API_KEY not set — skipping YouTube search')
    return []
  }

  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', String(Math.min(4, Math.max(1, maxResults))))
    searchUrl.searchParams.set('relevanceLanguage', 'en')
    searchUrl.searchParams.set('videoDuration', 'medium') // 4–20 min — best for tutorials
    searchUrl.searchParams.set('order', 'relevance')
    searchUrl.searchParams.set('key', apiKey)

    const searchRes = await fetch(searchUrl.toString())

    if (!searchRes.ok) {
      const errorText = await searchRes.text()
      console.error(`[YouTube] Search failed (${searchRes.status}):`, errorText)
      return []
    }

    const searchData = await searchRes.json()
    const items = searchData.items || []
    if (items.length === 0) return []

    const videoIds = items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean)

    // Optionally fetch durations for all videos in batch (costs 1 unit total)
    const durationMap: Record<string, string> = {}
    if (videoIds.length > 0) {
      try {
        const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
        videoUrl.searchParams.set('part', 'contentDetails')
        videoUrl.searchParams.set('id', videoIds.join(','))
        videoUrl.searchParams.set('key', apiKey)

        const videoRes = await fetch(videoUrl.toString())
        if (videoRes.ok) {
          const videoData = await videoRes.json()
          for (const v of videoData.items || []) {
            if (v.id && v.contentDetails?.duration) {
              durationMap[v.id] = parseDuration(v.contentDetails.duration)
            }
          }
        }
      } catch {
        // Duration is optional — swallow errors
      }
    }

    return items
      .map((item: any): YouTubeResource | null => {
        const videoId = item.id?.videoId
        const snippet = item.snippet
        if (!videoId || !snippet) return null

        return {
          type: 'video',
          title: snippet.title as string,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail:
            (snippet.thumbnails?.high?.url as string) ||
            (snippet.thumbnails?.medium?.url as string) ||
            (snippet.thumbnails?.default?.url as string) ||
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          channel: snippet.channelTitle as string,
          duration: durationMap[videoId] || '10:00',
        }
      })
      .filter(Boolean) as YouTubeResource[]
  } catch (err) {
    console.error('[YouTube] Unexpected error during search:', err)
    return []
  }
}

export async function searchYouTube(
  query: string
): Promise<YouTubeResource | null> {
  const list = await searchYouTubeMulti(query, 1)
  return list[0] || null
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
