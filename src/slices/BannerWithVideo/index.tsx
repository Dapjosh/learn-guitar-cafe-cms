'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps, PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { VideoPlayer } from '@lgc_cms/features';
import { SplitWithVideo } from './SplitWithVideo';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  cn,
} from '@lgc_cms/util';

/**
 * Props for `BannerWithVideo`.
 */
export type BannerWithVideoProps =
  SliceComponentProps<Content.HeroWithVideoSlice>;

/**
 * Component for "BannerWithVideo" Slices.
 */
const BannerWithVideo: FC<BannerWithVideoProps> = ({ slice }) => {
  // Cast so the check compiles whether or not prismicio-types.d.ts includes the variation yet
  if ((slice.variation as string) === 'splitWithVideo') {
    return <SplitWithVideo slice={slice} />;
  }

  // Background styling from CMS (both for outer bigger box and inner container)
  const hasBgImage = isFilled.image(slice.primary.background_image);
  const containerBgColor = slice.primary.background_color || '#f4eee5';
  const outerBgColor =
    (slice.primary as any).outer_background_color || containerBgColor;

  // Spacing between outer and inner box (configurable presets or custom px)
  const presetSpacing =
    (slice.primary as any).box_spacing || 'Default (Medium)';
  const customSpacing = (slice.primary as any).box_spacing_custom;
  const customSpacingY = (slice.primary as any).box_spacing_y;
  const customSpacingX = (slice.primary as any).box_spacing_x;

  let spacingY = 24;
  let spacingX = 24;
  let isCustomSpacing = false;

  const presetLower = String(presetSpacing).toLowerCase();
  if (presetLower.includes('none') || presetLower.includes('0')) {
    spacingY = 0;
    spacingX = 0;
    isCustomSpacing = true;
  } else if (presetLower.includes('small') || presetLower.includes('12')) {
    spacingY = 12;
    spacingX = 12;
    isCustomSpacing = true;
  } else if (presetLower.includes('extra large') || presetLower.includes('64')) {
    spacingY = 64;
    spacingX = 48;
    isCustomSpacing = true;
  } else if (presetLower.includes('large') || presetLower.includes('48')) {
    spacingY = 48;
    spacingX = 36;
    isCustomSpacing = true;
  } else if (presetLower.includes('medium') || presetLower.includes('24')) {
    spacingY = 24;
    spacingX = 24;
    isCustomSpacing = true;
  }

  // Exact number overrides (if entered, they override the preset)
  if (typeof customSpacing === 'number' && customSpacing >= 0) {
    spacingY = customSpacing;
    spacingX = customSpacing;
    isCustomSpacing = true;
  }
  if (typeof customSpacingY === 'number' && customSpacingY >= 0) {
    spacingY = customSpacingY;
    isCustomSpacing = true;
  }
  if (typeof customSpacingX === 'number' && customSpacingX >= 0) {
    spacingX = customSpacingX;
    isCustomSpacing = true;
  }

  const isFlush = isCustomSpacing && spacingX === 0 && spacingY === 0;

  // Background image opacity from CMS (supports 0 - 100 percentage or 0 - 1 decimal)
  const rawOpacity =
    (slice.primary as any).background_image_opacity ??
    (slice.primary as any).background_opacity;
  const bgOpacity = isFilled.number(rawOpacity)
    ? rawOpacity > 1
      ? Math.min(Math.max(rawOpacity / 100, 0), 1)
      : Math.max(rawOpacity, 0)
    : 1;

  // Video URL resolution & provider detection for VideoPlayer component
  const rawVideo = (slice.primary.video_url || {}) as any;
  const embedUrl =
    rawVideo.embed_url ||
    rawVideo.url ||
    (typeof slice.primary.video_url === 'string'
      ? slice.primary.video_url
      : '') ||
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  const providerName: 'YouTube' | 'Vimeo' =
    rawVideo.provider_name === 'Vimeo' || embedUrl.includes('vimeo')
      ? 'Vimeo'
      : 'YouTube';

  const thumbnailImage = isFilled.image(slice.primary.video_thumbnail)
    ? slice.primary.video_thumbnail
    : ({
        url: '/images/banner-video-thumb.jpg',
        alt: 'Video preview',
        dimensions: { width: 718, height: 404 },
      } as any);

  // Video Meta (Featured badge & video description)
  const metaItem = slice.primary.video_meta?.[0];
  const isFeatured = metaItem?.featured ?? true;
  const videoDescription =
    metaItem?.video_description || 'Introduction to slide & roots guitar';

  // Customizable typography from CMS (size, font, weight, color)
  // Defaults to Fraunces Regular for headings, Inter Tight Regular for body
  const headingTypo = resolveHeadingTypography({
    size: (slice.primary as any).title_size,
    font: (slice.primary as any).title_font,
    weight: (slice.primary as any).title_weight,
    color: (slice.primary as any).title_color,
    fallbackFont: 'Fraunces',
    fallbackSize: 'Large',
    fallbackWeight: 'Normal',
    fallbackColor: '#000000',
  });

  const isAnton = (slice.primary as any).title_font?.toLowerCase() === 'anton';

  const bodyTypo = resolveBodyTypography({
    size: (slice.primary as any).description_size,
    font: (slice.primary as any).description_font,
    weight: (slice.primary as any).description_weight,
    color: (slice.primary as any).description_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackWeight: 'Normal',
    fallbackColor: '#000000',
  });

  // RichText serializer for title to ensure styling, customizable weight,
  // and color highlights for words formatted with Bold (strong) or Italic (em) in the CMS
  const titleComponents = {
    heading1: ({ children }: any) => {
      // If editor typed text without bold/italic spans, automatically highlight 'TUNINGS'
      let content = children;
      if (
        Array.isArray(children) &&
        children.length === 1 &&
        typeof children[0] === 'string'
      ) {
        const text = children[0];
        const parts = text.split(/(TUNINGS)/i);
        if (parts.length > 1) {
          content = parts.map((part, idx) =>
            part.toUpperCase() === 'TUNINGS' ? (
              <span key={idx} className="text-[#d85d18]">
                {part}
              </span>
            ) : (
              <span key={idx}>{part}</span>
            )
          );
        }
      }

      return (
        <h1
          className={cn(
            headingTypo.className,
            'uppercase',
            !isAnton && 'tracking-[-0.03em] leading-[1.05]'
          )}
          style={headingTypo.style}
        >
          {content}
        </h1>
      );
    },
    heading2: ({ children }: any) => (
      <h2
        className={cn(
          headingTypo.className,
          'uppercase',
          !isAnton && 'tracking-[-0.03em] leading-[1.05]'
        )}
        style={headingTypo.style}
      >
        {children}
      </h2>
    ),
    heading3: ({ children }: any) => (
      <h3
        className={cn(
          headingTypo.className,
          'uppercase',
          !isAnton && 'tracking-[-0.03em] leading-[1.05]'
        )}
        style={headingTypo.style}
      >
        {children}
      </h3>
    ),
    paragraph: ({ children }: any) => (
      <p
        className={cn(
          headingTypo.className,
          'uppercase',
          !isAnton && 'tracking-[-0.03em] leading-[1.05]'
        )}
        style={headingTypo.style}
      >
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <span className="text-[#d85d18]">{children}</span>
    ),
    em: ({ children }: any) => (
      <span className="text-[#d85d18]">{children}</span>
    ),
  };

  // RichText serializer for description (customizable font, size, and color)
  const descriptionComponents = {
    paragraph: ({ children }: any) => (
      <p
        className={cn(
          bodyTypo.className,
          'leading-relaxed max-w-xl mx-auto mb-3 last:mb-0'
        )}
        style={bodyTypo.style}
      >
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    hyperlink: ({ node, children }: any) => (
      <PrismicNextLink
        field={node.data}
        className="text-[#d85d18] underline underline-offset-4 hover:text-[#c04f12] transition-colors"
      >
        {children}
      </PrismicNextLink>
    ),
  };

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(
        'relative w-full font-sans transition-all duration-200',
        !isCustomSpacing && 'px-3 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-6'
      )}
      style={{
        backgroundColor: outerBgColor,
        ...(isCustomSpacing
          ? {
              paddingTop: `${spacingY}px`,
              paddingBottom: `${spacingY}px`,
              paddingLeft: `${spacingX}px`,
              paddingRight: `${spacingX}px`,
            }
          : {}),
      }}
    >
      {/* Inner Container inside the bigger box */}
      <div
        className={cn(
          'relative max-w-[1380px] mx-auto overflow-hidden shadow sm:pt-15 md:pt-16 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 transition-all duration-200',
          isFlush
            ? 'rounded-none'
            : 'rounded-lg sm:rounded-md lg:rounded-[10px]',
          !isCustomSpacing && 'mt-5 mb-5'
        )}
        style={{ backgroundColor: containerBgColor }}
      >
        {/* Background layer (editable from CMS with fallback) inside container */}
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
          style={{ opacity: bgOpacity }}
        >
          {hasBgImage ? (
            <PrismicNextImage
              field={slice.primary.background_image}
              fill
              className="object-cover object-center"
              alt=""
              priority
            />
          ) : (
            <Image
              src="/images/banner-video-bg.jpg"
              fill
              className="object-cover object-center"
              alt=""
              priority
            />
          )}
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-5xl mt-20 mx-auto flex flex-col items-center text-center">
          {/* Badge Pill */}
          {slice.primary.badge_text && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#d85d18]">
              {/* Vintage circular icon */}
              <svg
                className="w-3.5 h-3.5 text-[#d85d18] shrink-0"
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
              <span>{slice.primary.badge_text}</span>
            </div>
          )}

          {/* Title */}
          <div className="mb-4 sm:mb-5 max-w-4xl">
            {isFilled.richText(slice.primary.title) ? (
              <PrismicRichText
                field={slice.primary.title}
                components={titleComponents}
              />
            ) : (
              <h1
                className={cn(
                  headingTypo.className,
                  'uppercase',
                  !isAnton && 'tracking-[-0.03em] leading-[1.05]'
                )}
                style={headingTypo.style}
              >
                SLIDE GUITAR & OPEN{' '}
                <span className="text-[#d85d18]">TUNINGS</span>
              </h1>
            )}
          </div>

          {/* Description (Customizable from CMS, matching screenshot proportions) */}
          <div className="mb-6 sm:mb-8 max-w-xl mx-auto text-center">
            {isFilled.richText(slice.primary.description) ? (
              <PrismicRichText
                field={slice.primary.description}
                components={descriptionComponents}
              />
            ) : (
              <p
                className={cn(
                  bodyTypo.className,
                  'leading-relaxed max-w-xl mx-auto'
                )}
                style={bodyTypo.style}
              >
                Step-by-step masterclasses to help you play the music you love,
                with tone and feel that sound like the record.
              </p>
            )}
          </div>

          {/* CTA Button */}
          {(() => {
            const ctaField = slice.primary.primary_cta;
            const buttonText =
              (ctaField as any)?.text ||
              (slice.primary as any)?.button_text ||
              'Explore the lessons';
            const isLinkFilled = isFilled.link(ctaField);

            return (
              <div className="mb-8 md:mb-12">
                {isLinkFilled ? (
                  <PrismicNextLink
                    field={ctaField}
                    className="inline-flex items-center justify-center rounded-lg bg-[#d85d18] hover:bg-[#c04f12] active:bg-[#a8430e] px-7 py-3 text-sm sm:text-base font-medium font-inter-tight text-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d85d18] focus:ring-offset-2"
                  >
                    {buttonText}
                  </PrismicNextLink>
                ) : (
                  <Link
                    href={(ctaField as any)?.url || '#courses'}
                    className="inline-flex items-center justify-center rounded-lg bg-[#d85d18] hover:bg-[#c04f12] active:bg-[#a8430e] px-7 py-3 text-sm sm:text-base font-medium font-inter-tight text-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d85d18] focus:ring-offset-2"
                  >
                    {buttonText}
                  </Link>
                )}
              </div>
            );
          })()}

          {/* Video Player Card using codebase VideoPlayer component */}
          <div className="relative w-full max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/25 border border-black/10 bg-black group">
            <VideoPlayer
              id={rawVideo.id || 'banner-video'}
              title={rawVideo.title || 'Featured Lesson Video'}
              provider_name={providerName}
              embed_url={embedUrl}
              image={thumbnailImage}
              html={rawVideo.html || ''}
              loading="lazy"
              width={944}
              height={531}
              {...rawVideo}
            />

            {/* Bottom-left Featured Video Meta */}
            {(isFeatured || videoDescription) && (
              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-30 flex items-center gap-2.5 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white/90 border border-white/10 shadow-lg pointer-events-none">
                {isFeatured && (
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <svg
                      className="w-3.5 h-3.5 text-[#d85d18] shrink-0"
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
                    Featured
                  </span>
                )}
                {isFeatured && videoDescription && (
                  <span className="text-white/40">|</span>
                )}
                {videoDescription && (
                  <span className="text-white/85 font-normal">
                    {videoDescription}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerWithVideo;
