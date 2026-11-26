import type { ImageField } from '@prismicio/client';
import { isFilled } from '@prismicio/client';

/**
 * Builds a square PNG of the given size from a Prismic image.
 * Prismic serves images through imgix, so resizing is done with URL params.
 */
export function siteIconUrl(field: ImageField | null | undefined, size: number): string | null {
  if (!field || !isFilled.image(field)) return null;
  try {
    const url = new URL(field.url);
    // Drop "auto=format" so browsers always get a real PNG (required for favicons)
    url.searchParams.delete('auto');
    url.searchParams.set('w', String(size));
    url.searchParams.set('h', String(size));
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('fm', 'png');
    return url.toString();
  } catch {
    return null;
  }
}

type IconDescriptor = { rel: string; url: string; type?: string; sizes?: string };

/**
 * <link rel="icon"> / apple-touch-icon entries for Next.js metadata.
 * Uses the Site Icon from the Settings document when set, otherwise the static files in /public.
 */
export function siteIconLinks(field: ImageField | null | undefined): IconDescriptor[] {
  if (field && isFilled.image(field)) {
    const png = (size: number) => siteIconUrl(field, size) as string;
    return [
      { rel: 'icon', type: 'image/png', sizes: '16x16', url: png(16) },
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: png(32) },
      { rel: 'icon', type: 'image/png', sizes: '48x48', url: png(48) },
      { rel: 'apple-touch-icon', sizes: '180x180', url: png(180) },
    ];
  }

  return [
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '48x48', url: '/favicon-48x48.png' },
    { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/apple-touch-icon.png' },
  ];
}

/**
 * Reads the Site Icon from a Settings document's data. Typed loosely so it works
 * before and after prismicio-types.d.ts is regenerated with the new field.
 */
export const getSiteIcon = (data: unknown): ImageField | null =>
  ((data as { site_icon?: ImageField } | null | undefined)?.site_icon ?? null);
