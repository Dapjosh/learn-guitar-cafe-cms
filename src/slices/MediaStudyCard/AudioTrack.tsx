'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatTime, type Chapter } from '@components/media/media-utils';

const BAR_COUNT = 96;

/** Peak levels for a waveform, decoded in the browser (needs CORS on the audio host). */
async function computePeaks(url: string, bars: number): Promise<number[] | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const audio = await ctx.decodeAudioData(buffer);
    ctx.close?.();
    const data = audio.getChannelData(0);
    const block = Math.floor(data.length / bars) || 1;
    const peaks = Array.from({ length: bars }, (_, i) => {
      let max = 0;
      for (let j = i * block; j < Math.min((i + 1) * block, data.length); j += 16) max = Math.max(max, Math.abs(data[j]));
      return max;
    });
    const top = Math.max(...peaks) || 1;
    return peaks.map((p) => Math.max(0.08, p / top));
  } catch {
    return null;
  }
}

export type AudioTrackProps = {
  src: string;
  label: string;
  note?: string | null;
  chapters: Chapter[];
  showWaveform: boolean;
  showTempo: boolean;
  minTempo: number;
  maxTempo: number;
  colors: { accent: string; muted: string; text: string; meta: string; tabBorder: string; buttonBg: string; buttonIcon: string; tempoBg: string };
  ChapterTabs: React.ComponentType<{ chapters: Chapter[]; active: number; onSelect: (i: number) => void; label: string }>;
};

/**
 * Play-along audio player: play/pause, waveform scrubber, chapters and
 * tempo control that slows down without changing pitch.
 */
export const AudioTrack = ({ src, label, note, chapters, showWaveform, showTempo, minTempo, maxTempo, colors, ChapterTabs }: AudioTrackProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(100);
  const [peaks, setPeaks] = useState<number[] | null>(null);

  useEffect(() => {
    if (!showWaveform || !src) return;
    let cancelled = false;
    computePeaks(src, BAR_COUNT).then((p) => !cancelled && setPeaks(p));
    return () => {
      cancelled = true;
    };
  }, [src, showWaveform]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = tempo / 100;
    // Keep the pitch when slowing down (default in modern browsers; set explicitly for Safari)
    (a as any).preservesPitch = true;
    (a as any).webkitPreservesPitch = true;
  }, [tempo]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  const seek = (seconds: number, play = false) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(seconds, duration || seconds));
    setTime(a.currentTime);
    if (play) void a.play();
  };

  const seekFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  const activeChapter = chapters.reduce((acc, c, i) => (time + 0.25 >= c.start ? i : acc), 0);
  const progress = duration ? time / duration : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
        <p className="text-sm font-medium" style={{ color: colors.text }}>
          {label}
        </p>
        {note && (
          <p className="text-xs" style={{ color: colors.meta }}>
            {note}
          </p>
        )}
      </div>

      {chapters.length > 0 && (
        <ChapterTabs chapters={chapters} active={activeChapter} onSelect={(i) => seek(chapters[i].start, true)} label={`${label} chapters`} />
      )}

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="shrink-0 w-10 h-10 rounded-md inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: colors.buttonBg, color: colors.buttonIcon }}
        >
          {playing ? (
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <rect x="3.5" y="2.5" width="3" height="11" rx="0.5" />
              <rect x="9.5" y="2.5" width="3" height="11" rx="0.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="w-4 h-4 ml-0.5" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
          )}
        </button>

        <span className="text-xs tabular-nums shrink-0" style={{ color: colors.meta }}>
          {formatTime(time)}
        </span>

        {/* Waveform (or a plain progress bar when the waveform can't be read) */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          onPointerDown={seekFromPointer}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') seek(time + 5);
            if (e.key === 'ArrowLeft') seek(time - 5);
          }}
          className="relative order-last sm:order-none basis-full sm:basis-auto flex-1 h-10 cursor-pointer focus:outline-none focus-visible:ring-2 rounded"
        >
          {peaks ? (
            <div className="absolute inset-0 flex items-center gap-[2px]">
              {peaks.map((p, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full"
                  style={{ height: `${Math.round(p * 100)}%`, backgroundColor: i / peaks.length <= progress ? colors.accent : colors.muted }}
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full" style={{ backgroundColor: colors.muted }}>
              <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: colors.accent }} />
            </div>
          )}
        </div>

        <span className="text-xs tabular-nums shrink-0" style={{ color: colors.meta }}>
          {formatTime(duration)}
        </span>

        {showTempo && (
          <div className="shrink-0 ml-auto sm:ml-0 inline-flex items-center gap-1 rounded-md px-2 h-9 text-xs" style={{ backgroundColor: colors.tempoBg, color: colors.text }}>
            <span className="mr-1" style={{ color: colors.meta }}>
              Tempo
            </span>
            <button type="button" className="w-6 h-6 rounded hover:bg-black/5 disabled:opacity-40" onClick={() => setTempo((t) => Math.max(minTempo, t - 5))} disabled={tempo <= minTempo} aria-label="Slower">
              −
            </button>
            <span className="w-10 text-center tabular-nums font-medium" aria-live="polite">
              {tempo}%
            </span>
            <button type="button" className="w-6 h-6 rounded hover:bg-black/5 disabled:opacity-40" onClick={() => setTempo((t) => Math.min(maxTempo, t + 5))} disabled={tempo >= maxTempo} aria-label="Faster">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTrack;
