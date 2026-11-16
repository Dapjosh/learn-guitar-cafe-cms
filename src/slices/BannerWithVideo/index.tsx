'use client';

import { FC } from 'react';
import Image from 'next/image';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps, PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { VideoPlayer } from '@lgc_cms/features';

/**
 * Props for `BannerWithVideo`.
 */
export type BannerWithVideoProps =
  SliceComponentProps<Content.HeroWithVideoSlice>;

/**
 * Component for "BannerWithVideo" Slices.
 */
const BannerWithVideo: FC<BannerWithVideoProps> = ({ slice }) => {
  // Background styling from CMS
  const hasBgImage = isFilled.image(slice.primary.background_image);
  const bgColor = slice.primary.background_color || '#f4eee5';

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

  // RichText serializer for heading to highlight emphasized/strong words or 'TUNINGS'
  const richTextComponents = {
    heading1: ({ children }: any) => {
      // If no strong/em element is present in children, automatically highlight 'TUNINGS'
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
              part
            )
          );
        }
      }

      return (
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase tracking-tight text-gray-900 leading-[1.05]">
          {content}
        </h1>
      );
    },
    strong: ({ children }: any) => (
      <span className="text-[#d85d18]">{children}</span>
    ),
    em: ({ children }: any) => (
      <span className="text-[#d85d18]">{children}</span>
    ),
    paragraph: ({ children }: any) => (
      <p className="text-base sm:text-lg md:text-xl text-[#4a4a4a] leading-relaxed">
        {children}
      </p>
    ),
  };

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 font-sans"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background layer (editable from CMS with fallback) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
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
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Badge Pill */}
        {slice.primary.badge_text && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#d85d18] shadow-sm border border-amber-900/10">
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
              components={richTextComponents}
            />
          ) : (
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase tracking-tight text-gray-900 leading-[1.05]">
              SLIDE GUITAR & OPEN{' '}
              <span className="text-[#d85d18]">TUNINGS</span>
            </h1>
          )}
        </div>

        {/* Description */}
        <div className="mb-6 sm:mb-8 max-w-2xl text-center">
          {isFilled.richText(slice.primary.description) ? (
            <PrismicRichText
              field={slice.primary.description}
              components={richTextComponents}
            />
          ) : (
            <p className="text-base sm:text-lg md:text-xl text-[#4a4a4a] leading-relaxed">
              Step-by-step masterclasses to help you play the music you love,
              with tone and feel that sound like the record.
            </p>
          )}
        </div>

        {/* CTA Button */}
        {isFilled.link(slice.primary.primary_cta) && (
          <div className="mb-8 md:mb-12">
            <PrismicNextLink
              field={slice.primary.primary_cta}
              className="inline-flex items-center justify-center rounded-lg bg-[#d85d18] hover:bg-[#c04f12] active:bg-[#a8430e] px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d85d18] focus:ring-offset-2"
            >
              {slice.primary.primary_cta.text || 'Explore the lessons'}
            </PrismicNextLink>
          </div>
        )}

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
    </section>
  );
};

export default BannerWithVideo;
