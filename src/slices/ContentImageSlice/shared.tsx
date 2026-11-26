import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { resolveFontFamily } from '@lgc_cms/util';
import cn from 'classnames';

/**
 * Shared building blocks for ContentImageSlice variations
 * (badge pill, CMS-driven button, arrow icon, radius & opacity helpers).
 */

export const resolveRadiusClass = (
  value?: string | null,
  fallback = 'rounded-md'
) => {
  if (!value) return fallback;
  const r = String(value).toLowerCase();
  if (r.includes('sharp') || r.includes('none') || r.includes('square'))
    return 'rounded-none';
  if (r.includes('pill') || r.includes('full')) return 'rounded-full';
  if (r.includes('extra')) return 'rounded-3xl';
  if (r.includes('large') || r.includes('lg')) return 'rounded-2xl';
  if (r.includes('small') || r.includes('sm')) return 'rounded-sm';
  return 'rounded-md';
};

/** Accepts 0-100 (percent) or 0-1 values from a Number field. */
export const resolveOpacity = (raw: unknown, fallback = 1) => {
  if (typeof raw !== 'number' || Number.isNaN(raw)) return fallback;
  return raw > 1 ? Math.min(raw / 100, 1) : Math.max(raw, 0);
};

export const ArrowIcon = () => (
  <svg
    className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const DefaultBadgeIcon = () => (
  <svg
    className="w-3.5 h-3.5 shrink-0"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="3" fill="currentColor" />
  </svg>
);

/** Built-in badge icons (used when no icon image is uploaded). */
const presetBadgeIcon = (name?: string | null) => {
  const n = String(name || 'Dot').toLowerCase();
  const common = { className: 'w-3.5 h-3.5 shrink-0', viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (n === 'none') return null;
  if (n === 'trophy')
    return (
      <svg {...common}>
        <path d="M5 2.5h6v3.5a3 3 0 0 1-6 0V2.5zM5 3.5H2.8v1a2.2 2.2 0 0 0 2.4 2.2M11 3.5h2.2v1a2.2 2.2 0 0 1-2.4 2.2M8 9v2.5M5.5 13.5h5M6.5 11.5h3v2h-3z" />
      </svg>
    );
  if (n === 'star')
    return (
      <svg {...common}>
        <path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" />
      </svg>
    );
  if (n === 'music')
    return (
      <svg {...common}>
        <path d="M6 12.5V3.5l7-1.5v9" />
        <circle cx="4.5" cy="12.5" r="1.6" />
        <circle cx="11.5" cy="11" r="1.6" />
      </svg>
    );
  return <DefaultBadgeIcon />;
};

export const BadgePill = ({
  text,
  icon,
  preset,
  bg,
  textColor,
  iconColor,
  borderColor,
  className,
}: {
  text?: string | null;
  icon?: any;
  /** Built-in icon when no image is uploaded: Dot (default), Trophy, Star, Music, None */
  preset?: string | null;
  bg: string;
  textColor: string;
  iconColor?: string;
  borderColor?: string;
  className?: string;
}) => {
  if (!text) return null;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-medium font-inter-tight',
        className
      )}
      style={{
        backgroundColor: bg,
        color: textColor,
        borderColor: borderColor || 'transparent',
      }}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{ color: iconColor || textColor }}
      >
        {isFilled.image(icon) ? (
          <span className="relative w-3.5 h-3.5 shrink-0 overflow-hidden">
            <PrismicNextImage
              field={icon}
              fill
              sizes="16px"
              className="object-contain"
              alt=""
            />
          </span>
        ) : (
          presetBadgeIcon(preset)
        )}
      </span>
      <span>{text}</span>
    </div>
  );
};

export type CmsButtonConfig = {
  label?: string | null;
  link?: any;
  font?: string | null;
  radius?: string | null;
  bg: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
  hoverText: string;
  showArrow?: boolean;
  className?: string;
};

/**
 * Button whose colours/hover state come from the CMS
 * (hover handled by `.slice-custom-btn` in global.scss).
 */
export const CmsButton = ({
  label,
  link,
  font,
  radius,
  bg,
  textColor,
  borderColor,
  hoverBg,
  hoverText,
  showArrow,
  className,
}: CmsButtonConfig) => {
  if (!label) return null;
  const buttonFont = resolveFontFamily(font, 'Inter Tight');

  const style = {
    fontFamily: buttonFont.fontFamily,
    '--btn-bg': bg,
    '--btn-text': textColor,
    '--btn-border': borderColor,
    '--btn-hover-bg': hoverBg,
    '--btn-hover-text': hoverText,
    '--btn-hover-border': hoverBg,
  } as React.CSSProperties;

  const classes = cn(
    'slice-custom-btn group border px-5 py-3 sm:px-6 text-sm sm:text-[1rem] inline-flex items-center gap-2.5',
    resolveRadiusClass(radius),
    buttonFont.className,
    className
  );

  const content = (
    <>
      <span>{label}</span>
      {showArrow && <ArrowIcon />}
    </>
  );

  return isFilled.link(link) ? (
    <PrismicNextLink field={link} className={classes} style={style}>
      {content}
    </PrismicNextLink>
  ) : (
    <span className={classes} style={style}>
      {content}
    </span>
  );
};

/** Rich-text serializer that applies resolved heading typography to h1/h2/h3. */
export const buildTitleComponents = (className: string, style: any) => {
  const make =
    (Tag: 'h1' | 'h2' | 'h3') =>
    // eslint-disable-next-line react/display-name
    ({ children }: any) => (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  return { heading1: make('h1'), heading2: make('h2'), heading3: make('h3') };
};

type Stripe = { color: string; height: number; spaceAfter: number | null };

// Default retro stripes; the space between them comes from `gap`
const fallbackStripes: Stripe[] = [
  { color: '#e8b04b', height: 6, spaceAfter: null },
  { color: '#d85d18', height: 5, spaceAfter: null },
  { color: '#a2401a', height: 4, spaceAfter: null },
  { color: '#5e2a17', height: 4, spaceAfter: null },
];

const DEFAULT_STRIPE_GAP = 3;

const toNonNegativeNumber = (v: unknown): number | null =>
  typeof v === 'number' && !Number.isNaN(v) && v >= 0 ? v : null;

/**
 * Decorative horizontal retro stripes driven by CMS fields:
 * a Group of { color, height, space_after }, a default gap (px) and gap colour.
 * Used by the Promo Banner and the Footer.
 */
export const RetroStripes = ({
  stripes: rawStripes,
  gap,
  gapColor,
  className,
}: {
  stripes?: any[] | null;
  gap?: number | null;
  gapColor?: string | null;
  className?: string;
}) => {
  const cmsStripes: Stripe[] = (Array.isArray(rawStripes) ? rawStripes : [])
    .filter((s: any) => s?.color)
    .map((s: any) => ({
      color: s.color,
      height: typeof s.height === 'number' && s.height > 0 ? s.height : 4,
      spaceAfter: toNonNegativeNumber(s.space_after),
    }));
  const stripes = cmsStripes.length > 0 ? cmsStripes : fallbackStripes;
  const defaultGap = toNonNegativeNumber(gap) ?? DEFAULT_STRIPE_GAP;

  return (
    <div
      className={cn('w-full', className)}
      // Empty = transparent, so the section background shows through the gaps
      style={{ backgroundColor: gapColor || 'transparent' }}
      aria-hidden="true"
    >
      {stripes.map((s, i) => (
        <div
          key={i}
          className="w-full"
          style={{
            backgroundColor: s.color,
            height: `${s.height}px`,
            // No space after the last stripe
            marginBottom:
              i < stripes.length - 1 ? `${s.spaceAfter ?? defaultGap}px` : undefined,
          }}
        />
      ))}
    </div>
  );
};

const fallbackMarquee = [
  'Slide guitar',
  'Open tunings',
  'Roots & blues',
  'Bottleneck tone',
  'Fingerstyle',
  'Vintage tone',
];

const marqueeDurations: Record<string, string> = {
  slow: '60s',
  normal: '40s',
  fast: '22s',
};

const marqueeSizeClasses: Record<string, string> = {
  small: 'text-[1rem] sm:text-lg py-2.5',
  medium: 'text-lg sm:text-xl lg:text-2xl py-3 sm:py-3.5',
  large: 'text-xl sm:text-2xl lg:text-3xl py-4',
};

/**
 * Infinite scrolling text strip driven by the shared marquee CMS fields:
 * marquee_items[].text, marquee_separator, marquee_bg_color, marquee_text_color,
 * marquee_font, marquee_size, marquee_speed, marquee_direction.
 * Animation lives in global.scss (.slice-marquee / .slice-marquee-track).
 */
export const CmsMarquee = ({
  primary,
  className,
  style,
}: {
  primary: any;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const cmsItems = (Array.isArray(primary?.marquee_items) ? primary.marquee_items : [])
    .map((m: any) => m?.text)
    .filter(Boolean) as string[];
  const items = cmsItems.length > 0 ? cmsItems : fallbackMarquee;
  const font = resolveFontFamily(primary?.marquee_font, 'Inter Tight');
  const sizeClass =
    marqueeSizeClasses[String(primary?.marquee_size || 'Medium').toLowerCase()] ||
    marqueeSizeClasses.medium;
  const separator = primary?.marquee_separator || '';

  const marqueeStyle = {
    backgroundColor: primary?.marquee_bg_color || '#d85d18',
    color: primary?.marquee_text_color || '#ffffff',
    fontFamily: font.fontFamily,
    '--marquee-duration':
      marqueeDurations[String(primary?.marquee_speed || 'Normal').toLowerCase()] ||
      marqueeDurations.normal,
    '--marquee-direction':
      String(primary?.marquee_direction || 'Left').toLowerCase() === 'right' ? 'reverse' : 'normal',
    ...style,
  } as React.CSSProperties;

  // One copy of the list; the track holds two copies for a seamless loop
  const group = (copy: number) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copy > 0 ? true : undefined}>
      {items.map((text, i) => (
        <li key={`${copy}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-4 sm:px-6">{text}</span>
          {separator && (
            <span className="opacity-70" aria-hidden="true">
              {separator}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn('slice-marquee w-full overflow-hidden', font.className, sizeClass, className)}
      style={marqueeStyle}
    >
      <div className="slice-marquee-track">
        {group(0)}
        {group(1)}
      </div>
    </div>
  );
};
