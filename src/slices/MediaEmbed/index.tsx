import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { resolveFontFamily, cn } from '@lgc_cms/util';
import { embedUrl, parseVideoSource, urlFromField } from '@components/media/media-utils';
import { alignClasses, sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';
import { AudioTrack } from '../MediaStudyCard/AudioTrack';

import type { JSX } from 'react';

/**
 * Props for `MediaEmbed`.
 */
export type MediaEmbedProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const AUDIO_FILE = /\.(mp3|wav|m4a|aac|ogg|oga|flac)(\?|#|$)/i;

const aspects: Record<string, string> = {
  landscape: 'aspect-[16/9]',
  classic: 'aspect-[4/3]',
  square: 'aspect-[1/1]',
  vertical: 'aspect-[9/16]',
  cinema: 'aspect-[21/9]',
};

const widths: Record<string, string> = {
  small: 'max-w-[480px]',
  medium: 'max-w-[720px]',
  large: 'max-w-[960px]',
  wide: 'max-w-[1200px]',
  full: 'max-w-none',
};

const radii: Record<string, string> = { none: 'rounded-none', small: 'rounded-[6px]', medium: 'rounded-[10px]', large: 'rounded-[16px]' };

/**
 * Component for "MediaEmbed" Slices: one video (YouTube, Bunny Stream, Vimeo or a video file)
 * or one audio file (e.g. an MP3 on Bunny), with optional title and caption. No chapters.
 */
const MediaEmbed = ({ slice, context }: MediaEmbedProps): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  const inPost = !!context?.inPost;
  const url = urlFromField(primary.media);

  const kindChoice = String(primary.media_type || 'Auto').toLowerCase();
  const isAudio = kindChoice === 'audio' || (kindChoice === 'auto' && AUDIO_FILE.test(url));
  const video = isAudio ? null : parseVideoSource(url);
  const isVertical = String(primary.aspect_ratio || '').toLowerCase() === 'vertical';

  if (!url || (!isAudio && !video)) {
    // Nothing playable: hint for editors in development, nothing for visitors
    if (process.env.NODE_ENV === 'production') return null;
    return (
      <p className="mx-auto max-w-[720px] px-4 py-6 text-sm text-[#a8a29e]">
        Media Embed: add a YouTube, Bunny, Vimeo, video file or MP3 link.
      </p>
    );
  }

  const align = alignClasses(primary.alignment || 'Center');
  const width = inPost ? 'max-w-none' : widths[String(primary.size || 'Medium').toLowerCase()] || widths.medium;
  const radius = radii[String(primary.corner_radius || 'Small').toLowerCase()] || radii.small;
  const titleFont = resolveFontFamily(primary.title_font, 'Fraunces');
  const autoplay = primary.autoplay === true;
  const loop = primary.loop === true;

  let player: React.ReactNode;
  if (isAudio) {
    player = (
      <div
        className={cn('border p-4 sm:p-5', radius)}
        style={{ backgroundColor: primary.audio_card_bg_color || '#fbf9f5', borderColor: primary.border_color || 'transparent' }}
      >
        <AudioTrack
          src={url}
          label={primary.audio_label || 'Listen'}
          note={primary.audio_note || null}
          chapters={[]}
          showWaveform={primary.show_waveform === true}
          showTempo={primary.show_tempo === true}
          minTempo={50}
          maxTempo={100}
          colors={{
            accent: primary.accent_color || '#d85d18',
            muted: primary.waveform_color || '#e9d2c2',
            text: primary.title_color || '#1c1917',
            meta: primary.caption_color || '#78716c',
            tabBorder: '#e2d9cb',
            buttonBg: primary.play_button_bg_color || '#1c1917',
            buttonIcon: primary.play_button_icon_color || '#ffffff',
            tempoBg: '#ebe4d8',
          }}
        />
      </div>
    );
  } else if (video!.provider === 'file') {
    player = (
      <div className={cn('relative w-full overflow-hidden border bg-black', radius, aspects[String(primary.aspect_ratio || 'Landscape').toLowerCase()] || aspects.landscape)} style={{ borderColor: primary.border_color || 'transparent' }}>
        <video
          src={video!.url}
          className="absolute inset-0 w-full h-full object-contain"
          controls
          playsInline
          preload="metadata"
          poster={isFilled.image(primary.poster) ? primary.poster.url! : undefined}
          autoPlay={autoplay}
          muted={autoplay}
          loop={loop}
        />
      </div>
    );
  } else {
    let src = embedUrl(video!, { autoplay }) || '';
    if (autoplay && video!.provider === 'youtube') src += '&mute=1';
    if (autoplay && video!.provider === 'bunny') src += '&muted=true';
    if (loop && video!.provider === 'bunny') src += '&loop=true';
    if (loop && video!.provider === 'youtube') src += `&loop=1&playlist=${video!.id}`;
    player = (
      <div className={cn('relative w-full overflow-hidden border bg-black', radius, aspects[String(primary.aspect_ratio || 'Landscape').toLowerCase()] || aspects.landscape)} style={{ borderColor: primary.border_color || 'transparent' }}>
        <iframe
          src={src}
          title={primary.title || 'Embedded video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full font-sans', !inPost && 'px-4 sm:px-6 lg:px-8', !inPost && sectionPaddingClass)}
      style={inPost ? undefined : { backgroundColor: primary.section_bg_color || 'transparent', ...sectionPaddingStyle(primary, 'Medium') }}
    >
      <figure className={cn('w-full', width, align.box, isVertical && !isAudio && 'max-w-[420px]')}>
        {primary.title && (
          <p
            className={cn(titleFont.className, 'mb-4 text-[1.25rem] sm:text-[1.5rem] leading-tight tracking-[-0.01em]', align.text)}
            style={{ fontFamily: titleFont.fontFamily, color: primary.title_color || '#1c1917' }}
          >
            {primary.title}
          </p>
        )}
        {player}
        {isFilled.richText(primary.caption) && (
          <figcaption className={cn('mt-3 text-sm leading-relaxed [&_p]:mb-1 [&_a]:underline', align.text)} style={{ color: primary.caption_color || '#78716c' }}>
            <PrismicRichText field={primary.caption} />
          </figcaption>
        )}
      </figure>
    </section>
  );
};

export default MediaEmbed;
