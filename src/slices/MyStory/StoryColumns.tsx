import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { resolveHeadingTypography, resolveBodyTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import { ButtonRow } from '@components/slice-ui/ButtonRow';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

/**
 * "Story" variation of MyStory: badge + title with buttons on the right, then the story
 * text on the left and an intro, numbered highlights and closing text on the right.
 */
export const StoryColumns = ({ slice }: { slice: any }): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    number: primary.number_color || '#d85d18',
    pointTitle: primary.point_title_color || '#1c1917',
    pointText: primary.point_text_color || '#78716c',
  };

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const titleClass = cn(titleTypo.className, 'uppercase tracking-tight leading-[1.05]');
  const bodyTypo = resolveBodyTypography({
    size: primary.text_size,
    font: primary.text_font,
    color: primary.text_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#78716c',
  });
  const bodyClass = cn(bodyTypo.className, 'leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_strong]:font-semibold');
  const pointFont = resolveFontFamily(primary.point_title_font, 'Inter Tight');

  const points = (Array.isArray(primary.points) ? primary.points : []).filter((p: any) => p?.title || p?.description);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12 mb-10 sm:mb-12 lg:mb-14">
          <div className="max-w-3xl">
            <BadgePill
              text={primary.badge_text || 'Our story'}
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
                The story behind Learn Guitar Cafe
              </h2>
            )}
          </div>
          <ButtonRow
            className="shrink-0 lg:pb-2"
            buttons={primary.buttons}
            font={primary.button_font}
            radius={primary.button_radius}
            colors={{
              filledBg: primary.button_bg_color || '#1c1917',
              filledText: primary.button_text_color || '#ffffff',
              filledHoverBg: primary.button_hover_bg_color || '#d85d18',
              filledHoverText: primary.button_hover_text_color || '#ffffff',
              outlineColor: primary.outline_button_color || '#1c1917',
              outlineHoverBg: primary.outline_button_hover_bg_color || '#1c1917',
              outlineHoverText: primary.outline_button_hover_text_color || '#ffffff',
            }}
          />
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20">
          {isFilled.richText(primary.left_text) && (
            <div className={bodyClass} style={bodyTypo.style}>
              <PrismicRichText field={primary.left_text} />
            </div>
          )}

          <div className="flex flex-col gap-6 sm:gap-7">
            {isFilled.richText(primary.right_intro) && (
              <div className={bodyClass} style={bodyTypo.style}>
                <PrismicRichText field={primary.right_intro} />
              </div>
            )}
            {points.length > 0 && (
              <ol className="flex flex-col gap-5 sm:gap-6">
                {points.map((p: any, i: number) => (
                  <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-1">
                    <span className="text-sm font-medium pt-[0.2em] tabular-nums" style={{ color: c.number }} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      {p.title && (
                        <p className={cn(pointFont.className, 'text-[1rem] sm:text-[1.0625rem] font-semibold')} style={{ fontFamily: pointFont.fontFamily, color: c.pointTitle }}>
                          {p.title}
                        </p>
                      )}
                      {p.description && (
                        <p className="mt-1 text-[0.95rem] sm:text-[1rem] leading-relaxed" style={{ color: c.pointText }}>
                          {p.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {isFilled.richText(primary.right_closing) && (
              <div className={bodyClass} style={bodyTypo.style}>
                <PrismicRichText field={primary.right_closing} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryColumns;
