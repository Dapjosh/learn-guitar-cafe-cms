'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
  cn,
} from '@lgc_cms/util';
import { BadgePill, CmsButton } from '../ContentImageSlice/shared';
import { FilterTabs } from '@components/slice-ui/FilterTabs';
import { BlogPostCard } from '@components/blog/BlogPostCard';
import { loadBlogPosts } from './blog-actions';
import type { BlogCard } from './blog-query';

export type BlogTab = { id: string; label: string; count?: number | null };

const ALL = '__all__';

const postTitleSizes: Record<string, string> = {
  small: 'text-lg sm:text-xl',
  medium: 'text-xl sm:text-[1.5rem]',
  large: 'text-[1.5rem] sm:text-[1.75rem]',
};

const gridColumns: Record<string, string> = {
  '2': 'lg:grid-cols-2',
  '3': 'lg:grid-cols-3',
  '4': 'lg:grid-cols-3 xl:grid-cols-4',
};

type Props = {
  sliceType: string;
  variation: string;
  primary: any;
  pageSize: number;
  initialPosts: BlogCard[];
  initialHasMore: boolean;
  tabs: BlogTab[];
  allCount: number | null;
  isSample: boolean;
};

/**
 * Client part of the blog index: header, category tabs, post cards and "load more".
 * Each tab / "load more" fetches the next page from the server (no full list in the browser).
 */
export const BlogGridView = ({
  sliceType,
  variation,
  primary,
  pageSize,
  initialPosts,
  initialHasMore,
  tabs,
  allCount,
  isSample,
}: Props) => {
  const showAllTab = primary.show_all_tab !== false;
  const [activeTab, setActiveTab] = useState<string>(showAllTab || tabs.length === 0 ? ALL : tabs[0].id);
  // Server-rendered posts are the "All" tab's first page; start empty when another tab is first
  const [posts, setPosts] = useState<BlogCard[]>(showAllTab || tabs.length === 0 ? initialPosts : []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0); // ignore responses from an older tab

  const fetchPage = (tabId: string, nextPage: number, append: boolean) => {
    if (isSample) {
      setPosts(tabId === ALL ? initialPosts : initialPosts.filter((p) => p.categoryId === tabId));
      setHasMore(false);
      return;
    }
    const id = ++requestId.current;
    startTransition(async () => {
      const res = await loadBlogPosts({ categoryId: tabId === ALL ? null : tabId, page: nextPage, pageSize });
      if (id !== requestId.current) return;
      setFailed('error' in res);
      setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
      setHasMore(res.hasMore);
      setPage(nextPage);
    });
  };

  // The server renders the "All" tab's first page. If the "All" tab is turned off,
  // load the first category's posts once the page is in the browser.
  useEffect(() => {
    if (activeTab !== ALL) fetchPage(activeTab, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTab = (id: string) => {
    if (id === activeTab) return;
    setActiveTab(id);
    if (id === ALL && showAllTab && !isSample) {
      // Back to "All": reuse the server-rendered first page
      requestId.current++;
      setPosts(initialPosts);
      setHasMore(initialHasMore);
      setPage(1);
      setFailed(false);
      return;
    }
    setPosts([]);
    fetchPage(id, 1, false);
  };

  // ---- Settings & colours ----
  const isCentered = String(primary.header_alignment || 'Center').toLowerCase() === 'center';
  const showFilters = primary.show_filters !== false && tabs.length > 0;
  const showCategory = primary.show_category !== false;
  const showAuthor = primary.show_author !== false;
  const showReadTime = primary.show_read_time !== false;
  const readTimeSuffix = primary.read_time_suffix || 'min read';
  const bottomMode = String(primary.bottom_button_mode || 'Load more').toLowerCase();
  const columns = gridColumns[String(primary.columns || '3')] || gridColumns['3'];

  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    cardBg: primary.card_bg_color || '#fbf9f5',
    cardBorder: primary.card_border_color || 'transparent',
    imageBorder: primary.image_border_color || '#1c1917',
    pillBg: primary.category_pill_bg_color || '#fbe3d4',
    pillText: primary.category_pill_text_color || '#d85d18',
    title: primary.post_title_color || '#1c1917',
    text: primary.post_text_color || '#78716c',
    meta: primary.meta_color || '#78716c',
  };
  const tabColors = {
    activeBg: primary.tab_active_bg_color || '#d85d18',
    activeText: primary.tab_active_text_color || '#ffffff',
    text: primary.tab_text_color || '#1c1917',
    border: primary.tab_border_color || '#e2d9cb',
    countBg: primary.tab_count_bg_color || '#ebe4d8',
    countText: primary.tab_count_text_color || '#78716c',
  };

  // ---- Typography ----
  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    weight: primary.title_weight,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const headingClass = cn(headingTypo.className, 'uppercase tracking-tight leading-[1.05]');
  const bodyTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#78716c',
  });
  const postTitleSize =
    postTitleSizes[String(primary.post_title_size || 'Medium').toLowerCase()] || postTitleSizes.medium;

  const outline = {
    bg: primary.button_background_color || 'transparent',
    textColor: primary.button_text_color || '#1c1917',
    borderColor: primary.button_border_color || primary.button_text_color || '#1c1917',
    hoverBg: primary.button_hover_background_color || '#1c1917',
    hoverText: primary.button_hover_text_color || '#ffffff',
  };
  const bottomLabel = primary.bottom_button_label || 'Load more articles';

  return (
    <section
      data-slice-type={sliceType}
      data-slice-variation={variation}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 font-sans"
      style={{ backgroundColor: c.sectionBg }}
    >
      <div className="max-w-[1380px] mx-auto">
        {/* Header */}
        <div
          className={cn(
            'flex flex-col mb-10 lg:mb-14',
            isCentered ? 'items-center text-center max-w-3xl mx-auto' : 'items-start text-left max-w-3xl'
          )}
        >
          <BadgePill
            text={primary.badge_text || 'Blog'}
            icon={primary.badge_icon}
            bg={primary.badge_bg_color || '#ffffff'}
            textColor={primary.badge_text_color || '#d85d18'}
            iconColor={primary.badge_icon_color}
            borderColor={primary.badge_border_color}
            className="mb-5 sm:mb-6"
          />
          {isFilled.richText(primary.title) ? (
            <PrismicRichText
              field={primary.title}
              components={{
                heading1: ({ children }: any) => <h1 className={headingClass} style={headingTypo.style}>{children}</h1>,
                heading2: ({ children }: any) => <h2 className={headingClass} style={headingTypo.style}>{children}</h2>,
              }}
            />
          ) : (
            <h1 className={headingClass} style={headingTypo.style}>
              The Guitar Cafe journal
            </h1>
          )}
          <div
            className={cn(bodyTypo.className, 'mt-4 sm:mt-5 leading-relaxed max-w-2xl [&_p]:mb-3 [&_p:last-child]:mb-0')}
            style={bodyTypo.style}
          >
            {isFilled.richText(primary.description) ? (
              <PrismicRichText field={primary.description} />
            ) : (
              <p>Lessons, gear reviews and profiles of the players who shaped acoustic and slide guitar.</p>
            )}
          </div>
        </div>

        {/* Category tabs */}
        {showFilters && (
          <FilterTabs
            className="mb-8 sm:mb-10"
            label="Filter articles by category"
            align={isCentered ? 'center' : 'left'}
            tabs={[...(showAllTab ? [{ id: ALL, label: primary.all_tab_label || 'All', count: allCount }] : []), ...tabs]}
            activeId={activeTab}
            onSelect={selectTab}
            showCounts={primary.show_counts !== false}
            colors={tabColors}
          />
        )}

        {/* Posts */}
        <div aria-live="polite" aria-busy={isPending}>
          {posts.length === 0 ? (
            <p className="py-16 text-center text-sm" style={{ color: c.meta }}>
              {isPending
                ? 'Loading articles…'
                : failed
                  ? 'Articles couldn’t be loaded. Please try again.'
                  : primary.empty_message || 'No articles in this category yet.'}
            </p>
          ) : (
            <ul className={cn('grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6', columns, isPending && 'opacity-60 transition-opacity')}>
              {posts.map((post) => (
                <li key={post.id} className="flex">
                  <BlogPostCard
                    post={post}
                    style={{
                      showCategory,
                      showAuthor,
                      showReadTime,
                      readTimeSuffix,
                      titleFont: primary.post_title_font,
                      titleSizeClass: postTitleSize,
                      colors: c,
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Load more / link */}
        {bottomMode !== 'hidden' && (bottomMode === 'link' || hasMore) && (
          <div className="mt-10 flex justify-center">
            {bottomMode === 'link' ? (
              <CmsButton
                label={bottomLabel}
                link={isFilled.link(primary.bottom_button_link) ? primary.bottom_button_link : { link_type: 'Web', url: '/blog/lessons' }}
                font={primary.button_font}
                radius={primary.button_radius}
                showArrow={primary.button_show_arrow === true}
                {...outline}
              />
            ) : (
              <button
                type="button"
                onClick={() => fetchPage(activeTab, page + 1, true)}
                disabled={isPending}
                className="slice-custom-btn inline-flex items-center gap-2.5 rounded-md border h-12 px-5 text-sm sm:text-[0.95rem] disabled:opacity-70 disabled:cursor-wait"
                style={
                  {
                    fontFamily: resolveFontFamily(primary.button_font, 'Inter Tight').fontFamily,
                    '--btn-bg': outline.bg,
                    '--btn-text': outline.textColor,
                    '--btn-border': outline.borderColor,
                    '--btn-hover-bg': outline.hoverBg,
                    '--btn-hover-text': outline.hoverText,
                    '--btn-hover-border': outline.hoverBg,
                  } as React.CSSProperties
                }
              >
                {isPending ? 'Loading…' : bottomLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogGridView;
