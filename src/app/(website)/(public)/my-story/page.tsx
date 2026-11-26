import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { isFilled } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';

import { createClient } from '@/prismicio';
import { components } from '@/slices';
import myStoryMocks from '@/slices/MyStory/mocks.json';
import discographyMocks from '@/slices/Discography/mocks.json';

/**
 * /my-story — built from the "My Story Page" single document in Prismic.
 * Editors add My Story (Instructor / Story), Discography and any content or media slices.
 */
async function getMyStoryPage() {
  return createClient()
    .getSingle('my_story_page' as any)
    .catch(() => null);
}

/** 1200×630 social image via Prismic's imgix params. */
const shareImageUrl = (raw: string) => {
  const url = new URL(raw);
  url.searchParams.set('w', '1200');
  url.searchParams.set('h', '630');
  url.searchParams.set('fit', 'crop');
  return url.toString();
};

/** Slice Machine mock value → the shape Prismic returns (for the development preview). */
function fromMock(value: any): any {
  if (!value || typeof value !== 'object') return value;
  switch (value.__TYPE__) {
    case 'FieldContent':
    case 'BooleanContent':
      return value.value;
    case 'StructuredTextContent':
      return value.value.map((b: any) => ({ type: b.type, text: b.content.text, spans: b.content.spans || [] }));
    case 'GroupContentType':
      return value.value.map((item: any) => Object.fromEntries(item.value.map(([k, v]: [string, any]) => [k, fromMock(v)])));
    case 'LinkContent':
      return { link_type: 'Web', url: value.value?.url };
    default:
      return {};
  }
}

/** Sample sections shown in development until the My Story Page document is published. */
const sampleSlices = () =>
  [
    { type: 'my_story', mock: myStoryMocks.find((m: any) => m.variation === 'instructor') },
    { type: 'my_story', mock: myStoryMocks.find((m: any) => m.variation === 'story') },
    { type: 'discography', mock: discographyMocks[0] },
  ]
    .filter((s) => s.mock)
    .map(({ type, mock }, i) => ({
      id: `sample-${i}`,
      slice_type: type,
      slice_label: null,
      variation: (mock as any).variation,
      version: 'initial',
      primary: Object.fromEntries(Object.entries((mock as any).primary).map(([k, v]) => [k, fromMock(v)])),
      items: [],
    }));

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = await getMyStoryPage();
  const data = (page?.data ?? {}) as any;
  const parentMeta = await parent;
  const title = data.meta_title || data.title || 'My Story';

  return {
    title,
    description: data.meta_description || parentMeta.description,
    alternates: { canonical: '/my-story' },
    openGraph: {
      title,
      ...(isFilled.image(data.meta_image) ? { images: [{ url: shareImageUrl(data.meta_image.url) }] } : {}),
    },
  };
}

export default async function MyStoryPage() {
  const page = await getMyStoryPage();
  const slices = ((page?.data as any)?.slices ?? []) as any[];

  if (slices.length === 0) {
    // Visitors never see sample content: not found until the document is published
    if (process.env.NODE_ENV === 'production') notFound();
    return (
      <main>
        <SliceZone slices={sampleSlices() as any} components={components} />
      </main>
    );
  }

  return (
    <main>
      <SliceZone slices={slices} components={components} />
    </main>
  );
}
