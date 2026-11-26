import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { resolveHeadingTypography, resolveBodyTypography, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import { ButtonRow } from '@components/slice-ui/ButtonRow';
import { RingPortrait } from '@components/slice-ui/RingPortrait';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

/**
 * "Instructor" variation of MyStory: circular portrait framed by rings with a vinyl
 * record behind it, next to badge, name, role, bio and buttons.
 */
export const InstructorIntro = ({ slice }: { slice: any }): JSX.Element => {
  const primary = (slice?.primary || {}) as any;
  const imageRight = primary.image_position === 'Right';
  const showVinyl = primary.show_vinyl !== false;

  const c = {
    sectionBg: primary.section_bg_color || '#1c1917',
    ringOuter: primary.ring_outer_color || '#e8b04b',
    ringInner: primary.ring_inner_color || '#d85d18',
    vinyl: primary.vinyl_color || '#231f1d',
    vinylGroove: primary.vinyl_groove_color || 'rgba(255, 255, 255, 0.05)',
    subtitle: primary.subtitle_color || '#a8a29e',
  };

  const nameTypo = resolveHeadingTypography({
    size: primary.name_size,
    font: primary.name_font,
    color: primary.name_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Extra Large',
    fallbackColor: '#f3efe6',
  });
  const nameClass = cn(nameTypo.className, 'uppercase tracking-tight leading-[0.95]');
  const bioTypo = resolveBodyTypography({
    size: primary.bio_size,
    font: primary.bio_font,
    color: primary.bio_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#a8a29e',
  });

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      <div className="relative max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-12 lg:gap-16 xl:gap-24">
        {/* Portrait with rings + vinyl */}
        <div className={cn('relative flex justify-center', imageRight && 'lg:order-2')}>
          <RingPortrait
            image={primary.image}
            gapColor={c.sectionBg}
            ringOuter={c.ringOuter}
            ringInner={c.ringInner}
            showVinyl={showVinyl}
            vinylColor={c.vinyl}
            vinylGroove={c.vinylGroove}
            vinylSide={imageRight ? 'right' : 'left'}
            priority
          />
        </div>

        {/* Text */}
        <div className={cn('flex flex-col items-start', imageRight && 'lg:order-1')}>
          <BadgePill
            text={primary.badge_text || 'Meet the instructor'}
            icon={primary.badge_icon}
            preset={primary.badge_icon_preset}
            bg={primary.badge_bg_color || 'rgba(255, 255, 255, 0.07)'}
            textColor={primary.badge_text_color || '#e07b39'}
            iconColor={primary.badge_icon_color}
            borderColor={primary.badge_border_color}
            className="mb-5 sm:mb-6"
          />
          {isFilled.richText(primary.name) ? (
            <PrismicRichText
              field={primary.name}
              components={{
                heading1: ({ children }: any) => <h1 className={nameClass} style={nameTypo.style}>{children}</h1>,
                heading2: ({ children }: any) => <h2 className={nameClass} style={nameTypo.style}>{children}</h2>,
              }}
            />
          ) : (
            <h2 className={nameClass} style={nameTypo.style}>
              Paul Greig
            </h2>
          )}
          {primary.subtitle && (
            <p className="mt-5 sm:mt-6 text-[1.0625rem] sm:text-[1.25rem]" style={{ color: c.subtitle }}>
              {primary.subtitle}
            </p>
          )}
          {isFilled.richText(primary.bio) && (
            <div className={cn(bioTypo.className, 'mt-6 sm:mt-8 max-w-2xl leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline')} style={bioTypo.style}>
              <PrismicRichText field={primary.bio} />
            </div>
          )}
          <ButtonRow
            className="mt-8 sm:mt-10"
            buttons={primary.buttons}
            font={primary.button_font}
            radius={primary.button_radius}
            colors={{
              filledBg: primary.button_bg_color || '#f3efe6',
              filledText: primary.button_text_color || '#1c1917',
              filledHoverBg: primary.button_hover_bg_color || '#d85d18',
              filledHoverText: primary.button_hover_text_color || '#ffffff',
              outlineColor: primary.outline_button_color || '#f3efe6',
              outlineHoverBg: primary.outline_button_hover_bg_color || '#f3efe6',
              outlineHoverText: primary.outline_button_hover_text_color || '#1c1917',
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default InstructorIntro;
