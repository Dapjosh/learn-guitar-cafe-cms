/* eslint-disable-next-line */
'use client';
import cn from 'classnames';
import { useState } from 'react';

import VideoControl from './video-control';
import VideoFrame from './video-frame';
import VideoPlayerWrapper from '../video-player-wrapper';

export interface YoutubeProps {
  id: string;
  src?: string;
  title: string;
  poster?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  loading?: 'lazy' | 'eager';
  frame?: boolean;
}

function getYouTubeEmbedUrl(
  idOrUrl: string,
  controls: boolean = true,
  loop: boolean = false
): string {
  let videoId = idOrUrl;
  const match = idOrUrl.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match) {
    videoId = match[1];
  }
  const params = new URLSearchParams({
    autoplay: '1',
    color: 'white',
    controls: controls ? '1' : '0',
    playsinline: '1',
    rel: '0',
  });
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function Youtube({
  id,
  src,
  title,
  poster,
  autoplay,
  frame,
  controls = true,
  loop = false,
  loading = 'lazy',
  width = 1920,
  height = 1200,
}: YoutubeProps) {
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  if (!width) {
    width = 944;
  }

  if (!height) {
    height = 531;
  }

  const handlePlay = () => {
    if (autoplay) {
      setShowPlayer(true);
    }
  };

  const handlePause = () => {
    setShowPlayer(false);
  };

  const handleReplay = () => {
    if (autoplay) {
      setShowPlayer(true);
    }
  };

  const play = () => {
    setShowPlayer(true);
  };

  return (
    <VideoPlayerWrapper handlePlay={handlePlay} handlePause={handlePause} handleReplay={handleReplay}>
      <div className={cn('aspect-w-16 aspect-h-9 relative z-20 overflow-hidden')}>
        <VideoFrame active={frame}>
          {showPlayer && (
            <iframe
              src={getYouTubeEmbedUrl(src || id, controls, loop)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute z-10 inset-0 h-full w-full border-0"
            />
          )}
          {!autoplay && (
            <VideoControl
              handlePlay={play}
              title={title}
              poster={poster}
              loading={loading}
              width={width}
              height={height}
            />
          )}
        </VideoFrame>
      </div>
    </VideoPlayerWrapper>
  );
}

export default Youtube;
