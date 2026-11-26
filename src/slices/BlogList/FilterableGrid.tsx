import React from 'react';
import { isFilled } from '@prismicio/client';

import { countBlogPosts, getBlogCategories, queryBlogPosts, type BlogCard } from './blog-query';
import { BlogGridView, type BlogTab } from './BlogGridView';

import type { JSX } from 'react';

export const ALL_TAB = '__all__';

const samplePosts: BlogCard[] = [
  ['Open D slide turnarounds', 'Lessons', 'Delta-style transition licks and turnaround patterns in open D, broken down step by step on video.', 6],
  ['Les Paul, father of the solid-body', 'Player spotlights', 'His life, his lutherie experiments and the multitrack recordings that changed how records are made.', 9],
  ['Choosing your first glass or brass slide', 'Gear & reviews', 'How tone, weight and sustain differ, so you can pick the slide that suits your style.', 6],
  ['Delta fingerpicking basics', 'Lessons', 'Steady-thumb bass patterns and off-beat melody syncopation in the Delta tradition.', 8],
].map(([title, category, description, minutes], i) => ({
  id: `sample-${i}`,
  title: title as string,
  description: description as string,
  image: null,
  categoryId: `sample-${category}`,
  categoryName: category as string,
  authorName: 'Paul Greig',
  readTime: minutes as number,
  url: '/blog/lessons',
}));

/**
 * "Filterable Grid" variation of BlogList: blog index with category tabs and
 * server-side "load more" (10 posts at a time by default).
 */
export const FilterableGrid = async ({ slice }: { slice: any }): Promise<JSX.Element | null> => {
  const primary = (slice?.primary || {}) as any;
  const pageSize =
    typeof primary.posts_per_page === 'number' && primary.posts_per_page > 0
      ? Math.min(Math.round(primary.posts_per_page), 50)
      : 10;

  // Tabs: every category, or the editor's chosen categories (in order, with optional labels)
  const categories = await getBlogCategories();
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const chosen = (primary.filters || [])
    .filter((f: any) => isFilled.contentRelationship(f?.category))
    .map((f: any) => ({ id: f.category.id as string, label: f.label || names.get(f.category.id) || 'Category' }));
  const useAllCategories = primary.show_all_categories === true || chosen.length === 0;
  let tabs: BlogTab[] = useAllCategories ? categories.map((c) => ({ id: c.id, label: c.name })) : chosen;

  const counts = await countBlogPosts(tabs.map((t) => t.id));
  if (useAllCategories && primary.hide_empty_categories !== false) {
    tabs = tabs.filter((t) => (counts[t.id] ?? 0) > 0);
  }

  const first = await queryBlogPosts({ page: 1, pageSize }).catch((error) => {
    console.error('[BlogList/filterableGrid] Failed to fetch posts', error);
    return { posts: [] as BlogCard[], total: 0, hasMore: false };
  });

  const isDev = process.env.NODE_ENV !== 'production';
  const useSamples = first.posts.length === 0 && isDev;

  return (
    <BlogGridView
      sliceType={slice.slice_type}
      variation={slice.variation}
      primary={primary}
      pageSize={pageSize}
      initialPosts={useSamples ? samplePosts : first.posts}
      initialHasMore={useSamples ? false : first.hasMore}
      tabs={
        useSamples
          ? ['Lessons', 'Player spotlights', 'Gear & reviews'].map((l) => ({ id: `sample-${l}`, label: l, count: null }))
          : tabs.map((t) => ({ ...t, count: counts[t.id] ?? 0 }))
      }
      allCount={useSamples ? null : counts[ALL_TAB] ?? first.total}
      isSample={useSamples}
    />
  );
};

export default FilterableGrid;
