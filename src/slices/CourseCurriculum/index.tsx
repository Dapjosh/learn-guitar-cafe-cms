'use client';

import React from 'react';
import Link from 'next/link';
import { Content, isFilled, asText } from '@prismicio/client';
import { SliceComponentProps, PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
  cn,
} from '@lgc_cms/util';

import type { JSX } from 'react';

/**
 * Props for `CourseCurriculum`.
 */
export type CourseCurriculumProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

// Vintage badge SVG icon illustrations matching the 6 curriculum courses in the design
const DefaultCurriculumIcons = [
  // 01: Slide on strings
  <svg
    viewBox="0 0 48 48"
    className="w-9 h-9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="8" y1="14" x2="40" y2="34" stroke="#8c827a" strokeWidth="1.5" />
    <line x1="12" y1="10" x2="44" y2="30" stroke="#8c827a" strokeWidth="1.5" />
    <line x1="4" y1="18" x2="36" y2="38" stroke="#8c827a" strokeWidth="1.5" />
    <rect
      x="18"
      y="14"
      width="14"
      height="24"
      rx="4"
      transform="rotate(-30 18 14)"
      fill="#d85d18"
      stroke="#1c1917"
      strokeWidth="2"
    />
    <path
      d="M22 17L30 31"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>,
  // 02: Resonator guitar
  <svg
    viewBox="0 0 48 48"
    className="w-9 h-9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 12C15 14 14 18 15 22C16 26 13 30 14 36C15 41 21 43 24 43C27 43 33 41 34 36C35 30 32 26 33 22C34 18 33 14 29 12C28 8 20 8 19 12Z"
      fill="#e7d8c6"
      stroke="#1c1917"
      strokeWidth="1.75"
    />
    <circle
      cx="24"
      cy="30"
      r="7.5"
      fill="#f4eee5"
      stroke="#1c1917"
      strokeWidth="1.5"
    />
    <circle cx="24" cy="30" r="4.5" fill="#d85d18" />
    <path
      d="M22 30H26M24 28V32"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect x="22.5" y="6" width="3" height="8" fill="#1c1917" />
  </svg>,
  // 03: Vintage amplifier with music notes
  <svg
    viewBox="0 0 48 48"
    className="w-9 h-9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="16"
      width="28"
      height="22"
      rx="3"
      fill="#3a3028"
      stroke="#1c1917"
      strokeWidth="2"
    />
    <rect
      x="13"
      y="21"
      width="22"
      height="14"
      rx="1.5"
      fill="#d89b62"
      stroke="#1c1917"
      strokeWidth="1"
    />
    <line
      x1="16"
      y1="18.5"
      x2="18"
      y2="18.5"
      stroke="#f4eee5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="21"
      y1="18.5"
      x2="23"
      y2="18.5"
      stroke="#f4eee5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="26"
      y1="18.5"
      x2="28"
      y2="18.5"
      stroke="#f4eee5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Floating music notes */}
    <path
      d="M19 12V9L27 7V10"
      stroke="#d85d18"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="18" cy="12" r="2" fill="#d85d18" />
    <circle cx="26" cy="10" r="2" fill="#d85d18" />
  </svg>,
  // 04: Tone & analog knob dial
  <svg
    viewBox="0 0 48 48"
    className="w-9 h-9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="24"
      cy="24"
      r="14"
      fill="#2b231d"
      stroke="#1c1917"
      strokeWidth="2"
    />
    <circle
      cx="24"
      cy="24"
      r="10"
      fill="#d85d18"
      stroke="#1c1917"
      strokeWidth="1.5"
    />
    <circle cx="24" cy="24" r="7" fill="#ffffff" />
    <line
      x1="24"
      y1="24"
      x2="24"
      y2="15"
      stroke="#1c1917"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="13" cy="24" r="1.5" fill="#f59e0b" />
    <circle cx="16" cy="15" r="1.5" fill="#f59e0b" />
    <circle cx="24" cy="11" r="1.5" fill="#f59e0b" />
    <circle cx="32" cy="15" r="1.5" fill="#f59e0b" />
    <circle cx="35" cy="24" r="1.5" fill="#f59e0b" />
  </svg>,
  // 05: Resonator guitar 2
  <svg
    viewBox="0 0 48 48"
    className="w-9 h-9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 12C15 14 14 18 15 22C16 26 13 30 14 36C15 41 21 43 24 43C27 43 33 41 34 36C35 30 32 26 33 22C34 18 33 14 29 12C28 8 20 8 19 12Z"
      fill="#e7d8c6"
      stroke="#1c1917"
      strokeWidth="1.75"
    />
    <circle
      cx="24"
      cy="30"
      r="7.5"
      fill="#f4eee5"
      stroke="#1c1917"
      strokeWidth="1.5"
    />
    <circle cx="24" cy="30" r="4.5" fill="#d85d18" />
    <path
      d="M22 30H26M24 28V32"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect x="22.5" y="6" width="3" height="8" fill="#1c1917" />
  </svg>,
  // 06: Fretboard / TAB grid
  <svg
    viewBox="0 0 48 48"
    className="w-9 h-9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="14"
      width="28"
      height="20"
      rx="3"
      fill="#2b231d"
      stroke="#1c1917"
      strokeWidth="2"
    />
    <line x1="10" y1="19" x2="38" y2="19" stroke="#8c827a" strokeWidth="1" />
    <line x1="10" y1="24" x2="38" y2="24" stroke="#8c827a" strokeWidth="1" />
    <line x1="10" y1="29" x2="38" y2="29" stroke="#8c827a" strokeWidth="1" />
    <line x1="18" y1="14" x2="18" y2="34" stroke="#8c827a" strokeWidth="1" />
    <line x1="25" y1="14" x2="25" y2="34" stroke="#8c827a" strokeWidth="1" />
    <line x1="32" y1="14" x2="32" y2="34" stroke="#8c827a" strokeWidth="1" />
    <circle cx="18" cy="24" r="2.5" fill="#f59e0b" />
    <circle cx="25" cy="19" r="2.5" fill="#d85d18" />
    <circle cx="32" cy="29" r="2.5" fill="#f59e0b" />
  </svg>,
];

// Fallback courses data matching the screenshot
const fallbackCourses = [
  {
    number: '01',
    title: 'Slide & open tunings',
    summary: 'Learn expressive slide techniques and common open tunings.',
    url: '/courses/slide-open-tunings',
  },
  {
    number: '02',
    title: 'Delta & electric blues',
    summary: 'Play deep blues with authentic rhythm and soloing patterns.',
    url: '/courses/delta-electric-blues',
  },
  {
    number: '03',
    title: 'Soul & R&B rhythms',
    summary: 'Develop a solid groove, rhythm and R&B chord fills.',
    url: '/courses/soul-rb-rhythms',
  },
  {
    number: '04',
    title: 'Tone & analog gear',
    summary: 'Learn how to dial in the right amp and pedal tones.',
    url: '/courses/tone-analog-gear',
  },
  {
    number: '05',
    title: 'Song repertoire & licks',
    summary: 'Build a library of classic roots songs and licks.',
    url: '/courses/song-repertoire-licks',
  },
  {
    number: '06',
    title: 'Interactive TABs & backing tracks',
    summary: 'Practice with precise interactive TABs and audio tracks.',
    url: '/courses/interactive-tabs-backing-tracks',
  },
];

/**
 * Component for "CourseCurriculum" Slice.
 */
export const CourseCurriculum = ({
  slice,
}: CourseCurriculumProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  // Header content & typography
  // Badge configuration (icon, text, background color, text/icon color, border color)
  const badgeText = primary.badge_text || 'Core curriculum';
  const badgeBg = primary.badge_bg_color || 'rgba(255, 255, 255, 0.1)';
  const badgeTextColor = primary.badge_color || '#ffffff';
  const badgeBorder =
    primary.badge_border_color ||
    (primary.badge_bg_color ? 'transparent' : 'rgba(255, 255, 255, 0.15)');
  const hasBadgeIcon = isFilled.image(primary.badge_icon);

  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#ffffff',
  });

  const bodyTypo = resolveBodyTypography({
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackColor: '#a8a29e',
  });

  // Action button configuration
  const buttonText = primary.button_text || 'Discover the courses';
  const buttonLink = primary.button_link;
  const buttonBg = primary.button_bg_color || '#f5f5f4';
  const buttonTextCol = primary.button_text_color || '#1c1917';
  const buttonHoverBg = primary.button_hover_bg_color || '#ffffff';
  const buttonHoverText = primary.button_hover_text_color || '#000000';

  // 1. Define serializer so classes & inline styles attach directly to the <h2> tag
  const titleComponents = {
    heading1: ({ children }: any) => (
      <h1
        className={cn(
          headingTypo.className,
          'uppercase tracking-tight text-white leading-[1.05]'
        )}
        style={headingTypo.style}
      >
        {children}
      </h1>
    ),
    heading2: ({ children }: any) => (
      <h2
        className={cn(
          headingTypo.className,
          'uppercase tracking-tight text-white leading-[1.05]'
        )}
        style={headingTypo.style}
      >
        {children}
      </h2>
    ),
  };

  const cardTitleFont = resolveFontFamily(
    primary.card_title_font,
    'Inter Tight'
  );

  const buttonStyleProps: React.CSSProperties = {
    backgroundColor: buttonBg,
    color: buttonTextCol,
    borderColor: buttonBg,
    '--btn-hover-bg': buttonHoverBg,
    '--btn-hover-text': buttonHoverText,
  } as React.CSSProperties;

  // Section theme & colors
  const sectionBg = primary.section_bg_color || '#191614';
  const cardBg = primary.card_bg_color || '#211c19';
  const borderColor = primary.border_color || 'rgba(255, 255, 255, 0.1)';
  const numberColor = primary.number_color || '#d85d18';

  // Process items added from the course custom type
  const rawItems = Array.isArray(slice?.items) ? slice.items : [];

  const courseCards =
    rawItems.length > 0
      ? rawItems.map((item: any, idx: number) => {
          const courseDoc = isFilled.contentRelationship(item.course)
            ? (item.course as any)
            : null;

          // Resolve course title from override or linked course document
          const resolvedTitle =
            item.custom_title?.trim() ||
            courseDoc?.data?.title ||
            (typeof item.course?.title === 'string' ? item.course.title : '') ||
            `Course ${idx + 1}`;

          // Resolve course summary from override or linked course document
          let resolvedSummary = item.custom_description?.trim() || '';
          if (!resolvedSummary && courseDoc?.data?.summary) {
            resolvedSummary =
              typeof courseDoc.data.summary === 'string'
                ? courseDoc.data.summary
                : asText(courseDoc.data.summary) || '';
          }

          // Resolve image: custom override or course document image
          const resolvedImage = isFilled.image(item.custom_image)
            ? item.custom_image
            : isFilled.image(courseDoc?.data?.course_image)
              ? courseDoc.data.course_image
              : null;

          // Resolve URL
          const resolvedUrl = courseDoc?.uid
            ? `/courses/${courseDoc.uid}`
            : (item.course as any)?.url || '#';

          // Resolve item index number (e.g. "01", "02")
          const resolvedNumber =
            item.course_number?.trim() || String(idx + 1).padStart(2, '0');

          return {
            number: resolvedNumber,
            title: resolvedTitle,
            summary: resolvedSummary,
            image: resolvedImage,
            url: resolvedUrl,
            fallbackIconIdx: idx % DefaultCurriculumIcons.length,
          };
        })
      : fallbackCourses.map((c, idx) => ({
          ...c,
          image: null,
          fallbackIconIdx: idx,
        }));

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="max-w-[1380px] mx-auto">
        {/* Header Section: Left (Badge, Title, Subtitle) & Right (Discover Button) */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            {badgeText && (
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-medium mb-5 transition-colors duration-200"
                style={{
                  backgroundColor: badgeBg,
                  color: badgeTextColor,
                  borderColor: badgeBorder,
                }}
              >
                {hasBadgeIcon ? (
                  <div className="relative w-3.5 h-3.5 shrink-0 overflow-hidden flex items-center justify-center">
                    <PrismicNextImage
                      field={primary.badge_icon}
                      fill
                      sizes="16px"
                      className="object-contain"
                      alt=""
                    />
                  </div>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    style={{ color: badgeTextColor }}
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
                )}
                <span style={{ color: badgeTextColor }}>{badgeText}</span>
              </div>
            )}

            {/* Main Title */}
            <div className="mb-4">
              {isFilled.richText(primary.title) ? (
                <div
                  className={cn(
                    headingTypo.className,
                    'uppercase tracking-tight text-white'
                  )}
                  style={headingTypo.style}
                >
                  <PrismicRichText
                    field={primary.title}
                    components={titleComponents}
                  />
                </div>
              ) : (
                <h2
                  className={cn(
                    headingTypo.className,
                    'text-4xl sm:text-5xl lg:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]'
                  )}
                  style={headingTypo.style}
                >
                  MASTER PRACTICAL <br className="hidden sm:inline" />
                  ROOTS & SLIDE GUITAR
                </h2>
              )}
            </div>

            {/* Description Subtitle */}
            <div>
              {isFilled.richText(primary.description) ? (
                <div
                  className={cn(
                    bodyTypo.className,
                    'text-base sm:text-lg leading-relaxed'
                  )}
                  style={bodyTypo.style}
                >
                  <PrismicRichText field={primary.description} />
                </div>
              ) : (
                <p
                  className={cn(
                    bodyTypo.className,
                    'text-base sm:text-lg leading-relaxed max-w-2xl'
                  )}
                  style={bodyTypo.style}
                >
                  Structured masterclasses designed to build real tone, feel and
                  improvisational freedom.
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          {buttonText && (
            <div className="shrink-0 pt-2 lg:pt-0">
              {isFilled.link(buttonLink) ? (
                <PrismicNextLink
                  field={buttonLink}
                  className="slice-custom-btn inline-flex items-center justify-center rounded-md sm:rounded-md px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-medium font-inter-tight transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 focus:outline-none"
                  style={buttonStyleProps}
                >
                  {buttonText}
                </PrismicNextLink>
              ) : (
                <Link
                  href="/courses"
                  className="slice-custom-btn inline-flex items-center justify-center rounded-lg sm:rounded-xl px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-medium font-inter-tight transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 focus:outline-none"
                  style={buttonStyleProps}
                >
                  {buttonText}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Bento / Course Grid Container with subtle borders */}
        <div
          className="rounded-md overflow-hidden border transition-all duration-200 font-inter-tight"
          style={{
            borderColor: borderColor,
            backgroundColor: cardBg,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {courseCards.map((course: any, index: number) => {
              // Calculate borders for clean table grid dividing lines
              const isCol1 = index % 3 === 0;
              const isCol2 = index % 3 === 1;
              const isCol3 = index % 3 === 2;
              const isLastRow = index >= courseCards.length - 3;

              return (
                <Link
                  key={`curriculum-course-${index}`}
                  href={course.url}
                  className={cn(
                    'group relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-colors duration-200',
                    'hover:bg-white/[0.04]',
                    // Mobile border: bottom border on all except last item
                    index < courseCards.length - 1 && 'border-b md:border-b-0',
                    // Desktop horizontal bottom border (for items before the last row)
                    !isLastRow && 'lg:border-b',
                    // Desktop vertical border between columns
                    (isCol1 || isCol2) && 'lg:border-r',
                    // Tablet borders (2 columns)
                    index % 2 === 0 && 'md:border-r lg:border-r-0',
                    index <
                      courseCards.length -
                        (courseCards.length % 2 === 0 ? 2 : 1) &&
                      'md:border-b lg:border-b-0'
                  )}
                  style={{
                    borderColor: borderColor,
                  }}
                >
                  {/* Top row: Badge Icon (Left) & Index Number (Right) */}
                  <div className="flex items-start justify-between mb-8">
                    {/* Concentric-ring vintage circular badge */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[3px] bg-gradient-to-tr from-[#d85d18] via-[#f59e0b] to-[#d85d18] shadow-md shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <div className="w-full h-full rounded-full border border-black/30 bg-[#fbf6ee] p-1 flex items-center justify-center overflow-hidden">
                        {course.image ? (
                          <div className="relative w-full h-full">
                            <PrismicNextImage
                              field={course.image}
                              fill
                              sizes="64px"
                              className="object-contain"
                              alt=""
                            />
                          </div>
                        ) : (
                          DefaultCurriculumIcons[course.fallbackIconIdx]
                        )}
                      </div>
                    </div>

                    {/* Step / Index number */}
                    <span
                      className="text-xs sm:text-sm font-semibold tracking-widest font-mono select-none transition-colors duration-200"
                      style={{ color: numberColor }}
                    >
                      {course.number}
                    </span>
                  </div>

                  {/* Bottom Content: Course Title & Summary Description */}
                  <div className="flex flex-col">
                    <h3
                      className={cn(
                        cardTitleFont.className,
                        'text-md sm:text-md text-white mb-2 leading-snug group-hover:text-[#d85d18] transition-colors duration-200'
                      )}
                      style={{ fontFamily: cardTitleFont.fontFamily }}
                    >
                      {course.title}
                    </h3>
                    {course.summary && (
                      <p className="text-sm text-[#a8a29e] leading-relaxed line-clamp-3">
                        {course.summary}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseCurriculum;
