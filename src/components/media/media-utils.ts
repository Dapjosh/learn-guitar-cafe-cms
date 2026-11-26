/**
 * Helpers shared by the media slices (study card, video playlist):
 * recognise video providers, build embed URLs that start at a given time,
 * and parse chapter times like "1:15".
 */

export type VideoProvider = 'bunny' | 'youtube' | 'vimeo' | 'file';

export type VideoSource = {
  provider: VideoProvider;
  /** Provider video id (YouTube/Vimeo id, Bunny video GUID) */
  id?: string;
  /** Bunny library id */
  libraryId?: string;
  /** Original URL (used for files) */
  url: string;
};

/** Reads a Prismic Link / Embed field or a plain string into a URL. */
export const urlFromField = (field: any): string =>
  (typeof field === 'string' ? field : field?.embed_url || field?.url || '') || '';

export function parseVideoSource(raw: string): VideoSource | null {
  const url = (raw || '').trim();
  if (!url) return null;

  // Bunny Stream: iframe.mediadelivery.net/embed|play/{library}/{video} or player.mediadelivery.net/embed/...
  const bunny = url.match(/mediadelivery\.net\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})/i);
  if (bunny) return { provider: 'bunny', libraryId: bunny[1], id: bunny[2], url };

  const yt = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return { provider: 'youtube', id: yt[1], url };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { provider: 'vimeo', id: vimeo[1], url };

  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) return { provider: 'file', url };

  return null;
}

/** Iframe URL for an embeddable source, optionally starting at `start` seconds and autoplaying. */
export function embedUrl(src: VideoSource, opts: { start?: number; autoplay?: boolean } = {}): string | null {
  const start = Math.max(0, Math.floor(opts.start || 0));
  const autoplay = !!opts.autoplay;
  switch (src.provider) {
    case 'bunny': {
      const params = new URLSearchParams({ autoplay: String(autoplay), preload: 'true', responsive: 'true' });
      if (start) params.set('t', String(start));
      return `https://iframe.mediadelivery.net/embed/${src.libraryId}/${src.id}?${params}`;
    }
    case 'youtube': {
      const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1', autoplay: autoplay ? '1' : '0' });
      if (start) params.set('start', String(start));
      return `https://www.youtube-nocookie.com/embed/${src.id}?${params}`;
    }
    case 'vimeo':
      return `https://player.vimeo.com/video/${src.id}?autoplay=${autoplay ? 1 : 0}&dnt=1${start ? `#t=${start}s` : ''}`;
    default:
      return null;
  }
}

/** Auto thumbnail where the provider exposes one without an API key (YouTube). */
export function autoThumbnail(src: VideoSource | null): string | null {
  if (src?.provider === 'youtube') return `https://i.ytimg.com/vi/${src.id}/hqdefault.jpg`;
  return null;
}

/** "1:15", "01:02:03" or "75" → seconds. */
export function parseTime(value: unknown): number | null {
  if (typeof value === 'number') return value >= 0 ? value : null;
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
  const parts = text.split(':').map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  return parts.reduce((total, n) => total * 60 + n, 0);
}

/** Seconds → "1:15" / "1:02:03". */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

export type Chapter = { title: string; start: number };

/** CMS chapter rows ({ title, start }) → sorted chapters. */
export function chaptersFromGroup(rows: any[] | null | undefined): Chapter[] {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => ({ title: String(r?.title || '').trim(), start: parseTime(r?.start) }))
    .filter((c): c is Chapter => !!c.title && c.start !== null)
    .sort((a, b) => a.start - b.start);
}
