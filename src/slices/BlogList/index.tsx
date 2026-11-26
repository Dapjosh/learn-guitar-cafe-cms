'use server';
import { Content } from '@prismicio/client';

import { SliceComponentProps } from '@prismicio/react';
import { Bounded } from '@components/Bounded';
import { SectionBlog } from '@lgc_cms/features';
import { createClient } from '@/prismicio';
import { FeaturedArticles } from './FeaturedArticles';
import { FilterableGrid } from './FilterableGrid';

/**
 * Props for `BlogList`.
 */
export type BlogListProps = SliceComponentProps<Content.BlogListSlice>;

/**
 * Component for "BlogList" Slices.
 */
const BlogList = async ({ slice }: BlogListProps) => {
  if (slice.variation === 'filterableGrid') {
    return <FilterableGrid slice={slice} />;
  }

  if (slice.variation === 'featuredGrid') {
    return <FeaturedArticles slice={slice} />;
  }

  const getBlogPosts = async () => {
    const client = createClient();
    const pages = await client.getAllByType('blog_post', {
      limit: slice.primary?.limit || 3,
    });

    return pages;
  };

  const posts = await getBlogPosts();

  if (!posts) return null;

  return (
    <Bounded yPadding={'md'}>
      <SectionBlog
        posts={posts}
        section={{ ...slice.primary }}
        link={slice.primary.link && 'url' in slice.primary.link ? slice.primary.link : undefined}
        label={slice.primary.label}
      />
    </Bounded>
  );
};

export default BlogList;
