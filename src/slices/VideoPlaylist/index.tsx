'use client';

import React, { useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';
import {
  autoThumbnail,
  embedUrl,
  parseVideoSource,
  urlFromField,
  type VideoSource,
} from '@components/media/media-utils';

import type { JSX } from 'react';

/**
 * Props for `VideoPlaylist`.
 */
export type VideoPlaylistProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

type Clip = { title: string; duration: string; source: VideoSource | null; thumbnail: any; autoThumb: string | null };

const sampleClips: Clip[] = [
  ['How High the Moon, live 1951', '3:45'],
  ['Lover (When You’re Near Me)', '2:52'],
  ['Vaya con Dios, TV session 1953', '3:12'],
  ['Workshop: inside the Log', '14:21'],
].map(([title, duration]) => ({ title, duration, source: null, thumbnail: null, autoThumb: null }));

/**
 * Component for "VideoPlaylist" Slices: a curated list of clips next to a player.
 * Clips can be Bunny Stream, YouTube or Vimeo links, or uploaded video files.
 */
const VideoPlaylist = ({ slice, context }: VideoPlaylistProps): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  // Inside a blog post: no section padding/background, fill the article column
  const inPost = !!context?.inPost;

  const cmsClips: Clip[] = (Array.isArray(primary.videos) ? primary.videos : [])
    .map((v: any) => {
      const source = parseVideoSource(urlFromField(v?.video));
      return {
        title: v?.title || 'Untitled clip',
        duration: v?.duration || '',
        source,
        thumbnail: isFilled.image(v?.thumbnail) ? v.thumbnail : null,
        autoThumb: autoThumbnail(source),
      };
    })
    .filter((c: Clip) => c.source);
  const clips = cmsClips.length > 0 ? cmsClips : process.env.NODE_ENV === 'production' ? [] : sampleClips;

  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false); // autoplay only after a visitor picks a clip

  if (clips.length === 0) return null;
  const current = clips[Math.min(active, clips.length - 1)];

  const c = {
    sectionBg: primary.section_bg_color || 'transparent',
    title: primary.title_color || '#1c1917',
    meta: primary.meta_color || '#78716c',
    text: primary.text_color || '#57534e',
    activeBg: primary.active_clip_bg_color || '#ebe4d8',
    accent: primary.accent_color || '#d85d18',
    clipTitle: primary.clip_title_color || '#1c1917',
    playerBg: primary.player_bg_color || '#1c1917',
  };
  const titleFont = resolveFontFamily(primary.title_font, 'Fraunces');
  const listOnRight = primary.list_position === 'Right';
  const nowPlaying = primary.now_playing_label || 'Now playing';

  const select = (i: number) => {
    setActive(i);
    setStarted(true);
  };

  const player = (() => {
    const src = current.source;
    if (!src) {
      return <span className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Add a video link to this clip</span>;
    }
    if (src.provider === 'file') {
      return (
        <video
          key={src.url}
          src={src.url}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          controls
          playsInline
          autoPlay={started}
          poster={current.thumbnail?.url || undefined}
        />
      );
    }
    return (
      <iframe
        key={`${src.url}-${started}`}
        src={embedUrl(src, { autoplay: started }) || undefined}
        title={current.title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        loading="lazy"
      />
    );
  })();

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full font-sans', !inPost && 'px-4 sm:px-6 lg:px-8 py-10 sm:py-14')}
      style={{ backgroundColor: inPost ? undefined : c.sectionBg }}
    >
      <div className={cn('mx-auto', inPost ? 'w-full' : primary.width === 'Wide' ? 'max-w-[1380px]' : 'max-w-[1100px]')}>
        {/* Header */}
        {(primary.title || isFilled.richText(primary.description) || primary.meta_line) && (
          <div className="mb-6 sm:mb-8 max-w-3xl">
            {primary.title && (
              <h2 className={cn(titleFont.className, 'text-[1.75rem] sm:text-[2.25rem] leading-tight tracking-[-0.01em]')} style={{ fontFamily: titleFont.fontFamily, color: c.title }}>
                {primary.title}
              </h2>
            )}
            {primary.meta_line && (
              <p className="mt-2 text-sm" style={{ color: c.meta }}>
                {primary.meta_line}
              </p>
            )}
            {isFilled.richText(primary.description) && (
              <div className="mt-4 text-[1rem] sm:text-[1.0625rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0" style={{ color: c.text }}>
                <PrismicRichText field={primary.description} />
              </div>
            )}
          </div>
        )}

        <div className={cn('grid grid-cols-1 gap-5 items-start', !inPost && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-6')}>
          {/* Player */}
          <div className={cn(!inPost && 'lg:order-2', !inPost && listOnRight && 'lg:order-1')}>
            <div className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden" style={{ backgroundColor: c.playerBg }}>
              {player}
            </div>
            <p className={cn('mt-3 text-sm', !inPost && 'lg:hidden')} style={{ color: c.clipTitle }}>
              <span style={{ color: c.accent }}>{nowPlaying}:</span> {current.title}
            </p>
          </div>

          {/* Clip list */}
          <div className={cn(!inPost && 'lg:order-1', !inPost && listOnRight && 'lg:order-2')}>
            <div className="flex items-baseline justify-between mb-3 text-sm">
              <span style={{ color: c.clipTitle }}>{primary.list_label || 'Curated clips'}</span>
              {primary.show_count !== false && (
                <span style={{ color: c.meta }}>
                  {clips.length} {clips.length === 1 ? 'video' : 'videos'}
                </span>
              )}
            </div>
            <ul className={cn('flex flex-col gap-1.5', !inPost && 'lg:max-h-[420px] lg:overflow-y-auto lg:pr-1')}>
              {clips.map((clip, i) => {
                const isActive = i === active;
                const thumb = clip.thumbnail;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-current={isActive ? 'true' : undefined}
                      className="w-full flex items-center gap-3 rounded-[8px] p-2 text-left transition-colors hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                      style={isActive ? { backgroundColor: c.activeBg } : undefined}
                    >
                      <span className="relative shrink-0 w-24 sm:w-28 aspect-[16/9] rounded-[4px] overflow-hidden bg-[#2b2522]">
                        {thumb ? (
                          <PrismicNextImage field={thumb} fill sizes="112px" className="object-cover" alt="" />
                        ) : clip.autoThumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={clip.autoThumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-snug truncate" style={{ color: c.clipTitle }}>
                          {clip.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: isActive ? c.accent : c.meta }}>
                          {isActive && (
                            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor" aria-hidden="true">
                              <path d="M4 2.5v11l9-5.5z" />
                            </svg>
                          )}
                          {isActive ? [nowPlaying, clip.duration].filter(Boolean).join(' · ') : clip.duration}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPlaylist;
