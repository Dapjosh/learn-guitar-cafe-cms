'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps, PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { Play } from 'lucide-react';

// Dynamically import ReactPlayer to avoid SSR hydration issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

/**
 * Props for `BannerWithVideo`.
 */
export type BannerWithVideoProps =
  SliceComponentProps<Content.HeroWithVideoSlice>;

/**
 * Component for "BannerWithVideo" Slices.
 */
const BannerWithVideo: FC<BannerWithVideoProps> = ({ slice }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Background styling from CMS
  const hasBgImage = isFilled.image(slice.primary.background_image);
  const bgColor = slice.primary.background_color || '#f4eee5';

  // Video URL resolution
  const videoUrl =
    (slice.primary.video_url as { url?: string })?.url ||
    (typeof slice.primary.video_url === 'string'
      ? slice.primary.video_url
      : '');

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

        {/* Video Player Card */}
        <div className="relative w-full max-w-4xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/25 border border-black/10 bg-black flex items-center justify-center group">
          {isPlaying && videoUrl ? (
            // Active video playback
            (() => {
              if (videoUrl.includes('mediadelivery.net')) {
                return (
                  <iframe
                    src={
                      videoUrl.includes('?')
                        ? `${videoUrl}&autoplay=true`
                        : `${videoUrl}?autoplay=true`
                    }
                    loading="lazy"
                    className="absolute inset-0 w-full h-full border-0 z-20"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                  />
                );
              }

              return (
                <ReactPlayer
                  url={videoUrl}
                  className="absolute inset-0 z-20"
                  width="100%"
                  height="100%"
                  playing={true}
                  controls={true}
                />
              );
            })()
          ) : (
            // Thumbnail poster and play button
            <>
              {isFilled.image(slice.primary.video_thumbnail) ? (
                <PrismicNextImage
                  field={slice.primary.video_thumbnail}
                  fill
                  className="object-cover object-center"
                  alt=""
                  priority
                />
              ) : (
                <Image
                  src="/images/banner-video-thumb.jpg"
                  fill
                  className="object-cover object-center"
                  alt="Video preview"
                  priority
                />
              )}

              {/* Subtle vintage vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Center Play Button */}
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Play video"
                className="group/btn relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-white/80 text-white translate-x-0.5 transition-transform group-hover/btn:scale-110" />
              </button>

              {/* Bottom-left Featured Video Meta */}
              {(isFeatured || videoDescription) && (
                <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 flex items-center gap-2.5 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white/90 border border-white/10 shadow-lg pointer-events-none">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannerWithVideo;
