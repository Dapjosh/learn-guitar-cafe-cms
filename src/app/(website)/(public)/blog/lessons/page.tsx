import type { Metadata, ResolvingMetadata } from 'next';
import { asText, isFilled } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';

import { createClient } from '@/prismicio';
import { components } from '@/slices';
import BlogList from '@/slices/BlogList';

/**
 * /blog/lessons — built from the "Blog" single document in Prismic.
 * Editors add the Blog List (Filterable Grid) slice plus any content slices.
 */
async function getBlogPage() {
  const client = createClient();
  return client.getSingle('blog').catch(() => null);
}

/** 1200×630 social image via Prismic's imgix params. */
const shareImageUrl = (raw: string) => {
  const url = new URL(raw);
  url.searchParams.set('w', '1200');
  url.searchParams.set('h', '630');
  url.searchParams.set('fit', 'crop');
  return url.toString();
};

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = await getBlogPage();
  const data = (page?.data ?? {}) as any;
  const parentMeta = await parent;
  const title = data.meta_title || asText(data.heading) || 'Blog';

  return {
    title,
    description: data.meta_description || data.subtitle || parentMeta.description,
    alternates: {
      canonical: '/blog/lessons',
      types: { 'application/rss+xml': '/feed.xml' },
    },
    openGraph: {
      title,
      ...(isFilled.image(data.meta_image) ? { images: [{ url: shareImageUrl(data.meta_image.url) }] } : {}),
    },
  };
}

export default async function BlogPage() {
  const page = await getBlogPage();
  const slices = ((page?.data as any)?.slices ?? []) as any[];

  // Until the Blog document has slices, show the blog grid with its defaults
  if (slices.length === 0) {
    return (
      <main>
        <BlogList
          slice={{ slice_type: 'blog_list', variation: 'filterableGrid', primary: {}, id: 'default-blog-grid' } as any}
          index={0}
          slices={[]}
          context={{}}
        />
      </main>
    );
  }

  return (
    <main>
      <SliceZone slices={slices} components={components} />
    </main>
  );
}
