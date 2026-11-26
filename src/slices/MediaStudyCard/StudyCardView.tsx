'use client';

import React, { useRef, useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';
import { embedUrl, formatTime, type Chapter, type VideoSource } from '@components/media/media-utils';
import { AudioTrack } from './AudioTrack';

type Props = {
  sliceType: string;
  variation: string;
  primary: any;
  video: VideoSource | null;
  videoChapters: Chapter[];
  audioUrl: string;
  audioChapters: Chapter[];
  /** Inside a blog post: no section padding/background, fill the article column */
  inPost?: boolean;
};

const widths: Record<string, string> = {
  narrow: 'max-w-[720px]',
  medium: 'max-w-[880px]',
  wide: 'max-w-[1100px]',
};

/**
 * Client part of the Media Study Card: header, video with chapter tabs,
 * play-along audio track and practice tab.
 */
export const StudyCardView = ({ sliceType, variation, primary, video, videoChapters, audioUrl, audioChapters, inPost = false }: Props) => {
  const [chapter, setChapter] = useState(0);
  const [startAt, setStartAt] = useState<number | null>(null); // set when a chapter is chosen (iframe reloads there)
  const fileRef = useRef<HTMLVideoElement>(null);

  const c = {
    sectionBg: primary.section_bg_color || 'transparent',
    cardBg: primary.card_bg_color || '#fbf9f5',
    cardBorder: primary.card_border_color || 'transparent',
    badgeBg: primary.badge_bg_color || '#fbe3d4',
    badgeText: primary.badge_text_color || '#d85d18',
    title: primary.title_color || '#1c1917',
    text: primary.text_color || '#78716c',
    accent: primary.accent_color || '#d85d18',
    muted: primary.waveform_color || '#e9d2c2',
    divider: primary.divider_color || '#e7dfd2',
    tabBorder: primary.tab_border_color || '#e2d9cb',
    tabText: primary.tab_text_color || '#1c1917',
    buttonBg: primary.play_button_bg_color || '#1c1917',
    buttonIcon: primary.play_button_icon_color || '#ffffff',
    tempoBg: primary.tempo_bg_color || '#ebe4d8',
    tabSheetBg: primary.practice_tab_bg_color || '#ffffff',
  };
  const titleFont = resolveFontFamily(primary.title_font, 'Fraunces');
  const width = widths[String(primary.width || 'Medium').toLowerCase()] || widths.medium;

  /** Chapter tabs (shared by video and audio). */
  const ChapterTabs = ({ chapters, active, onSelect, label }: { chapters: Chapter[]; active: number; onSelect: (i: number) => void; label: string }) => (
    <div className="border-b mb-4" style={{ borderColor: c.tabBorder }}>
      <div role="tablist" aria-label={label} className="flex gap-1.5 overflow-x-auto -mb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chapters.map((ch, i) => {
          const isActive = i === active;
          return (
            <button
              key={`${ch.title}-${ch.start}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(i)}
              className="shrink-0 inline-flex items-center gap-2 rounded-t-md border border-b-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
              style={{
                backgroundColor: isActive ? c.accent : 'transparent',
                borderColor: isActive ? c.accent : c.tabBorder,
                color: isActive ? '#ffffff' : c.tabText,
              }}
            >
              {ch.title}
              <span
                className="rounded-full px-1.5 py-0.5 text-[0.65rem] leading-none tabular-nums"
                style={isActive ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: c.tempoBg, color: c.text }}
              >
                {formatTime(ch.start)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const selectVideoChapter = (i: number) => {
    setChapter(i);
    const start = videoChapters[i]?.start ?? 0;
    if (video?.provider === 'file' && fileRef.current) {
      fileRef.current.currentTime = start;
      void fileRef.current.play();
    } else {
      setStartAt(start); // reload the embed at this time, playing
    }
  };

  const showVideo = !!video && primary.show_video !== false;
  const showAudio = !!audioUrl && primary.show_audio !== false;
  const hasTabImage = isFilled.image(primary.practice_tab_image);
  const hasTabText = isFilled.richText(primary.practice_tab_text);
  const showPractice = primary.show_practice_tab !== false && (hasTabImage || hasTabText);

  const sectionHeading = (text: string) => (
    <p className="text-sm font-medium mb-3" style={{ color: c.title }}>
      {text}
    </p>
  );

  return (
    <section
      data-slice-type={sliceType}
      data-slice-variation={variation}
      className={cn('w-full font-sans', !inPost && 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12')}
      style={{ backgroundColor: inPost ? undefined : c.sectionBg }}
    >
      <div className={cn('mx-auto rounded-[12px] border p-5 sm:p-8', inPost ? 'w-full' : width)} style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}>
        {/* Header */}
        {primary.show_badge !== false && (
          <span className="inline-block rounded-full px-2.5 py-1 text-xs leading-none mb-4" style={{ backgroundColor: c.badgeBg, color: c.badgeText }}>
            {primary.badge_text || 'Study card'}
          </span>
        )}
        {primary.title && (
          <h2 className={cn(titleFont.className, 'text-[1.5rem] sm:text-[2rem] leading-tight tracking-[-0.01em]')} style={{ fontFamily: titleFont.fontFamily, color: c.title }}>
            {primary.title}
          </h2>
        )}
        {isFilled.richText(primary.description) && (
          <div className="mt-2 text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0" style={{ color: c.text }}>
            <PrismicRichText field={primary.description} />
          </div>
        )}

        {/* Video */}
        {showVideo && video && (
          <div className="mt-6">
            <div className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden bg-black">
              {video.provider === 'file' ? (
                <video ref={fileRef} src={video.url} className="absolute inset-0 w-full h-full" controls playsInline preload="metadata" poster={primary.video_poster?.url || undefined} />
              ) : (
                <iframe
                  key={startAt ?? 'initial'}
                  src={embedUrl(video, { start: startAt ?? 0, autoplay: startAt !== null }) || undefined}
                  title={primary.title || 'Lesson video'}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  loading="lazy"
                />
              )}
            </div>
            {videoChapters.length > 0 && (
              <div className="mt-5">
                <p className="text-xs mb-2" style={{ color: c.text }}>
                  {primary.chapters_label || 'Chapters'}
                </p>
                <ChapterTabs chapters={videoChapters} active={chapter} onSelect={selectVideoChapter} label="Video chapters" />
              </div>
            )}
          </div>
        )}

        {/* Play-along audio */}
        {showAudio && (
          <div className={cn('mt-6', showVideo && 'pt-6 border-t')} style={{ borderColor: c.divider }}>
            <AudioTrack
              src={audioUrl}
              label={primary.audio_title || 'Play-along track'}
              note={primary.audio_note ?? 'MP3 · slow down without changing pitch'}
              chapters={audioChapters}
              showWaveform={primary.show_waveform !== false}
              showTempo={primary.show_tempo !== false}
              minTempo={typeof primary.min_tempo === 'number' ? Math.max(25, primary.min_tempo) : 50}
              maxTempo={typeof primary.max_tempo === 'number' ? Math.min(200, primary.max_tempo) : 100}
              colors={{ accent: c.accent, muted: c.muted, text: c.title, meta: c.text, tabBorder: c.tabBorder, buttonBg: c.buttonBg, buttonIcon: c.buttonIcon, tempoBg: c.tempoBg }}
              ChapterTabs={ChapterTabs}
            />
          </div>
        )}

        {/* Practice tab */}
        {showPractice && (
          <div className={cn('mt-6', (showVideo || showAudio) && 'pt-6 border-t')} style={{ borderColor: c.divider }}>
            {sectionHeading(primary.practice_tab_label || 'Practice tab')}
            <div className="rounded-[8px] border p-4 sm:p-6" style={{ backgroundColor: c.tabSheetBg, borderColor: c.divider }}>
              {primary.practice_tab_title && (
                <p className={cn(titleFont.className, 'text-lg sm:text-xl')} style={{ fontFamily: titleFont.fontFamily, color: c.title }}>
                  {primary.practice_tab_title}
                </p>
              )}
              {primary.practice_tab_meta && (
                <p className="mt-1 text-xs" style={{ color: c.text }}>
                  {primary.practice_tab_meta}
                </p>
              )}
              {hasTabImage && (
                <div className="mt-4 overflow-x-auto">
                  <PrismicNextImage field={primary.practice_tab_image} className="w-full min-w-[560px] h-auto" sizes="(max-width: 900px) 100vw, 880px" />
                </div>
              )}
              {hasTabText && (
                <div className="mt-4 overflow-x-auto">
                  <PrismicRichText
                    field={primary.practice_tab_text}
                    components={{
                      preformatted: ({ children }: any) => (
                        <pre className="font-mono text-[0.8rem] leading-[1.35] whitespace-pre" style={{ color: c.title }}>
                          {children}
                        </pre>
                      ),
                      paragraph: ({ children }: any) => (
                        <p className="font-mono text-[0.8rem] leading-[1.35] whitespace-pre" style={{ color: c.title }}>
                          {children}
                        </p>
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudyCardView;
