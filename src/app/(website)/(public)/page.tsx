import { SliceZone } from '@prismicio/react';
import { components } from '@/slices';
import { createClient } from '@/prismicio';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { ResolvedOpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import { OGImage } from '@lgc_cms/types';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle('home').catch(() => notFound());

  let image = null;
  const parentMeta = await parent;
  const parentOpenGraph: ResolvedOpenGraph | null =
    parentMeta.openGraph ?? null;

  if (image) {
    image = `${page.data.meta_image.url}?w=1200&h=630&fit=crop&fm=webp&q=80`;
  }

  return {
    title: parentMeta.title,
    description: page.data.meta_description || parentMeta.description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: page.data.meta_title ?? parentMeta.title ?? undefined,
      images: [
        {
          url:
            image ??
            (parentOpenGraph?.images
              ? (parentOpenGraph.images[0] as OGImage).url
              : ''),
        },
      ],
    },
  };
}

export default async function Index() {
  const client = createClient();
  const page = await client
    .getSingle('home', {
      fetchLinks: [
        'course.course_image',
        'course.author',
        'course.title',
        'course.duration',
        'course.student_count',
        'course.original_price',
        'course.current_price',
        'course.category',
        'course_category.name'
      ],
    })
    .catch(() => notFound());

  return (
    <main>
      <SliceZone slices={page?.data.slices} components={components} />
    </main>
  );
}
