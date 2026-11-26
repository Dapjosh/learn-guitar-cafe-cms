import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { isFilled } from '@prismicio/client';
import type { WithContext, BlogPosting } from 'schema-dts';

import { createClient } from '@/prismicio';
import { authorFromData } from '@components/blog/AuthorCard';
import { PostArticle } from '@components/blog/PostArticle';
import { queryBlogPosts, readTimeFor } from '@/slices/BlogList/blog-query';

type Props = { params: Promise<{ uid: string }> };

const FETCH_LINKS = [
  'blog_category.category',
  'author.name',
  'author.profile_image',
  'author.role',
  'author.bio',
  'author.links',
];

async function getPost(uid: string) {
  return createClient()
    .getByUID('blog_post', uid, { fetchLinks: FETCH_LINKS })
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

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { uid } = await params;
  const post = await getPost(uid);
  if (!post) return {};
  const d = post.data as any;
  const parentMeta = await parent;

  let description: string = d.meta_description || d.description || parentMeta.description || '';
  if (description.length > 160) description = `${description.slice(0, 157)}...`;

  const keywords = [
    ...(d.keywords || []).map((k: any) => k?.word),
    d.category?.data?.category,
    ...(parentMeta.keywords || []),
  ].filter(Boolean);

  const image = isFilled.image(d.meta_image) ? d.meta_image.url : isFilled.image(d.feature_image) ? d.feature_image.url : null;
  const authorName = d.author?.data?.name;

  return {
    title: d.meta_title || d.title,
    description,
    keywords: Array.from(new Set(keywords)).slice(0, 15) as string[],
    authors: authorName ? [{ name: authorName }] : undefined,
    alternates: { canonical: `/blog/lessons/${uid}` },
    openGraph: {
      type: 'article',
      title: d.meta_title || d.title || undefined,
      description,
      publishedTime: d.publishing_date || post.first_publication_date,
      ...(image ? { images: [{ url: shareImageUrl(image) }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { uid } = await params;
  const client = createClient();
  const [post, blog] = await Promise.all([getPost(uid), client.getSingle('blog').catch(() => null)]);
  if (!post) notFound();

  const d = post.data as any;
  const b = (blog?.data ?? {}) as any;
  const author = authorFromData(d.author?.data);

  const related =
    b.post_show_related !== false && isFilled.contentRelationship(d.category)
      ? (await queryBlogPosts({ categoryId: d.category.id, pageSize: 4 }).catch(() => ({ posts: [] }))).posts
          .filter((p) => p.id !== post.id)
          .slice(0, 3)
      : [];

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: d.title || '',
    description: d.description || '',
    image: isFilled.image(d.feature_image) ? d.feature_image.url : undefined,
    author: author ? { '@type': 'Person', name: author.name } : undefined,
    datePublished: d.publishing_date || post.first_publication_date,
    dateModified: post.last_publication_date,
  };

  return (
    <>
      <PostArticle
        post={d}
        blog={b}
        author={author}
        readTime={readTimeFor(d)}
        publishedAt={d.publishing_date || post.first_publication_date}
        related={related}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

export async function generateStaticParams() {
  const posts = await createClient()
    .getAllByType('blog_post')
    .catch(() => []);
  return posts.map((p) => ({ uid: p.uid }));
}
