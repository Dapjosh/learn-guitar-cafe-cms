import React from 'react';
import Link from 'next/link';
import { PrismicNextImage } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';

export type BlogPostCardData = {
  id: string;
  title: string;
  description: string;
  image: any;
  categoryName: string;
  authorName: string;
  readTime: number | null;
  url: string;
};

export type BlogPostCardStyle = {
  showCategory?: boolean;
  showAuthor?: boolean;
  showReadTime?: boolean;
  readTimeSuffix?: string;
  titleFont?: string | null;
  titleSizeClass?: string;
  colors?: Partial<{
    cardBg: string;
    cardBorder: string;
    imageBorder: string;
    pillBg: string;
    pillText: string;
    title: string;
    text: string;
    meta: string;
  }>;
};

/** Blog post card (image, category pill, title, description, author · read time). */
export const BlogPostCard = ({ post, style = {} }: { post: BlogPostCardData; style?: BlogPostCardStyle }) => {
  const c = {
    cardBg: '#fbf9f5',
    cardBorder: 'transparent',
    imageBorder: '#1c1917',
    pillBg: '#fbe3d4',
    pillText: '#d85d18',
    title: '#1c1917',
    text: '#78716c',
    meta: '#78716c',
    ...Object.fromEntries(Object.entries(style.colors || {}).filter(([, v]) => !!v)),
  };
  const titleFont = resolveFontFamily(style.titleFont, 'Inter Tight');
  const meta = [
    style.showAuthor !== false ? post.authorName : '',
    style.showReadTime !== false && post.readTime ? `${post.readTime} ${style.readTimeSuffix || 'min read'}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={post.url}
      className="group flex flex-col w-full rounded-[12px] border p-2 transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(28,25,23,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}
    >
      <span className="relative block w-full aspect-[16/10] rounded-[4px] overflow-hidden border" style={{ borderColor: c.imageBorder }}>
        {post.image ? (
          <PrismicNextImage
            field={post.image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            alt=""
          />
        ) : (
          <span className="absolute inset-0 bg-[#e7dfd2]" aria-hidden="true" />
        )}
      </span>
      <span className="flex flex-col flex-1 px-2 pt-4 pb-2">
        {style.showCategory !== false && post.categoryName && (
          <span className="self-start rounded-full px-2.5 py-1 text-xs sm:text-[0.85rem] leading-none mb-4" style={{ backgroundColor: c.pillBg, color: c.pillText }}>
            {post.categoryName}
          </span>
        )}
        <span
          className={cn(titleFont.className, style.titleSizeClass || 'text-xl sm:text-[1.5rem]', 'leading-tight tracking-[-0.02em] group-hover:underline underline-offset-4 decoration-1')}
          style={{ fontFamily: titleFont.fontFamily, color: c.title }}
        >
          {post.title}
        </span>
        {post.description && (
          <span className="mt-2 text-sm leading-relaxed" style={{ color: c.text }}>
            {post.description}
          </span>
        )}
        {meta && (
          <span className="mt-auto pt-6 text-xs" style={{ color: c.meta }}>
            {meta}
          </span>
        )}
      </span>
    </Link>
  );
};

export default BlogPostCard;
