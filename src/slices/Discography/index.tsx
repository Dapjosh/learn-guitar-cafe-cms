import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { resolveHeadingTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import { ButtonRow } from '@components/slice-ui/ButtonRow';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';
import { vinylBackground } from '@components/slice-ui/RingPortrait';

import type { JSX } from 'react';

/**
 * Props for `Discography`.
 */
export type DiscographyProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const desktopColumns: Record<string, string> = {
  '3': 'lg:grid-cols-3',
  '4': 'lg:grid-cols-4',
  '5': 'lg:grid-cols-4 xl:grid-cols-5',
};

/**
 * Component for "Discography" Slices: album covers with a vinyl record peeking out,
 * title and credits under each, centred header and streaming buttons.
 */
const Discography = ({ slice }: DiscographyProps): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  const albums = (Array.isArray(primary.albums) ? primary.albums : []).filter((a: any) => a?.title || isFilled.image(a?.cover));
  if (albums.length === 0 && process.env.NODE_ENV === 'production') return null;

  const isCentered = String(primary.header_alignment || 'Center').toLowerCase() === 'center';
  const showVinyl = primary.show_vinyl !== false;
  const columns = desktopColumns[String(primary.columns || '4')] || desktopColumns['4'];

  const c = {
    sectionBg: primary.section_bg_color || '#1c1917',
    albumTitle: primary.album_title_color || '#f3efe6',
    meta: primary.meta_color || '#a8a29e',
    vinyl: primary.vinyl_color || '#151210',
    groove: primary.vinyl_groove_color || 'rgba(255, 255, 255, 0.07)',
    label: primary.vinyl_label_color || '#d85d18',
    coverBorder: primary.cover_border_color || 'transparent',
  };

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#f3efe6',
  });
  const titleClass = cn(titleTypo.className, 'uppercase tracking-tight leading-[1.05]');
  const albumFont = resolveFontFamily(primary.album_title_font, 'Inter Tight');

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full overflow-hidden px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className={cn('flex flex-col mb-10 sm:mb-14', isCentered ? 'items-center text-center max-w-3xl mx-auto' : 'items-start text-left max-w-3xl')}>
          <BadgePill
            text={primary.badge_text}
            icon={primary.badge_icon}
            preset={primary.badge_icon_preset || 'Trophy'}
            bg={primary.badge_bg_color || 'rgba(255, 255, 255, 0.07)'}
            textColor={primary.badge_text_color || '#e07b39'}
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
              Selected recordings &amp; releases
            </h2>
          )}
          {isFilled.richText(primary.description) && (
            <div className="mt-4 max-w-2xl text-[1rem] sm:text-[1.0625rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0" style={{ color: c.meta }}>
              <PrismicRichText field={primary.description} />
            </div>
          )}
        </div>

        {/* Albums */}
        <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12', columns)}>
          {albums.map((album: any, i: number) => {
            const linked = isFilled.link(album.link);
            const card = (
              <>
                <span className="relative block w-full pr-[14%]">
                  {/* Vinyl peeking out from behind the cover */}
                  {showVinyl && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute top-[5%] right-0 h-[90%] aspect-[1/1] rounded-full transition-transform duration-500 ease-out',
                        linked && 'group-hover:translate-x-[8%]'
                      )}
                      style={{ background: vinylBackground(c.vinyl, c.groove) }}
                    >
                      <span className="absolute inset-[34%] rounded-full" style={{ backgroundColor: c.label }} />
                      <span className="absolute inset-[47%] rounded-full" style={{ backgroundColor: c.vinyl }} />
                    </span>
                  )}
                  <span
                    className="relative block w-full aspect-[1/1] overflow-hidden rounded-[3px] border shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] bg-[#2b2522]"
                    style={{ borderColor: c.coverBorder }}
                  >
                    {isFilled.image(album.cover) && (
                      <PrismicNextImage
                        field={album.cover}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 300px"
                        className={cn('object-cover', linked && 'transition-transform duration-500 group-hover:scale-[1.03]')}
                      />
                    )}
                  </span>
                </span>
                <span className="block mt-4 sm:mt-6 pr-[14%]">
                  <span
                    className={cn(albumFont.className, 'block text-[1rem] sm:text-[1.25rem] lg:text-[1.375rem] leading-tight tracking-[-0.01em]', linked && 'group-hover:underline underline-offset-4 decoration-1')}
                    style={{ fontFamily: albumFont.fontFamily, color: c.albumTitle }}
                  >
                    {album.title}
                  </span>
                  {album.meta && (
                    <span className="block mt-1.5 text-xs sm:text-sm leading-snug" style={{ color: c.meta }}>
                      {album.meta}
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <li key={i}>
                {linked ? (
                  <PrismicNextLink field={album.link} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-sm" style={{ '--tw-ring-offset-color': c.sectionBg } as React.CSSProperties}>
                    {card}
                  </PrismicNextLink>
                ) : (
                  <div className="block">{card}</div>
                )}
              </li>
            );
          })}
        </ul>

        <ButtonRow
          className={cn('mt-12 sm:mt-14', isCentered && 'justify-center')}
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
    </section>
  );
};

export default Discography;
