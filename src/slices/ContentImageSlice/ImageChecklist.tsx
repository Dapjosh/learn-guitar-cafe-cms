import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
} from '@lgc_cms/util';
import cn from 'classnames';

import {
  BadgePill,
  CmsButton,
  buildTitleComponents,
  resolveRadiusClass,
} from './shared';

import type { JSX } from 'react';

const fallbackChecklist = [
  'Instant access to starter masterclasses',
  'Authentic technique and tone from the first lesson',
  'Interactive TABs and backing tracks',
];

const listSizeClasses: Record<string, string> = {
  small: 'text-sm sm:text-[1rem]',
  medium: 'text-[1rem] sm:text-lg',
  large: 'text-lg sm:text-xl',
};

const aspectClasses: Record<string, string> = {
  landscape: 'aspect-[4/3]',
  'near square': 'aspect-[15/13]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};

/** Points for an N-pointed starburst polygon in a 100x100 viewBox. */
const starburstPoints = (spikes = 16, outer = 50, inner = 42) =>
  Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    return `${(50 + r * Math.cos(angle)).toFixed(2)},${(
      50 +
      r * Math.sin(angle)
    ).toFixed(2)}`;
  }).join(' ');

const STARBURST = starburstPoints();

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

/**
 * "Image With Checklist" variation of ContentImageSlice:
 * framed photo with an optional starburst sticker, next to a badge, title,
 * optional description, icon checklist and CTA button.
 */
export const ImageChecklist = ({ slice }: { slice: any }): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  const sectionBg = primary.background_color || '#f3efe6';
  const isImageRight = primary.image_position === 'Right';

  // Image frame
  const imageRadius = resolveRadiusClass(primary.image_radius, 'rounded-2xl');
  const imageBorderColor = primary.image_border_color || '#1c1917';
  const imageAspect =
    aspectClasses[(primary.image_aspect_ratio || 'Near Square').toLowerCase()] ||
    aspectClasses['near square'];

  // Sticker
  const stickerText = primary.sticker_text ?? 'Free';
  const showSticker = primary.show_sticker !== false && !!stickerText;
  const stickerShape = (primary.sticker_shape || 'Starburst').toLowerCase();
  const stickerBg = primary.sticker_bg_color || '#e8b04b';
  const stickerTextColor = primary.sticker_text_color || '#1c1917';
  const stickerFont = resolveFontFamily(primary.sticker_font, 'Inter Tight');
  const stickerOnRight =
    (primary.sticker_position || 'Top Left').toLowerCase().includes('right');

  // Typography
  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    weight: primary.title_weight,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const bodyTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#57534e',
  });
  const headingClass = cn(
    headingTypo.className,
    'uppercase tracking-tight leading-[1.05]'
  );

  // Checklist
  const cmsChecklist = (
    Array.isArray(primary.checklist) ? primary.checklist : []
  )
    .map((c: any) => c?.text)
    .filter(Boolean) as string[];
  const checklist = cmsChecklist.length > 0 ? cmsChecklist : fallbackChecklist;
  const listFont = resolveFontFamily(primary.list_font, 'Inter Tight');
  const listSize =
    listSizeClasses[(primary.list_size || 'Medium').toLowerCase()] ||
    listSizeClasses.medium;
  const listTextColor = primary.list_text_color || '#1c1917';
  const listIconBg = primary.list_icon_bg_color || '#f8d5c0';
  const listIconColor = primary.list_icon_color || '#d85d18';
  const hasCustomListIcon = isFilled.image(primary.list_icon);

  // Button (outline style by default, like the design)
  const isFilledButton = (primary.button_style || 'Outline') === 'Filled';
  const btnBg =
    primary.button_background_color ||
    (isFilledButton ? '#1c1917' : 'transparent');
  const btnText =
    primary.button_text_color || (isFilledButton ? '#ffffff' : '#1c1917');

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 font-sans"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 xl:gap-24">
        {/* Image column */}
        <div
          className={cn(
            // Left-aligned when stacked so it lines up with the text below
            'relative w-full max-w-[600px]',
            isImageRight && 'lg:order-2 lg:ml-auto',
            showSticker && 'pt-6 sm:pt-8'
          )}
        >
          <div
            className={cn(
              'relative w-full overflow-hidden border',
              imageRadius,
              imageAspect
            )}
            style={{ borderColor: imageBorderColor }}
          >
            {isFilled.image(primary.image) ? (
              <PrismicNextImage
                field={primary.image}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200"
                alt="Acoustic guitar leaning against a vintage amplifier"
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>

          {/* Sticker */}
          {showSticker && (
            <div
              className={cn(
                // Small overhang on phones so the sticker never runs off-screen
                'absolute top-0 w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center -rotate-12',
                stickerOnRight
                  ? '-right-1 sm:-right-3 lg:-right-4'
                  : '-left-1 sm:-left-3 lg:-left-4'
              )}
            >
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full drop-shadow-sm"
                aria-hidden="true"
              >
                {stickerShape === 'circle' ? (
                  <circle cx="50" cy="50" r="48" fill={stickerBg} />
                ) : (
                  <polygon points={STARBURST} fill={stickerBg} />
                )}
              </svg>
              <span
                className={cn(
                  stickerFont.className,
                  'relative text-[0.95rem] sm:text-lg lg:text-xl leading-none text-center px-2'
                )}
                style={{
                  fontFamily: stickerFont.fontFamily,
                  color: stickerTextColor,
                }}
              >
                {stickerText}
              </span>
            </div>
          )}
        </div>

        {/* Content column */}
        <div
          className={cn(
            'flex flex-col items-start text-left',
            isImageRight && 'lg:order-1'
          )}
        >
          <BadgePill
            text={primary.badge_text ?? 'Free starter pack'}
            icon={primary.badge_icon}
            bg={primary.badge_bg_color || '#ffffff'}
            textColor={primary.badge_text_color || '#d85d18'}
            iconColor={primary.badge_icon_color}
            borderColor={primary.badge_border_color}
            className="mb-5 sm:mb-6"
          />

          <div className="mb-6 sm:mb-8 max-w-xl">
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
                Ready to start your Guitar Cafe journey?
              </h2>
            )}
          </div>

          {isFilled.richText(primary.description) && (
            <div
              className={cn(
                bodyTypo.className,
                'leading-relaxed max-w-xl mb-6 [&_p]:mb-3 [&_p:last-child]:mb-0'
              )}
              style={bodyTypo.style}
            >
              <PrismicRichText field={primary.description} />
            </div>
          )}

          {checklist.length > 0 && (
            <ul className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-10">
              {checklist.map((text, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: listIconBg, color: listIconColor }}
                  >
                    {hasCustomListIcon ? (
                      <span className="relative w-4 h-4">
                        <PrismicNextImage
                          field={primary.list_icon}
                          fill
                          sizes="16px"
                          className="object-contain"
                          alt=""
                        />
                      </span>
                    ) : (
                      <CheckIcon />
                    )}
                  </span>
                  <span
                    className={cn(listFont.className, listSize)}
                    style={{
                      fontFamily: listFont.fontFamily,
                      color: listTextColor,
                    }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <CmsButton
            label={primary.button_label ?? 'Learn more'}
            link={primary.button_link}
            font={primary.button_font}
            radius={primary.button_radius}
            bg={btnBg}
            textColor={btnText}
            borderColor={isFilledButton ? btnBg : btnText}
            hoverBg={
              primary.button_hover_background_color ||
              (isFilledButton ? '#000000' : '#1c1917')
            }
            hoverText={primary.button_hover_text_color || '#ffffff'}
            showArrow={primary.button_show_arrow === true}
          />
        </div>
      </div>
    </section>
  );
};

export default ImageChecklist;
