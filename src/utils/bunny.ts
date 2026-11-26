import type { Chapter } from '@/components/media/media-utils';

/**
 * Reads a video's chapters from Bunny Stream (the chapters set in the Bunny dashboard).
 * Server-only: needs the BUNNY_STREAM_API_KEY environment variable (Stream library API key).
 * Results are cached for an hour. Returns [] when unavailable.
 */
export async function getBunnyChapters(libraryId?: string, videoId?: string): Promise<Chapter[]> {
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  if (!apiKey || !libraryId || !videoId) return [];

  try {
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
      headers: { AccessKey: apiKey, Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error('[bunny] Could not load video details', res.status);
      return [];
    }
    const data = await res.json();
    return (Array.isArray(data?.chapters) ? data.chapters : [])
      .map((c: any) => ({ title: String(c?.title || '').trim(), start: Number(c?.start) }))
      .filter((c: Chapter) => c.title && Number.isFinite(c.start) && c.start >= 0)
      .sort((a: Chapter, b: Chapter) => a.start - b.start);
  } catch (error) {
    console.error('[bunny] Chapters request failed', error);
    return [];
  }
}
