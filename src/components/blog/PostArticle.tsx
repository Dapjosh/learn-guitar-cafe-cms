import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText, SliceZone } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';

import { components } from '@/slices';
import { resolveHeadingTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { AuthorCard, type AuthorInfo } from './AuthorCard';
import { BlogPostCard, type BlogPostCardData } from './BlogPostCard';
import { ShareButtons } from './ShareButtons';
import { postRichTextComponents } from './post-rich-text';

/**
 * Slices that belong to the article itself: rendered inside the article column,
 * aligned with the body text and spaced on the same rhythm. Other slices
 * (CTAs, testimonials, stats…) break out to full page width.
 */
const ARTICLE_SLICES = new Set([
  'rich_text_slice',
  'media_study_card',
  'image_block',
  'video_playlist',
  'author_bio',
]);

const columnWidths: Record<string, string> = {
  narrow: 'max-w-[640px]',
  medium: 'max-w-[720px]',
  wide: 'max-w-[840px]',
};
const imageWidths: Record<string, string> = {
  wide: 'max-w-[1080px] px-4 sm:px-6 lg:px-8',
  contained: 'max-w-[840px] px-4 sm:px-6',
  'full width': 'max-w-none px-0',
};
const imageAspects: Record<string, string | null> = {
  landscape: 'aspect-[16/9]',
  wide: 'aspect-[21/9]',
  original: null,
};
const imageRadii: Record<string, string> = {
  none: 'rounded-none',
  small: 'rounded-[8px]',
  medium: 'rounded-[12px]',
  large: 'rounded-[20px]',
};

/** Post value when set (and not "Default"), else the Blog page default, else the fallback. */
const pick = (postValue: any, blogValue: any, fallback: any) =>
  postValue && postValue !== 'Default' ? postValue : (blogValue ?? fallback);

export type PostArticleProps = {
  /** blog_post document data (with category/author fetched via fetchLinks) */
  post: any;
  /** Blog document data (Post Page Design defaults) */
  blog: any;
  author: AuthorInfo | null;
  readTime: number | null;
  publishedAt: string | null;
  related: BlogPostCardData[];
};

/**
 * Blog post layout: header (category, title, description, author/date, share),
 * featured image, then ONE article column holding the body, article slices
 * and author card on a shared spacing rhythm.
 */
export const PostArticle = ({
  post: d,
  blog: b,
  author,
  readTime,
  publishedAt,
  related,
}: PostArticleProps) => {
  // ---- Design ----
  const pageBg = pick(d.page_bg_color, b.post_page_bg_color, '#f3efe6');
  const contentBg = pick(d.content_bg_color, b.post_content_bg_color, pageBg);
  const imageDisplay = String(
    pick(d.featured_image_display, b.post_featured_image_display, 'Wide')
  ).toLowerCase();
  const imageAspect =
    imageAspects[
      String(
        pick(d.featured_image_aspect, b.post_featured_image_aspect, 'Landscape')
      ).toLowerCase()
    ] ?? null;
  const imageRadius =
    imageRadii[String(b.post_featured_image_radius || 'Small').toLowerCase()] ||
    imageRadii.small;
  const column = cn(
    'w-full mx-auto px-4 sm:px-6',
    columnWidths[String(b.post_content_width || 'Medium').toLowerCase()] ||
      columnWidths.medium
  );
  const meta = b.post_meta_color || '#78716c';
  const headingFont = resolveFontFamily(b.post_heading_font, 'Fraunces');

  const titleTypo = resolveHeadingTypography({
    font: b.post_title_font,
    color: b.post_title_color,
    size: 'Large',
    fallbackFont: 'Bebas Neue',
    fallbackColor: '#1c1917',
  });
  const richText = postRichTextComponents({
    bodyFont: b.post_body_font,
    headingFont: b.post_heading_font,
    textColor: b.post_text_color,
    headingColor: b.post_heading_color,
    linkColor: b.post_link_color,
  });

  // ---- Header content ----
  const category = d.category?.data?.category as string | undefined;
  const date =
    b.post_show_date !== false && publishedAt
      ? new Date(publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;
  const shownReadTime = b.post_show_read_time !== false ? readTime : null;
  const metaLine = [
    date,
    shownReadTime
      ? `${shownReadTime} ${b.post_read_time_suffix || 'min read'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const showShare = b.post_show_share !== false;
  const hasImage = imageDisplay !== 'hidden' && isFilled.image(d.feature_image);

  // ---- Article blocks: body, then slices (in order), then the author card ----
  const blocks: { key: string; wide: boolean; node: React.ReactNode }[] = [];
  if (isFilled.richText(d.main)) {
    blocks.push({
      key: 'main',
      wide: false,
      node: <PrismicRichText field={d.main} components={richText} />,
    });
  }
  (Array.isArray(d.slices) ? d.slices : []).forEach((slice: any, i: number) => {
    const key = slice.id || `${slice.slice_type}-${i}`;
    if (slice.slice_type === 'rich_text_slice') {
      // Same typography as the body, so text and media read as one article
      const twoCols = String(slice.variation || '').startsWith('twoColumns');
      blocks.push({
        key,
        wide: false,
        node: (
          <div className={cn(twoCols && 'md:columns-2 md:gap-8')}>
            {slice.primary?.heading && (
              <h2
                className={cn(
                  headingFont.className,
                  'text-[1.625rem] sm:text-[1.875rem] leading-tight mb-4'
                )}
                style={{
                  fontFamily: headingFont.fontFamily,
                  color: b.post_heading_color || '#1c1917',
                }}
              >
                {slice.primary.heading}
              </h2>
            )}
            <PrismicRichText
              field={slice.primary?.text}
              components={richText}
            />
          </div>
        ),
      });
      return;
    }
    blocks.push({
      key,
      wide: !ARTICLE_SLICES.has(slice.slice_type),
      node: (
        <SliceZone
          slices={[slice]}
          components={components}
          context={{ inPost: true }}
        />
      ),
    });
  });
  if (b.post_show_author_card !== false && author) {
    blocks.push({
      key: 'author',
      wide: false,
      node: (
        <AuthorCard
          author={author}
          style={{
            layout: 'card',
            label: b.post_author_label || 'Written by',
            cardBg: b.post_author_card_bg_color,
            nameFont: b.post_heading_font,
          }}
        />
      ),
    });
  }

  return (
    <main style={{ backgroundColor: contentBg }}>
      <article>
        {/* Header (page background) */}
        <header
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: pageBg }}
        >
          {isFilled.image(d.page_bg_image) && (
            <PrismicNextImage
              field={d.page_bg_image}
              fill
              sizes="100vw"
              className="object-cover pointer-events-none"
              alt=""
              priority
            />
          )}
          <div
            className={cn(
              'relative max-w-[880px] mx-auto px-4 sm:px-6 pt-14 sm:pt-20 flex flex-col items-center text-center',
              hasImage ? 'pb-0' : 'pb-12 sm:pb-16'
            )}
          >
            {category && (
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm mb-5"
                style={{
                  backgroundColor: b.post_category_bg_color || '#ffffff',
                  color: b.post_category_text_color || '#d85d18',
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="8" cy="8" r="3" fill="currentColor" />
                </svg>
                {category}
              </span>
            )}
            <h1
              className={cn(
                titleTypo.className,
                'uppercase tracking-tight leading-[1.02]'
              )}
              style={titleTypo.style}
            >
              {d.title}
            </h1>
            {d.description && (
              <p
                className="mt-5 max-w-xl text-[0.95rem] sm:text-[1.0625rem] leading-relaxed"
                style={{ color: b.post_description_color || '#78716c' }}
              >
                {d.description}
              </p>
            )}
            {(author || metaLine || showShare) && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                {(author || metaLine) && (
                  <div className="flex items-center gap-2.5 text-left">
                    {author?.image && (
                      <span className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <PrismicNextImage
                          field={author.image}
                          fill
                          sizes="64px"
                          className="object-cover"
                          alt=""
                        />
                      </span>
                    )}
                    <span className="leading-tight">
                      {author && (
                        <span
                          className="block text-sm font-medium"
                          style={{ color: b.post_title_color || '#1c1917' }}
                        >
                          {author.name}
                        </span>
                      )}
                      {metaLine && (
                        <span
                          className="block text-xs mt-0.5"
                          style={{ color: meta }}
                        >
                          {metaLine}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {showShare && <ShareButtons title={d.title || ''} />}
              </div>
            )}
          </div>

          {/* Featured image: clear gap below the author/share row, small gap before the body */}
          {hasImage && (
            <div
              className={cn(
                'relative mx-auto mt-12 sm:mt-16 pb-6 sm:pb-8',
                imageWidths[imageDisplay] || imageWidths.wide
              )}
            >
              <div
                className={cn(
                  'relative w-full overflow-hidden border',
                  imageDisplay === 'full width'
                    ? 'rounded-none border-x-0'
                    : imageRadius,
                  imageAspect
                )}
                style={{
                  borderColor: b.post_featured_image_border_color || '#1c1917',
                }}
              >
                {imageAspect ? (
                  <PrismicNextImage
                    field={d.feature_image}
                    fallbackAlt=""
                    fill
                    priority
                    sizes="(max-width: 1080px) 100vw, 1080px"
                    className="object-cover"
                  />
                ) : (
                  <PrismicNextImage
                    field={d.feature_image}
                    fallbackAlt=""
                    priority
                    sizes="(max-width: 1080px) 100vw, 1080px"
                    className="w-full h-auto"
                  />
                )}
              </div>
            </div>
          )}
        </header>

        {/* Article column: body, article slices and author card share one width and one spacing rhythm */}
        {blocks.length > 0 && (
          <div className="flex flex-col gap-10 sm:gap-14 pt-8 sm:pt-10 pb-16 sm:pb-24">
            {blocks.map((block) => (
              <div key={block.key} className={block.wide ? 'w-full' : column}>
                {block.node}
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section
          className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16"
          style={{ backgroundColor: pageBg }}
          aria-labelledby="related-heading"
        >
          <div className="max-w-[1380px] mx-auto">
            <h2
              id="related-heading"
              className={cn(
                headingFont.className,
                'text-[1.75rem] sm:text-[2rem] mb-8'
              )}
              style={{
                fontFamily: headingFont.fontFamily,
                color: b.post_heading_color || '#1c1917',
              }}
            >
              {b.post_related_title || 'More from the journal'}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {related.map((p) => (
                <li key={p.id} className="flex">
                  <BlogPostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
};

export default PostArticle;
