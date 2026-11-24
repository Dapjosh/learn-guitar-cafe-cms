import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
} from '@lgc_cms/util';
import cn from 'classnames';

import {
  BadgePill,
  CmsButton,
  RetroStripes,
  CmsMarquee,
  buildTitleComponents,
  resolveOpacity,
} from './shared';

import type { JSX } from 'react';

/**
 * "Promo Banner" variation of ContentImageSlice:
 * decorative stripes, centered badge/title/description/CTA over a background
 * illustration, and an infinite scrolling marquee strip at the bottom.
 */
export const PromoBanner = ({ slice }: { slice: any }): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  // Background
  const sectionBg = primary.background_color || '#2f2b27';
  const hasBgImage = isFilled.image(primary.background_image);
  const bgOpacity = resolveOpacity(primary.background_image_opacity, 0.35);

  // Decorative stripes
  const showStripes = primary.show_top_stripes !== false;

  // Typography
  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    weight: primary.title_weight,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#f3efe6',
  });
  const bodyTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#e7e5e4',
  });
  const headingClass = cn(
    headingTypo.className,
    'uppercase tracking-tight leading-[1.05]'
  );

  const showMarquee = primary.show_marquee !== false;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full overflow-hidden font-sans"
      style={{ backgroundColor: sectionBg }}
    >
      {/* Background illustration */}
      {hasBgImage && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ opacity: bgOpacity }}
        >
          <PrismicNextImage
            field={primary.background_image}
            fill
            sizes="100vw"
            className="object-cover object-center"
            alt=""
          />
        </div>
      )}

      {/* Decorative stripes */}
      {showStripes && (
        <RetroStripes
          stripes={primary.stripes}
          gap={primary.stripe_gap}
          gapColor={primary.stripe_gap_color}
          className="relative z-10"
        />
      )}

      {/* Centered content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <BadgePill
            text={primary.badge_text ?? 'Special bundle'}
            icon={primary.badge_icon}
            bg={primary.badge_bg_color || '#f3efe6'}
            textColor={primary.badge_text_color || '#1c1917'}
            iconColor={primary.badge_icon_color || '#d85d18'}
            borderColor={primary.badge_border_color}
            className="mb-6"
          />

          <div className="mb-5 sm:mb-6">
            {isFilled.richText(primary.title) ? (
              <PrismicRichText
                field={primary.title}
                components={buildTitleComponents(
                  headingClass,
                  headingTypo.style
                )}
              />
            ) : (
              <h2 className={headingClass} style={headingTypo.style}>
                The Acoustic, Blues &amp; Slide Masterclass Bundle
              </h2>
            )}
          </div>

          <div
            className={cn(
              bodyTypo.className,
              'leading-relaxed max-w-md mb-8 sm:mb-10 [&_p]:mb-3 [&_p:last-child]:mb-0'
            )}
            style={bodyTypo.style}
          >
            {isFilled.richText(primary.description) ? (
              <PrismicRichText field={primary.description} />
            ) : (
              <p>
                Get lifetime access to all three masterclass series and save on
                the bundle price.
              </p>
            )}
          </div>

          <CmsButton
            label={primary.button_label ?? 'Explore the lessons'}
            link={primary.button_link}
            font={primary.button_font}
            radius={primary.button_radius}
            bg={primary.button_background_color || '#d85d18'}
            textColor={primary.button_text_color || '#ffffff'}
            borderColor={primary.button_background_color || '#d85d18'}
            hoverBg={primary.button_hover_background_color || '#b94c10'}
            hoverText={primary.button_hover_text_color || '#ffffff'}
            showArrow={primary.button_show_arrow !== false}
          />
        </div>
      </div>

      {/* Scrolling marquee */}
      {showMarquee && (
        <CmsMarquee primary={primary} className="relative z-10" />
      )}
    </section>
  );
};

export default PromoBanner;
