'use client';

import React, { useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  cn,
} from '@lgc_cms/util';
import {
  BadgePill,
  CmsButton,
  CmsMarquee,
  resolveOpacity,
  resolveRadiusClass,
} from '../ContentImageSlice/shared';

import type { JSX } from 'react';

const videoAspectClasses: Record<string, string> = {
  'near square': 'aspect-[4/3.5]',
  landscape: 'aspect-[16/9]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};

/**
 * Turns a YouTube / Vimeo URL (or an uploaded video file) into something playable.
 * Returns an autoplaying embed URL for iframes, or a file URL for <video>.
 */
function resolveVideo(field: any): { kind: 'iframe' | 'file'; src: string } | null {
  const raw: string = field?.embed_url || field?.url || (typeof field === 'string' ? field : '') || '';
  if (!raw) return null;

  const yt = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) {
    return {
      kind: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    };
  }

  const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&title=0&byline=0` };
  }

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(raw)) {
    return { kind: 'file', src: raw };
  }

  return null;
}

/**
 * "Split With Video" variation of BannerWithVideo:
 * textured hero box with badge, title (bold/italic words highlighted), description
 * and CTA on one side, a video card with play button and caption on the other,
 * and a scrolling marquee strip underneath.
 */
export const SplitWithVideo = ({ slice }: { slice: any }): JSX.Element => {
  const primary = (slice?.primary || {}) as any;
  const [playing, setPlaying] = useState(false);

  // ---- Backgrounds ----
  const outerBg = primary.outer_background_color || '#f3efe6';
  const containerBg = primary.background_color || '#ede5d8';
  const containerBorder = primary.container_border_color || 'rgba(28, 25, 23, 0.06)';
  const bgOpacity = resolveOpacity(primary.background_image_opacity, 1);
  const hasBgImage = isFilled.image(primary.background_image);

  // ---- Typography ----
  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    weight: primary.title_weight,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Extra Large',
    fallbackColor: '#1c1917',
  });
  const highlightColor = primary.title_highlight_color || '#d85d18';
  const headingClass = cn(headingTypo.className, 'uppercase tracking-tight leading-[0.95]');
  const bodyTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    weight: primary.description_weight,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#1c1917',
  });

  // Bold or italic words in the title are shown in the highlight colour
  const highlight = ({ children }: any) => <span style={{ color: highlightColor }}>{children}</span>;
  const titleComponents = {
    heading1: ({ children }: any) => (
      <h1 className={headingClass} style={headingTypo.style}>
        {children}
      </h1>
    ),
    heading2: ({ children }: any) => (
      <h2 className={headingClass} style={headingTypo.style}>
        {children}
      </h2>
    ),
    strong: highlight,
    em: highlight,
  };

  // ---- Button (label from the CTA link's text, or button_label) ----
  const cta = primary.primary_cta;
  const ctaLabel = cta?.text || primary.button_label || 'Explore the lessons';
  const btnBg = primary.button_background_color || '#d85d18';

  // ---- Video ----
  const video = resolveVideo(primary.video_url);
  const videoOnLeft = primary.video_position === 'Left';
  const aspect =
    videoAspectClasses[String(primary.video_aspect_ratio || 'Near Square').toLowerCase()] ||
    videoAspectClasses['near square'];
  const videoRadius = resolveRadiusClass(primary.video_radius, 'rounded-[10px]');
  const showCaption = primary.show_video_caption !== false;
  const featuredLabel = primary.video_featured_label ?? 'Featured';
  const caption = primary.video_caption || 'Introduction to slide & roots guitar';
  const captionAccent = primary.video_caption_accent_color || '#d85d18';

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4 font-sans"
      style={{ backgroundColor: outerBg }}
    >
      <div className="max-w-[1392px] mx-auto">
        {/* Hero box */}
        <div
          className="relative overflow-hidden rounded-[10px] border"
          style={{ backgroundColor: containerBg, borderColor: containerBorder }}
        >
          {/* Background illustration (optional) */}
          {hasBgImage && (
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: bgOpacity }}>
              <PrismicNextImage
                field={primary.background_image}
                fill
                sizes="100vw"
                className="object-cover object-center"
                alt=""
                priority
              />
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12 xl:gap-16 px-5 sm:px-10 lg:px-14 xl:px-[100px] py-12 sm:py-16 lg:py-16">
            {/* Content */}
            <div className={cn('flex flex-col items-start text-left', videoOnLeft && 'lg:order-2')}>
              <BadgePill
                text={primary.badge_text || 'Online guitar lessons with Paul Greig'}
                icon={primary.badge_icon}
                bg={primary.badge_bg_color || '#ffffff'}
                textColor={primary.badge_text_color || '#d85d18'}
                iconColor={primary.badge_icon_color}
                borderColor={primary.badge_border_color}
                className="mb-5 sm:mb-6"
              />

              <div className="mb-5 sm:mb-6">
                {isFilled.richText(primary.title) ? (
                  <PrismicRichText field={primary.title} components={titleComponents} />
                ) : (
                  <h1 className={headingClass} style={headingTypo.style}>
                    Slide guitar
                    <br />
                    &amp; open <span style={{ color: highlightColor }}>tunings</span>
                  </h1>
                )}
              </div>

              <div
                className={cn(bodyTypo.className, 'leading-relaxed max-w-md mb-8 [&_p]:mb-3 [&_p:last-child]:mb-0')}
                style={bodyTypo.style}
              >
                {isFilled.richText(primary.description) ? (
                  <PrismicRichText field={primary.description} />
                ) : (
                  <p>
                    Step-by-step masterclasses to help you play the music you love, with tone and feel that sound like
                    the record.
                  </p>
                )}
              </div>

              <CmsButton
                label={ctaLabel}
                link={isFilled.link(cta) ? cta : { link_type: 'Web', url: '/all-courses' }}
                font={primary.button_font}
                radius={primary.button_radius}
                bg={btnBg}
                textColor={primary.button_text_color || '#ffffff'}
                borderColor={btnBg}
                hoverBg={primary.button_hover_background_color || '#b94c10'}
                hoverText={primary.button_hover_text_color || '#ffffff'}
                showArrow={primary.button_show_arrow === true}
              />
            </div>

            {/* Video card */}
            <div className={cn('w-full', videoOnLeft && 'lg:order-1')}>
              <div
                className={cn(
                  'relative w-full overflow-hidden border bg-black shadow-[0_20px_50px_-20px_rgba(28,25,23,0.5)]',
                  aspect,
                  videoRadius
                )}
                style={{ borderColor: primary.video_border_color || '#1c1917' }}
              >
                {playing && video ? (
                  video.kind === 'iframe' ? (
                    <iframe
                      src={video.src}
                      title={caption || 'Featured video'}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    />
                  ) : (
                    <video src={video.src} className="absolute inset-0 w-full h-full object-cover" controls autoPlay playsInline />
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    disabled={!video}
                    aria-label={video ? `Play video: ${caption}` : 'Video coming soon'}
                    className="group absolute inset-0 w-full h-full text-left disabled:cursor-default focus:outline-none"
                  >
                    {isFilled.image(primary.video_thumbnail) ? (
                      <PrismicNextImage
                        field={primary.video_thumbnail}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                        alt=""
                        priority
                      />
                    ) : (
                      // No thumbnail yet: plain dark card
                      <span className="absolute inset-0 bg-gradient-to-br from-[#3a332e] to-[#1c1917]" aria-hidden="true" />
                    )}

                    {/* Play button */}
                    {video && primary.show_play_button !== false && (
                      <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white"
                        style={{
                          backgroundColor: primary.play_button_bg_color || 'rgba(255, 255, 255, 0.22)',
                          borderColor: 'rgba(255, 255, 255, 0.6)',
                          color: primary.play_button_icon_color || '#ffffff',
                        }}
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                          <path d="M7 4.5v15l12-7.5z" />
                        </svg>
                      </span>
                    )}

                    {/* Caption */}
                    {showCaption && (featuredLabel || caption) && (
                      <span className="absolute left-4 right-4 bottom-4 sm:left-8 sm:bottom-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-white">
                        {featuredLabel && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5">
                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: captionAccent }}>
                              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                              <circle cx="8" cy="8" r="3" fill="currentColor" />
                            </svg>
                            {featuredLabel}
                          </span>
                        )}
                        {caption && <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{caption}</span>}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        {primary.show_marquee !== false && (
          <CmsMarquee
            primary={primary}
            className={cn('mt-3 sm:mt-6', resolveRadiusClass(primary.marquee_radius, 'rounded-[6px]'))}
          />
        )}
      </div>
    </section>
  );
};

export default SplitWithVideo;
