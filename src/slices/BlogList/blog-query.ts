import * as prismic from '@prismicio/client';
import { asText, isFilled } from '@prismicio/client';
import { createClient } from '@/prismicio';

/** Lean post data sent to the browser for the blog grid. */
export type BlogCard = {
  id: string;
  title: string;
  description: string;
  image: any;
  categoryId: string | null;
  categoryName: string;
  authorName: string;
  readTime: number | null;
  url: string;
};

const WORDS_PER_MINUTE = 200;
const FETCH_LINKS = ['blog_category.category', 'author.name'];

/** Minutes to read: the post's "Read Time" override, else estimated from the body. */
export function readTimeFor(data: any): number | null {
  if (typeof data?.read_time === 'number' && data.read_time > 0) return Math.round(data.read_time);
  const words = (asText(data?.main || []) ?? '').trim().split(/\s+/).filter(Boolean).length;
  return words > 0 ? Math.max(1, Math.round(words / WORDS_PER_MINUTE)) : null;
}

function toCard(doc: prismic.PrismicDocument<Record<string, any>>): BlogCard {
  const d = doc.data || {};
  return {
    id: doc.id,
    title: d.title || 'Untitled article',
    description: d.description || '',
    image: isFilled.image(d.feature_image) ? d.feature_image : null,
    categoryId: isFilled.contentRelationship(d.category) ? d.category.id : null,
    categoryName: d.category?.data?.category || '',
    authorName: d.author?.data?.name || '',
    readTime: readTimeFor(d),
    url: doc.url || `/blog/lessons/${doc.uid}`,
  };
}

const categoryFilter = (categoryId?: string | null) =>
  categoryId ? [prismic.filter.at('my.blog_post.category', categoryId)] : [];

/**
 * One page of blog posts (newest first), optionally in one category.
 */
export async function queryBlogPosts({
  categoryId,
  page = 1,
  pageSize = 10,
}: {
  categoryId?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<{ posts: BlogCard[]; total: number; hasMore: boolean }> {
  const client = createClient();
  const res = await client.getByType('blog_post', {
    page,
    pageSize: Math.min(Math.max(pageSize, 1), 100),
    fetchLinks: FETCH_LINKS,
    filters: categoryFilter(categoryId),
    orderings: [
      { field: 'my.blog_post.publishing_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
  });
  return {
    posts: res.results.map(toCard),
    total: res.total_results_size,
    hasMore: res.page < res.total_pages,
  };
}

/** Number of posts in total and per category (cheap: one result per query). */
export async function countBlogPosts(categoryIds: string[]): Promise<Record<string, number>> {
  const client = createClient();
  const count = (categoryId?: string) =>
    client
      .getByType('blog_post', { pageSize: 1, filters: categoryFilter(categoryId) })
      .then((r) => r.total_results_size)
      .catch(() => 0);

  const [all, ...perCategory] = await Promise.all([count(), ...categoryIds.map((id) => count(id))]);
  return Object.fromEntries([['__all__', all], ...categoryIds.map((id, i) => [id, perCategory[i]])]);
}

/** All blog categories, sorted by name. */
export async function getBlogCategories(): Promise<{ id: string; name: string }[]> {
  const client = createClient();
  const docs = await client.getAllByType('blog_category').catch(() => []);
  return docs
    .map((c: any) => ({ id: c.id, name: c.data?.category || c.uid || 'Category' }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
