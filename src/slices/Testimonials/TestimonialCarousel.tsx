'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

type Testimonial = {
  quote: any; // Prismic rich text or a plain string (fallback)
  name: string;
  location: string;
  avatar: any;
  rating: number;
};

const fallbackTestimonials: Testimonial[] = [
  {
    quote:
      'Paul explains tone and feel better than anybody. I’ve finally got my slide playing sounding like a record instead of years of bad habits.',
    name: 'James T.',
    location: 'Australia',
    avatar: null,
    rating: 5,
  },
  {
    quote:
      'The Open D course is fantastic. Great lessons, great songs, and Paul’s teaching style is easy to follow and incredibly rewarding.',
    name: 'Mark R.',
    location: 'United States',
    avatar: null,
    rating: 5,
  },
  {
    quote:
      'I’d been stuck in the same pentatonic box for a decade. Three weeks into the fingerstyle course I’m writing my own arrangements.',
    name: 'Jessica M.',
    location: 'United States',
    avatar: null,
    rating: 5,
  },
];

// Card width per breakpoint: 1 card (with a peek of the next) on phones,
// 2 on tablets, CMS-controlled (2/3/4) on desktop. Gap is 1.5rem.
const desktopBasis: Record<string, string> = {
  '2': 'lg:basis-[calc((100%-1.5rem)/2)]',
  '3': 'lg:basis-[calc((100%-3rem)/3)]',
  '4': 'lg:basis-[calc((100%-4.5rem)/4)]',
};

const quoteSizeClasses: Record<string, string> = {
  small: 'text-[1rem] lg:text-lg',
  medium: 'text-[1.0625rem] sm:text-lg lg:text-xl',
  large: 'text-lg sm:text-xl lg:text-[1.375rem]',
};

const StarIcon = ({ filled, color, emptyColor }: { filled: boolean; color: string; emptyColor: string }) => (
  <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden="true">
    <path
      fill={filled ? color : emptyColor}
      d="M10 1.5l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L10 14.8l-5.4 2.9 1.2-5.9L1.4 7.7l6-.7z"
    />
  </svg>
);

const ArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {direction === 'left' ? (
      <>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </>
    ) : (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    )}
  </svg>
);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

/**
 * "Carousel" variation of the Testimonials slice.
 */
export const TestimonialCarousel = ({ slice }: { slice: any }): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  // ---- Content ----
  const cmsItems: Testimonial[] = (
    Array.isArray(primary.testimonials) ? primary.testimonials : []
  )
    .filter((t: any) => isFilled.richText(t?.quote) || t?.name)
    .map((t: any) => ({
      quote: t.quote,
      name: t.name || '',
      location: t.location || '',
      avatar: t.avatar,
      rating:
        typeof t.rating === 'number'
          ? Math.max(0, Math.min(5, Math.round(t.rating)))
          : 5,
    }));
  const items = cmsItems.length > 0 ? cmsItems : fallbackTestimonials;
  const count = items.length;

  // ---- Settings ----
  const cardsPerView = String(primary.cards_per_view || '3');
  const loop = primary.loop !== false;
  const showArrows = primary.show_arrows !== false && count > 1;
  const showDots = primary.show_dots !== false && count > 1;
  const showRating = primary.show_rating !== false;
  const highlightActive = primary.highlight_active_card !== false;
  const autoplay = primary.autoplay === true;
  const autoplaySeconds =
    typeof primary.autoplay_interval === 'number' && primary.autoplay_interval >= 2
      ? primary.autoplay_interval
      : 6;

  // ---- Colours ----
  const sectionBg = primary.section_bg_color || '#f3efe6';
  const cardBg = primary.card_bg_color || '#ebe4d8';
  const cardBorder = primary.card_border_color || '#e2d9cb';
  const activeCardBg = primary.active_card_bg_color || '#fbf9f5';
  const activeCardBorder = primary.active_card_border_color || '#ddd3c4';
  const starColor = primary.star_color || '#d98a2b';
  const starEmptyColor = primary.star_empty_color || '#d6cdbf';
  const nameColor = primary.name_color || '#1c1917';
  const locationColor = primary.location_color || '#78716c';
  const navStyle = {
    '--nav-color': primary.arrow_color || '#1c1917',
    '--nav-border': primary.arrow_border_color || '#d6cdbf',
    '--nav-hover-bg': primary.arrow_hover_bg_color || '#1c1917',
    '--nav-hover-color': primary.arrow_hover_color || '#ffffff',
  } as React.CSSProperties;
  const dotActive = primary.dot_active_color || '#d85d18';
  const dotInactive = primary.dot_inactive_color || '#e2d9cb';

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
    fallbackColor: '#57534e',
  });
  const quoteFont = resolveFontFamily(primary.quote_font, 'Inter Tight');
  const quoteSize =
    quoteSizeClasses[(primary.quote_size || 'Large').toLowerCase()] || quoteSizeClasses.large;
  const quoteColor = primary.quote_color || '#1c1917';
  const nameFont = resolveFontFamily(primary.name_font, 'Inter Tight');
  const addQuoteMarks = primary.add_quote_marks !== false;

  // ---- Badge ----
  const badgeText = primary.badge_text || 'Testimonials';
  const badgeTextColor = primary.badge_text_color || '#d85d18';

  // ---- Carousel state ----
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const programmaticScroll = useRef(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  activeRef.current = active;
  const [paused, setPaused] = useState(false);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const goTo = useCallback(
    (index: number) => {
      const next = loop ? (index + count) % count : Math.max(0, Math.min(count - 1, index));
      setActive(next);
      const scroller = scrollerRef.current;
      const card = cardRefs.current[next];
      if (!scroller || !card) return;
      // Scroll only as far as possible; when all cards fit, the highlight moves instead
      const maxLeft = scroller.scrollWidth - scroller.clientWidth;
      const left = Math.max(0, Math.min(card.offsetLeft - scroller.offsetLeft, maxLeft));
      programmaticScroll.current = true;
      scroller.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      window.setTimeout(() => (programmaticScroll.current = false), 700);
    },
    [count, loop]
  );

  // Sync the active card when the user swipes / scrolls the track
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let timer: number | undefined;
    const onScroll = () => {
      if (programmaticScroll.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const base = scroller.offsetLeft;
        let closest = 0;
        let best = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const d = Math.abs(card.offsetLeft - base - scroller.scrollLeft);
          if (d < best) {
            best = d;
            closest = i;
          }
        });
        setActive(closest);
      }, 120);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  // Autoplay (paused on hover/focus, disabled for reduced motion)
  useEffect(() => {
    if (!autoplay || paused || count < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      const next = activeRef.current + 1;
      if (!loop && next >= count) return;
      goTo(next);
    }, autoplaySeconds * 1000);
    return () => window.clearInterval(id);
  }, [autoplay, paused, autoplaySeconds, count, loop, goTo]);

  const canPrev = loop || active > 0;
  const canNext = loop || active < count - 1;

  const navButtonClass =
    'w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-colors duration-200 ' +
    'text-[color:var(--nav-color)] border-[color:var(--nav-border)] ' +
    'hover:bg-[color:var(--nav-hover-bg)] hover:text-[color:var(--nav-hover-color)] hover:border-[color:var(--nav-hover-bg)] ' +
    'disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--nav-hover-bg)]';

  const arrows = showArrows && (
    <div className="flex items-center gap-3" style={navStyle}>
      <button
        type="button"
        className={navButtonClass}
        onClick={() => goTo(active - 1)}
        disabled={!canPrev}
        aria-label="Previous testimonial"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        type="button"
        className={navButtonClass}
        onClick={() => goTo(active + 1)}
        disabled={!canNext}
        aria-label="Next testimonial"
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 font-sans"
      style={{ backgroundColor: sectionBg }}
      aria-roledescription="carousel"
      aria-label={badgeText}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="max-w-[1380px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 lg:mb-14">
          <div className="max-w-3xl">
            {badgeText && (
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-medium font-inter-tight mb-5"
                style={{
                  backgroundColor: primary.badge_bg_color || '#ffffff',
                  color: badgeTextColor,
                  borderColor: primary.badge_border_color || 'transparent',
                }}
              >
                <span style={{ color: primary.badge_icon_color || badgeTextColor }} className="inline-flex">
                  {isFilled.image(primary.badge_icon) ? (
                    <span className="relative w-3.5 h-3.5 shrink-0 overflow-hidden">
                      <PrismicNextImage field={primary.badge_icon} fill sizes="16px" className="object-contain" alt="" />
                    </span>
                  ) : (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="8" cy="8" r="3" fill="currentColor" />
                    </svg>
                  )}
                </span>
                <span>{badgeText}</span>
              </div>
            )}

            {isFilled.richText(primary.title) ? (
              <PrismicRichText
                field={primary.title}
                components={{
                  heading1: ({ children }: any) => (
                    <h1 className={headingClass} style={headingTypo.style}>{children}</h1>
                  ),
                  heading2: ({ children }: any) => (
                    <h2 className={headingClass} style={headingTypo.style}>{children}</h2>
                  ),
                }}
              />
            ) : (
              <h2 className={headingClass} style={headingTypo.style}>
                Players who stopped practicing scales and started playing songs
              </h2>
            )}

            {isFilled.richText(primary.description) && (
              <div
                className={cn(bodyTypo.className, 'leading-relaxed mt-4 max-w-2xl [&_p]:mb-3 [&_p:last-child]:mb-0')}
                style={bodyTypo.style}
              >
                <PrismicRichText field={primary.description} />
              </div>
            )}
          </div>

          {/* Arrows beside the title from tablet up */}
          {arrows && <div className="hidden md:block shrink-0">{arrows}</div>}
        </div>

        {/* Track */}
        <div
          ref={scrollerRef}
          className="relative flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-1 -my-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((t, i) => {
            const isActive = highlightActive && i === active;
            return (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                className={cn(
                  'snap-start shrink-0 grow-0 basis-[85%] sm:basis-[calc((100%-1.5rem)/2)]',
                  desktopBasis[cardsPerView] || desktopBasis['3'],
                  'flex flex-col justify-between gap-10 rounded-lg border p-7 sm:p-8 lg:p-10 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]',
                  'transition-[background-color,border-color,box-shadow] duration-300',
                  isActive && 'shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.12)]'
                )}
                style={{
                  backgroundColor: isActive ? activeCardBg : cardBg,
                  borderColor: isActive ? activeCardBorder : cardBorder,
                }}
              >
                <div>
                  {showRating && t.rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-6" role="img" aria-label={`Rated ${t.rating} out of 5`}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <StarIcon key={s} filled={s < t.rating} color={starColor} emptyColor={starEmptyColor} />
                      ))}
                    </div>
                  )}

                  <blockquote
                    className={cn(
                      quoteFont.className,
                      quoteSize,
                      'leading-[1.45] tracking-[-0.01em]',
                      addQuoteMarks && 'slice-quote-marks'
                    )}
                    style={{ fontFamily: quoteFont.fontFamily, color: quoteColor }}
                  >
                    {typeof t.quote === 'string' ? (
                      <p>{t.quote}</p>
                    ) : (
                      <PrismicRichText field={t.quote} />
                    )}
                  </blockquote>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="relative w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: starEmptyColor, color: nameColor }}
                  >
                    {isFilled.image(t.avatar) ? (
                      <PrismicNextImage field={t.avatar} fill sizes="52px" className="object-cover" alt="" />
                    ) : (
                      <span aria-hidden="true">{initials(t.name)}</span>
                    )}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span
                      className={cn(nameFont.className, 'text-[0.95rem] sm:text-[1rem] font-semibold leading-tight')}
                      style={{ fontFamily: nameFont.fontFamily, color: nameColor }}
                    >
                      {t.name}
                    </span>
                    {t.location && (
                      <span className="text-sm leading-tight mt-1" style={{ color: locationColor }}>
                        {t.location}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots (+ arrows on phones) */}
        {(showDots || arrows) && (
          <div className="mt-8 flex items-center justify-between md:justify-center gap-4">
            {showDots ? (
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === active ? 'true' : undefined}
                    className={cn(
                      'h-3 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      i === active ? 'w-12' : 'w-3'
                    )}
                    style={{ backgroundColor: i === active ? dotActive : dotInactive }}
                  />
                ))}
              </div>
            ) : (
              <span />
            )}
            {arrows && <div className="md:hidden">{arrows}</div>}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialCarousel;
