import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import { resolveHeadingTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

/**
 * Props for `Deliverables`.
 */
export type DeliverablesProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const columnClasses: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Component for "Deliverables" Slices: "What you get inside" — centred header and
 * numbered cards, each with an illustration in a gold/orange ring, a title and description.
 */
const Deliverables = ({ slice }: DeliverablesProps): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  let items = (Array.isArray(primary.items) ? primary.items : []).filter((i: any) => i?.title);
  if (items.length === 0) {
    if (process.env.NODE_ENV === 'production') return null;
    // Preview in development / Slice Machine
    items = [
      { title: 'Video lesson', description: 'A step-by-step masterclass on the classic slide tune, filmed close up.' },
      { title: 'PDF TABs', description: 'Note-for-note transcription plus Guitar Pro files you can slow down.' },
      { title: 'Backing track', description: 'The official play-along jam track, recorded with vintage gear.' },
    ];
  }

  const isCentered = String(primary.header_alignment || 'Center').toLowerCase() === 'center';
  const showNumbers = primary.show_numbers !== false;
  const showRing = primary.show_icon_ring !== false;
  const cols = columnClasses[String(primary.columns || '3')] || columnClasses['3'];

  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    cardBg: primary.card_bg_color || '#fbf9f5',
    cardBorder: primary.card_border_color || '#ebe4d8',
    number: primary.number_color || '#d85d18',
    title: primary.item_title_color || '#1c1917',
    text: primary.item_text_color || '#78716c',
    ringFrom: primary.ring_color_1 || '#d85d18',
    ringTo: primary.ring_color_2 || '#f5a623',
    iconBg: primary.icon_bg_color || '#1c1917',
  };

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const titleClass = cn(titleTypo.className, 'uppercase tracking-tight leading-[1.02]');
  const itemFont = resolveFontFamily(primary.item_title_font, 'Inter Tight');

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className={cn('flex flex-col mb-10 sm:mb-12', isCentered ? 'items-center text-center max-w-3xl mx-auto' : 'items-start text-left max-w-3xl')}>
          <BadgePill
            text={primary.badge_text || 'Deliverables'}
            icon={primary.badge_icon}
            preset={primary.badge_icon_preset}
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
                heading1: ({ children }: any) => <h1 className={titleClass} style={titleTypo.style}>{children}</h1>,
                heading2: ({ children }: any) => <h2 className={titleClass} style={titleTypo.style}>{children}</h2>,
              }}
            />
          ) : (
            <h2 className={titleClass} style={titleTypo.style}>
              What you get inside
            </h2>
          )}
          {isFilled.richText(primary.description) && (
            <div className="mt-4 max-w-2xl text-[1rem] sm:text-[1.0625rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0" style={{ color: primary.description_color || '#78716c' }}>
              <PrismicRichText field={primary.description} />
            </div>
          )}
        </div>

        <ol className={cn('grid grid-cols-1 gap-5 sm:gap-6', cols)}>
          {items.map((item: any, i: number) => (
            <li key={i} className="flex flex-col rounded-[6px] border p-6 sm:p-8" style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}>
              <div className="flex items-start justify-between gap-4">
                {(isFilled.image(item.icon) || showRing) && (
                  <span
                    className="relative w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] shrink-0 rounded-full p-[5px]"
                    style={showRing ? { background: `linear-gradient(135deg, ${c.ringFrom}, ${c.ringTo}, ${c.ringFrom})` } : undefined}
                    aria-hidden="true"
                  >
                    <span className="relative block w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: showRing ? '#1c1917' : 'transparent', backgroundColor: c.iconBg }}>
                      {isFilled.image(item.icon) && <PrismicNextImage field={item.icon} fill sizes="110px" className="object-cover" alt="" />}
                    </span>
                  </span>
                )}
                {showNumbers && (
                  <span className="text-sm font-semibold tabular-nums" style={{ color: c.number }} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
              </div>
              <h3 className={cn(itemFont.className, 'mt-8 sm:mt-10 text-[1.125rem] sm:text-[1.25rem] leading-snug')} style={{ fontFamily: itemFont.fontFamily, color: c.title }}>
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: c.text }}>
                  {item.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Deliverables;
