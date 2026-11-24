'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
  cn,
} from '@lgc_cms/util';

import type { JSX } from 'react';

/**
 * Props for `StatsBand`.
 */
export type StatsBandProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

type StatItem = { value: string; label: string };

const fallbackStats: StatItem[] = [
  { value: '2,500+', label: 'Active players' },
  { value: '250+', label: 'Comprehensive lessons' },
  { value: '25+', label: 'Signature masterclasses' },
  { value: '20,000+', label: 'Hours practiced' },
];

// Stat number size options -> responsive Tailwind classes
const valueSizeClasses: Record<string, string> = {
  small: 'text-4xl sm:text-5xl',
  medium: 'text-5xl sm:text-6xl',
  large: 'text-5xl sm:text-6xl lg:text-7xl',
  'extra large': 'text-6xl sm:text-7xl lg:text-8xl',
};

// Desktop column count follows the number of stats (max 4 per row)
const lgColumnClasses: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

/**
 * Splits a value like "$2,500+" into prefix "$", number 2500 and suffix "+"
 * so it can be animated. Returns null when no number is present.
 */
function parseStatValue(raw: string) {
  const match = raw.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numeric, suffix] = match;
  return {
    prefix,
    suffix,
    target: parseFloat(numeric.replace(/,/g, '')),
    decimals: (numeric.split('.')[1] || '').length,
    grouping: numeric.includes(','),
  };
}

/**
 * Renders a stat value, optionally counting up from 0 when it scrolls into view.
 * The final value is rendered on the server, so content is correct without JS.
 */
const AnimatedValue = ({
  value,
  animate,
}: {
  value: string;
  animate: boolean;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const parsed = parseStatValue(value);
    const el = ref.current;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!animate || !parsed || !el || reduceMotion) {
      setDisplay(value);
      return;
    }

    const format = (n: number) =>
      parsed.prefix +
      n.toLocaleString('en-US', {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
        useGrouping: parsed.grouping,
      }) +
      parsed.suffix;

    setDisplay(format(0));

    let frame = 0;
    const duration = 1600;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setDisplay(format(parsed.target * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, animate]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
};

/**
 * Component for "StatsBand" Slices.
 */
export const StatsBand = ({ slice }: StatsBandProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  // Badge configuration
  const badgeText = primary.badge_text || 'Community';
  const badgeBg = primary.badge_bg_color || '#ffffff';
  const badgeTextColor = primary.badge_color || '#d85d18';
  const badgeBorder = primary.badge_border_color || 'transparent';
  const hasBadgeIcon = isFilled.image(primary.badge_icon);

  // Header typography
  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });

  const bodyTypo = resolveBodyTypography({
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackColor: '#78716c',
  });

  const isLeftAligned =
    (primary.header_alignment || 'Center').toLowerCase() === 'left';

  // Section & panel colors
  const sectionBg = primary.section_bg_color || '#f3efe6';
  const panelBg = primary.panel_bg_color || '#1c1917';
  const dividerColor = primary.divider_color || 'rgba(255, 255, 255, 0.1)';

  // Stat typography
  const valueFont = resolveFontFamily(primary.value_font, 'Bebas Neue');
  const valueSizeClass =
    valueSizeClasses[(primary.value_size || 'Large').toLowerCase()] ||
    valueSizeClasses.large;
  const valueColor = primary.value_color || '#e07b39';
  const labelFont = resolveFontFamily(primary.label_font, 'Inter Tight');
  const labelColor = primary.label_color || '#f5f5f4';
  const animate = primary.animate_numbers !== false;

  // Stats from the CMS group (fallback to design defaults when empty)
  const cmsStats: StatItem[] = (
    Array.isArray(primary.stats) ? primary.stats : []
  )
    .filter((item: any) => item?.value || item?.label)
    .map((item: any) => ({ value: item.value || '', label: item.label || '' }));
  const stats = cmsStats.length > 0 ? cmsStats : fallbackStats;

  const headingClasses = cn(
    headingTypo.className,
    'uppercase tracking-tight leading-[1.05]'
  );
  const titleComponents = {
    heading1: ({ children }: any) => (
      <h1 className={headingClasses} style={headingTypo.style}>
        {children}
      </h1>
    ),
    heading2: ({ children }: any) => (
      <h2 className={headingClasses} style={headingTypo.style}>
        {children}
      </h2>
    ),
  };

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="max-w-[1380px] mx-auto">
        {/* Header: Badge, Title, Description */}
        <div
          className={cn(
            'flex flex-col mb-12 lg:mb-16',
            isLeftAligned
              ? 'items-start text-left max-w-3xl'
              : 'items-center text-center max-w-4xl mx-auto'
          )}
        >
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
              <span>{badgeText}</span>
            </div>
          )}

          <div className="mb-4">
            {isFilled.richText(primary.title) ? (
              <PrismicRichText
                field={primary.title}
                components={titleComponents}
              />
            ) : (
              <h2 className={headingClasses} style={headingTypo.style}>
                Experience the Cafe difference
              </h2>
            )}
          </div>

          {isFilled.richText(primary.description) ? (
            <div
              className={cn(bodyTypo.className, 'leading-relaxed max-w-2xl')}
              style={bodyTypo.style}
            >
              <PrismicRichText field={primary.description} />
            </div>
          ) : (
            <p
              className={cn(bodyTypo.className, 'leading-relaxed max-w-2xl')}
              style={bodyTypo.style}
            >
              Why passionate players choose the Cafe to develop authentic touch,
              tone and lifelong musical progress.
            </p>
          )}
        </div>

        {/* Stats Panel */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: panelBg }}
        >
          {/* Negative margins hide the outer edge of each cell's top/left border,
              leaving only the inner dividers - works for any number of stats. */}
          <dl
            className={cn(
              'grid -mt-px -ml-px',
              stats.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
              lgColumnClasses[Math.min(stats.length, 4)]
            )}
          >
            {stats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                className="flex flex-col-reverse items-center justify-center text-center gap-3 sm:gap-4 px-4 py-10 sm:py-12 lg:py-14 border-t border-l"
                style={{ borderColor: dividerColor }}
              >
                <dt
                  className={cn(
                    labelFont.className,
                    'text-sm sm:text-[1rem] lg:text-lg leading-snug'
                  )}
                  style={{ fontFamily: labelFont.fontFamily, color: labelColor }}
                >
                  {stat.label}
                </dt>
                <dd
                  className={cn(
                    valueFont.className,
                    valueSizeClass,
                    'leading-none tracking-tight'
                  )}
                  style={{ fontFamily: valueFont.fontFamily, color: valueColor }}
                >
                  <AnimatedValue value={stat.value} animate={animate} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default StatsBand;
