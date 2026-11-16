/* eslint-disable-next-line */
'use client';
import cn from 'classnames';
import { useState } from 'react';

import VideoControl from './video-control';
import VideoFrame from './video-frame';
import VideoPlayerWrapper from '../video-player-wrapper';

export interface VimeoProps {
  id: string;
  src?: string;
  title: string;
  poster?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  loading?: 'lazy' | 'eager';
  loop?: boolean;
  frame?: boolean;
  standard?: boolean;
}

function getVimeoEmbedUrl(idOrUrl: string, loop: boolean = false): string {
  let videoId = idOrUrl;
  const match = idOrUrl.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/
  );
  if (match) {
    videoId = match[1];
  }
  const params = new URLSearchParams({
    autoplay: '1',
    loop: loop ? '1' : '0',
    dnt: '1',
    byline: '0',
    title: '0',
  });
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

export function Vimeo({
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
  standard = true,
}: VimeoProps) {
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

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
    <VideoPlayerWrapper
      handlePlay={handlePlay}
      handlePause={handlePause}
      handleReplay={handleReplay}
    >
      <div
        className={cn(
          'bg-neutral aspect-w-16 aspect-h-9 relative z-20 h-full w-full overflow-hidden',
          showPlayer ? 'display opacity-100' : 'hidden opacity-0'
        )}
      >
        <VideoFrame active={frame}>
          {showPlayer && (
            <iframe
              src={getVimeoEmbedUrl(src || id, loop)}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute z-10 inset-0 h-full w-full border-0 object-cover object-center"
            />
          )}

          {!autoplay && (
            <VideoControl
              handlePlay={play}
              title={title}
              loading={loading}
              poster={
                poster && `${poster}?fm=webp&w=${width}&h=${height}&fit=fill`
              }
              width={width}
              height={height}
            />
          )}
        </VideoFrame>
      </div>
    </VideoPlayerWrapper>
  );
}

export default Vimeo;
