import React from 'react';
import * as prismic from '@prismicio/client';
import { asText, isFilled } from '@prismicio/client';
import { createClient } from '@/prismicio';

import { CatalogView, type CatalogCourse, type CatalogFilter } from './CatalogView';

import type { JSX } from 'react';

/**
 * Props for `CourseCatalog`.
 */
export type CourseCatalogProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const fallbackCourses: CatalogCourse[] = [
  ['beginner-guitar-kickstarter', 'Beginner Guitar Kickstarter', ['Beginner', 'Standard tuning'], 'Chords, rhythm and your first songs, taught step by step so the basics feel musical from day one.'],
  ['blues-guitar-kickstarter', 'Blues Guitar Kickstarter', ['Beginner', 'Standard tuning'], 'Shuffles, turnarounds and soloing patterns that sit in the pocket instead of running scales.'],
  ['slide-guitar-unlocked', 'Slide Guitar Unlocked', ['Beginner to intermediate', 'Open E'], 'Open E slide from first notes to full songs. Intonation, muting and the vibrato that makes slide sing.'],
].map(([uid, title, tags, description], i) => ({
  id: `sample-${i}`,
  title: title as string,
  description: description as string,
  image: null,
  tags: tags as string[],
  features: [
    { icon: 'Video', label: 'Step-by-step video lessons' },
    { icon: 'TABs', label: 'Interactive TABs & backing tracks' },
  ],
  metaLine: 'Video · TABs · Tracks',
  link: { link_type: 'Web', url: `/courses/${uid}` },
  categoryId: i === 0 ? 'sample-free' : 'sample-pro',
}));

const fallbackFilters: CatalogFilter[] = [
  { id: 'sample-free', label: 'Free' },
  { id: 'sample-pro', label: 'Pro' },
];

async function getCatalog(primary: any) {
  const client = createClient();

  const [courseDocs, categoryDocs] = await Promise.all([
    client
      .getAllByType('course' as any, {
        fetchLinks: ['course_category.name'],
        orderings: [
          { field: 'my.course.display_order', direction: 'asc' },
          { field: 'document.first_publication_date', direction: 'desc' },
        ],
      })
      .catch((error) => {
        console.error('[CourseCatalog] Failed to fetch courses', error);
        return [] as prismic.PrismicDocument[];
      }),
    client.getAllByType('course_category' as any).catch(() => [] as prismic.PrismicDocument[]),
  ]);

  let courses: CatalogCourse[] = courseDocs.map((doc: any) => {
    const d = doc.data || {};
    return {
      id: doc.id,
      title: d.title || 'Untitled course',
      description: d.card_description || asText(d.summary) || '',
      image: isFilled.image(d.course_image) ? d.course_image : null,
      tags: (d.tags || []).map((t: any) => t?.tag).filter(Boolean),
      features: (d.features || [])
        .filter((f: any) => f?.label)
        .map((f: any) => ({ icon: f.icon || 'Check', label: f.label })),
      metaLine: d.meta_line || '',
      link: isFilled.link(d.course_link) ? d.course_link : { link_type: 'Web', url: `/courses/${doc.uid}` },
      categoryId: isFilled.contentRelationship(d.course_category) ? d.course_category.id : null,
    };
  });

  // Optional: hand-picked courses (in the editor's order)
  const pickedIds: string[] = (primary.featured_courses || [])
    .map((c: any) => (isFilled.contentRelationship(c?.course) ? c.course.id : null))
    .filter(Boolean);
  if (pickedIds.length > 0) {
    const byId = new Map(courses.map((c) => [c.id, c]));
    courses = pickedIds.map((id) => byId.get(id)).filter(Boolean) as CatalogCourse[];
  }

  // Optional: only show one category
  if (isFilled.contentRelationship(primary.only_category)) {
    courses = courses.filter((c) => c.categoryId === primary.only_category.id);
  }

  // Filter tabs: chosen in the slice (with optional label overrides), else every category
  const categoryNames = new Map(categoryDocs.map((c: any) => [c.id, c.data?.name || c.uid]));
  const configured: CatalogFilter[] = (primary.filters || [])
    .filter((f: any) => isFilled.contentRelationship(f?.category))
    .map((f: any) => ({
      id: f.category.id,
      label: f.label || categoryNames.get(f.category.id) || f.category.uid || 'Category',
    }));
  const filters: CatalogFilter[] =
    configured.length > 0
      ? configured
      : categoryDocs
          .map((c: any) => ({ id: c.id, label: categoryNames.get(c.id) as string }))
          .sort((a, b) => a.label.localeCompare(b.label));

  return { courses, filters };
}

/**
 * Component for "CourseCatalog" Slices: filterable course list ("list" variation)
 * or card grid ("grid" variation), fed by Course documents.
 */
const CourseCatalog = async ({ slice }: CourseCatalogProps): Promise<JSX.Element | null> => {
  const primary = (slice?.primary || {}) as any;
  const { courses, filters } = await getCatalog(primary);

  const isDev = process.env.NODE_ENV !== 'production';
  // No courses: hide for visitors; preview sample courses in development (e.g. Slice Machine)
  if (courses.length === 0 && !isDev) return null;
  const useSamples = courses.length === 0;

  return (
    <CatalogView
      sliceType={slice.slice_type}
      variation={slice.variation === 'grid' ? 'grid' : 'list'}
      primary={primary}
      courses={useSamples ? fallbackCourses : courses}
      filters={useSamples ? fallbackFilters : filters}
    />
  );
};

export default CourseCatalog;
