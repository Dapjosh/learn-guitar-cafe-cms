import type { Metadata, ResolvingMetadata } from 'next';
import { isFilled } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';

import { createClient } from '@/prismicio';
import { components } from '@/slices';
import CourseCatalog from '@/slices/CourseCatalog';

/**
 * /all-courses — built from the "Courses Page" single document in Prismic.
 * Editors add the Course Catalog slice plus any content slices (headers, text, FAQs…).
 */
async function getCoursesPage() {
  const client = createClient();
  return client.getSingle('courses_page' as any).catch(() => null);
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
  const page = await getCoursesPage();
  const data = (page?.data ?? {}) as any;
  const parentMeta = await parent;
  const title = data.meta_title || data.title || 'Courses';

  return {
    title,
    description: data.meta_description || parentMeta.description,
    alternates: { canonical: '/all-courses' },
    openGraph: {
      title,
      ...(isFilled.image(data.meta_image)
        ? { images: [{ url: shareImageUrl(data.meta_image.url) }] }
        : {}),
    },
  };
}

export default async function CoursesPage() {
  const page = await getCoursesPage();
  const slices = ((page?.data as any)?.slices ?? []) as any[];

  // Until the Courses Page document is published, show the catalog with its defaults
  if (slices.length === 0) {
    return (
      <main>
        <CourseCatalog
          slice={{ slice_type: 'course_catalog', variation: 'list', primary: {}, id: 'default-course-catalog' }}
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
