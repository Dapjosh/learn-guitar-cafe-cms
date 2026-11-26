'use server';

import { queryBlogPosts } from './blog-query';

/**
 * Server action for the blog grid: next page of posts, or the first page of another tab.
 */
export async function loadBlogPosts(args: { categoryId: string | null; page: number; pageSize: number }) {
  try {
    return await queryBlogPosts(args);
  } catch (error) {
    console.error('[BlogList/filterableGrid] Failed to load posts', error);
    return { posts: [], total: 0, hasMore: false, error: true as const };
  }
}
