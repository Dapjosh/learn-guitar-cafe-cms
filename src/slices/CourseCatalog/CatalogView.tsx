'use client';

import React, { useMemo, useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
  cn,
} from '@lgc_cms/util';
import { BadgePill, CmsButton } from '../ContentImageSlice/shared';
import { FilterTabs } from '@components/slice-ui/FilterTabs';

export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  image: any;
  tags: string[];
  features: { icon: string; label: string }[];
  metaLine: string;
  link: any;
  categoryId: string | null;
};

export type CatalogFilter = { id: string; label: string };

type Props = {
  sliceType: string;
  variation: 'list' | 'grid';
  primary: any;
  courses: CatalogCourse[];
  filters: CatalogFilter[];
};

const ALL = '__all__';

const courseTitleSizes: Record<string, Record<string, string>> = {
  list: {
    small: 'text-[1.75rem] sm:text-[2rem]',
    medium: 'text-[2rem] sm:text-[2.5rem]',
    large: 'text-[2.25rem] sm:text-[2.75rem] lg:text-[3rem]',
  },
  grid: {
    small: 'text-lg sm:text-xl',
    medium: 'text-xl sm:text-[1.5rem]',
    large: 'text-[1.5rem] sm:text-[1.75rem]',
  },
};

/** Small line icons for course features. */
const FeatureIcon = ({ name }: { name: string }) => {
  const common = {
    viewBox: '0 0 20 20',
    className: 'w-4 h-4 shrink-0',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name.toLowerCase()) {
    case 'video':
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="15" height="12" rx="1.5" />
          <path d="M8.5 7.5v5l4-2.5z" />
        </svg>
      );
    case 'tabs':
      return (
        <svg {...common}>
          <path d="M3 5h14M3 8.3h14M3 11.6h14M3 15h14" />
        </svg>
      );
    case 'backing tracks':
      return (
        <svg {...common}>
          <path d="M2.5 10h2l1.5-4 3 9 2.5-11 2.5 8 1.5-2h2" />
        </svg>
      );
    case 'pdf':
      return (
        <svg {...common}>
          <path d="M5 2.5h7l3.5 3.5v11.5H5z" />
          <path d="M12 2.5V6h3.5M7.5 10.5h5M7.5 13.5h5" />
        </svg>
      );
    case 'music':
      return (
        <svg {...common}>
          <path d="M8 15.5V4.5l7-2v10" />
          <circle cx="6" cy="15.5" r="2" />
          <circle cx="13" cy="12.5" r="2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7.5" />
          <path d="M6.8 10.3l2.2 2.2 4.2-4.6" />
        </svg>
      );
  }
};

const MusicNote = () => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="currentColor" aria-hidden="true">
    <path d="M6 1.5h5.5v2.2H8.2v7.8A2.6 2.6 0 1 1 6 9V1.5z" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/**
 * Client part of the CourseCatalog slice: header, filter tabs, list/grid and "load more".
 */
export const CatalogView = ({ sliceType, variation, primary, courses, filters }: Props) => {
  const isGrid = variation === 'grid';

  // ---- Settings ----
  const perPage =
    typeof primary.courses_per_page === 'number' && primary.courses_per_page > 0
      ? Math.round(primary.courses_per_page)
      : 10;
  const showFilters = primary.show_filters !== false && filters.length > 0;
  const showAllTab = primary.show_all_tab !== false;
  const showCounts = primary.show_counts !== false;
  const bottomMode = String(primary.bottom_button_mode || 'Load more').toLowerCase();

  const [activeFilter, setActiveFilter] = useState<string>(
    showAllTab || filters.length === 0 ? ALL : filters[0].id
  );
  const [visible, setVisible] = useState(perPage);

  const filtered = useMemo(
    () => (activeFilter === ALL ? courses : courses.filter((c) => c.categoryId === activeFilter)),
    [activeFilter, courses]
  );
  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  const selectFilter = (id: string) => {
    setActiveFilter(id);
    setVisible(perPage); // start each tab from the first page
  };

  // ---- Colours ----
  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    tabActiveBg: primary.tab_active_bg_color || '#d85d18',
    tabActiveText: primary.tab_active_text_color || '#ffffff',
    tabText: primary.tab_text_color || '#1c1917',
    tabBorder: primary.tab_border_color || '#e2d9cb',
    countBg: primary.tab_count_bg_color || '#ebe4d8',
    countText: primary.tab_count_text_color || '#78716c',
    tagBg: primary.tag_bg_color || (isGrid ? '#fbe3d4' : '#ffffff'),
    tagText: primary.tag_text_color || '#d85d18',
    courseTitle: primary.course_title_color || '#1c1917',
    courseText: primary.course_text_color || (isGrid ? '#78716c' : '#1c1917'),
    meta: primary.meta_color || '#78716c',
    accent: primary.accent_color || '#d85d18',
    cardBg: primary.card_bg_color || '#fbf9f5',
    cardBorder: primary.card_border_color || 'transparent',
    imageBorder: primary.image_border_color || '#1c1917',
    staff: primary.divider_color || 'rgba(28, 25, 23, 0.14)',
    number: primary.number_color || '#d85d18',
    btnBg: primary.course_button_bg_color || (isGrid ? '#d85d18' : '#1c1917'),
    btnText: primary.course_button_text_color || '#ffffff',
    btnHoverBg: primary.course_button_hover_bg_color || (isGrid ? '#b94c10' : '#d85d18'),
    btnHoverText: primary.course_button_hover_text_color || '#ffffff',
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
    fallbackSize: 'Small',
    fallbackColor: '#1c1917',
  });
  const courseTitleFont = resolveFontFamily(primary.course_title_font, isGrid ? 'Inter Tight' : 'Fraunces');
  const courseTitleSize =
    courseTitleSizes[variation][String(primary.course_title_size || 'Medium').toLowerCase()] ||
    courseTitleSizes[variation].medium;
  const courseButtonLabel = primary.course_button_label || 'View course';

  const outlineButton = {
    bg: primary.button_background_color || 'transparent',
    textColor: primary.button_text_color || '#1c1917',
    borderColor: primary.button_border_color || primary.button_text_color || '#1c1917',
    hoverBg: primary.button_hover_background_color || '#1c1917',
    hoverText: primary.button_hover_text_color || '#ffffff',
  };
  const headerButtonLabel = primary.header_button_label || 'View all courses';
  const showHeaderButton = primary.show_header_button ?? !isGrid;

  const courseButtonStyle = {
    '--btn-bg': c.btnBg,
    '--btn-text': c.btnText,
    '--btn-border': c.btnBg,
    '--btn-hover-bg': c.btnHoverBg,
    '--btn-hover-text': c.btnHoverText,
    '--btn-hover-border': c.btnHoverBg,
  } as React.CSSProperties;

  const Tags = ({ tags }: { tags: string[] }) =>
    tags.length > 0 ? (
      <ul className="flex flex-wrap gap-2" aria-label="Tags">
        {tags.map((tag, i) => (
          <li
            key={i}
            className="rounded-full px-2.5 py-1 text-xs sm:text-[0.85rem] leading-none"
            style={{ backgroundColor: c.tagBg, color: c.tagText }}
          >
            {tag}
          </li>
        ))}
      </ul>
    ) : null;

  const CourseImage = ({ course, sizes }: { course: CatalogCourse; sizes: string }) =>
    course.image ? (
      <PrismicNextImage field={course.image} fill sizes={sizes} className="object-cover object-center" alt="" />
    ) : (
      <span className="absolute inset-0 bg-gradient-to-br from-[#3a332e] to-[#1c1917]" aria-hidden="true" />
    );

  const CourseButton = ({ course, className }: { course: CatalogCourse; className?: string }) => (
    <PrismicNextLink
      field={course.link}
      className={cn(
        'slice-custom-btn group inline-flex items-center justify-center gap-2.5 rounded-md border text-sm sm:text-[0.95rem]',
        className
      )}
      style={courseButtonStyle}
      aria-label={`${courseButtonLabel}: ${course.title}`}
    >
      <span>{courseButtonLabel}</span>
      {!isGrid && <ArrowRight />}
    </PrismicNextLink>
  );

  return (
    <section
      data-slice-type={sliceType}
      data-slice-variation={variation}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 font-sans"
      style={{ backgroundColor: c.sectionBg }}
    >
      <div className="max-w-[1792px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-16 mb-10 lg:mb-14">
          <div className="max-w-3xl">
            <BadgePill
              text={primary.badge_text || 'Online guitar lessons'}
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
              <h2 className={headingClass} style={headingTypo.style}>
                Courses that start where the record starts
              </h2>
            )}
          </div>

          <div className="lg:max-w-sm xl:max-w-[340px] flex flex-col items-start gap-5 lg:pb-2">
            <div
              className={cn(bodyTypo.className, 'leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0')}
              style={bodyTypo.style}
            >
              {isFilled.richText(primary.description) ? (
                <PrismicRichText field={primary.description} />
              ) : (
                <p>
                  Pick a style, tune the guitar, press play. Each course is a step-by-step masterclass with interactive
                  TABs and backing tracks.
                </p>
              )}
            </div>
            {showHeaderButton && (
              <CmsButton
                label={headerButtonLabel}
                link={isFilled.link(primary.header_button_link) ? primary.header_button_link : { link_type: 'Web', url: '/all-courses' }}
                font={primary.button_font}
                radius={primary.button_radius}
                showArrow
                {...outlineButton}
              />
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {showFilters && (
          <FilterTabs
            className="mb-8 sm:mb-10"
            label="Filter courses"
            tabs={[
              ...(showAllTab ? [{ id: ALL, label: primary.all_tab_label || 'All courses' }] : []),
              ...filters,
            ].map((f) => ({
              ...f,
              count: f.id === ALL ? courses.length : courses.filter((x) => x.categoryId === f.id).length,
            }))}
            activeId={activeFilter}
            onSelect={selectFilter}
            showCounts={showCounts}
            colors={{
              activeBg: c.tabActiveBg,
              activeText: c.tabActiveText,
              text: c.tabText,
              border: c.tabBorder,
              countBg: c.countBg,
              countText: c.countText,
            }}
          />
        )}

        {/* Courses */}
        {shown.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: c.meta }}>
            {primary.empty_message || 'No courses here yet — check back soon.'}
          </p>
        ) : isGrid ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map((course) => (
              <li
                key={course.id}
                className="flex flex-col rounded-[12px] border p-2"
                style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}
              >
                <div
                  className="relative w-full aspect-[16/7] rounded-[4px] overflow-hidden border"
                  style={{ borderColor: c.imageBorder }}
                >
                  <CourseImage course={course} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                </div>
                <div className="flex flex-col flex-1 px-2 sm:px-2 pt-4 pb-2">
                  <Tags tags={course.tags} />
                  <h3
                    className={cn(courseTitleFont.className, courseTitleSize, 'mt-4 leading-tight tracking-[-0.02em]')}
                    style={{ fontFamily: courseTitleFont.fontFamily, color: c.courseTitle }}
                  >
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: c.courseText }}>
                      {course.description}
                    </p>
                  )}
                  <div className="mt-auto pt-6 flex items-center justify-between gap-4">
                    {course.metaLine ? (
                      <span className="inline-flex items-center gap-2 text-xs" style={{ color: c.meta }}>
                        <span style={{ color: c.accent }}>
                          <MusicNote />
                        </span>
                        {course.metaLine}
                      </span>
                    ) : (
                      <span />
                    )}
                    <CourseButton course={course} className="h-10 px-4" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ol className="flex flex-col">
            {shown.map((course, i) => (
              <li key={course.id} className="pb-8 sm:pb-6">
                {/* Number on a five-line music staff */}
                <div className="relative h-8 mb-6 sm:mb-7" aria-hidden="true">
                  <div className="absolute inset-0 flex flex-col justify-between py-0.5">
                    {Array.from({ length: 5 }, (_, l) => (
                      <span key={l} className="block h-px w-full" style={{ backgroundColor: c.staff }} />
                    ))}
                  </div>
                  <span
                    className="absolute left-6 top-1/2 -translate-y-1/2 px-1 text-[1.05rem] leading-none font-inter-tight"
                    style={{ backgroundColor: c.sectionBg, color: c.number }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,2fr)] gap-6 lg:gap-12">
                  <div className="flex flex-col gap-4">
                    <h3
                      className={cn(courseTitleFont.className, courseTitleSize, 'leading-[1.05] tracking-[-0.02em] max-w-[12ch]')}
                      style={{ fontFamily: courseTitleFont.fontFamily, color: c.courseTitle }}
                    >
                      {course.title}
                    </h3>
                    <Tags tags={course.tags} />
                  </div>

                  <div
                    className="relative w-full aspect-[3/2] rounded-[4px] overflow-hidden border md:order-none"
                    style={{ borderColor: c.imageBorder }}
                  >
                    <CourseImage course={course} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  </div>

                  <div className="flex flex-col items-start gap-5 md:col-span-2 lg:col-span-1">
                    {course.description && (
                      <p className="text-[0.95rem] sm:text-[1rem] leading-relaxed" style={{ color: c.courseText }}>
                        {course.description}
                      </p>
                    )}
                    {course.features.length > 0 && (
                      <ul className="flex flex-col gap-2.5">
                        {course.features.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2.5 text-sm" style={{ color: c.meta }}>
                            <span style={{ color: c.accent }}>
                              <FeatureIcon name={f.icon} />
                            </span>
                            {f.label}
                          </li>
                        ))}
                      </ul>
                    )}
                    <CourseButton course={course} className="h-12 px-5" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Load more / link */}
        {bottomMode !== 'hidden' && (bottomMode === 'link' || hasMore) && (
          <div className="mt-10 flex justify-center">
            {bottomMode === 'link' ? (
              <CmsButton
                label={primary.bottom_button_label || 'View all courses'}
                link={isFilled.link(primary.bottom_button_link) ? primary.bottom_button_link : { link_type: 'Web', url: '/all-courses' }}
                font={primary.button_font}
                radius={primary.button_radius}
                showArrow
                {...outlineButton}
              />
            ) : (
              <button
                type="button"
                onClick={() => setVisible((v) => v + perPage)}
                className="slice-custom-btn group inline-flex items-center gap-2.5 rounded-md border h-12 px-5 text-sm sm:text-[0.95rem]"
                style={
                  {
                    fontFamily: resolveFontFamily(primary.button_font, 'Inter Tight').fontFamily,
                    '--btn-bg': outlineButton.bg,
                    '--btn-text': outlineButton.textColor,
                    '--btn-border': outlineButton.borderColor,
                    '--btn-hover-bg': outlineButton.hoverBg,
                    '--btn-hover-text': outlineButton.hoverText,
                    '--btn-hover-border': outlineButton.hoverBg,
                  } as React.CSSProperties
                }
              >
                <span>{primary.bottom_button_label || 'View all courses'}</span>
                <ArrowRight />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CatalogView;
