import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { cn } from '@lgc_cms/util';

/** Vinyl record grooves drawn with CSS (no image needed). */
export const vinylBackground = (base: string, groove: string) =>
  `repeating-radial-gradient(circle at center, ${groove} 0 1px, transparent 1px 7px), radial-gradient(circle at center, ${base} 0%, ${base} 100%)`;

export type RingPortraitProps = {
  image: any;
  /** Section background: fills the gap between the rings and the photo */
  gapColor: string;
  ringOuter?: string | null;
  ringInner?: string | null;
  /** Optional third, innermost ring */
  ringExtra?: string | null;
  showVinyl?: boolean;
  vinylColor?: string;
  vinylGroove?: string;
  /** Which side the vinyl sticks out on */
  vinylSide?: 'left' | 'right';
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Circular photo framed by thin concentric rings, optionally with a vinyl record behind it.
 * Responsive: ~300px on phones, 360px on tablets, up to 480px on desktop.
 */
export const RingPortrait = ({
  image,
  gapColor,
  ringOuter = '#e8b04b',
  ringInner = '#d85d18',
  ringExtra = null,
  showVinyl = false,
  vinylColor = '#231f1d',
  vinylGroove = 'rgba(255, 255, 255, 0.05)',
  vinylSide = 'left',
  sizes = '(max-width: 1024px) 80vw, 420px',
  priority = false,
  className,
}: RingPortraitProps) => (
  <div className={cn('relative w-[min(78vw,300px)] sm:w-[360px] lg:w-full lg:max-w-[480px] aspect-[1/1]', className)}>
    {showVinyl && (
      <div
        aria-hidden="true"
        className={cn('absolute top-1/2 -translate-y-1/2 w-[125%] aspect-[1/1] rounded-full border', vinylSide === 'left' ? 'right-[22%]' : 'left-[22%]')}
        style={{ background: vinylBackground(vinylColor, vinylGroove), borderColor: 'rgba(255,255,255,0.06)' }}
      />
    )}
    {ringOuter && <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: ringOuter }} aria-hidden="true" />}
    {ringInner && <div className="absolute inset-[7px] rounded-full border" style={{ borderColor: ringInner }} aria-hidden="true" />}
    {ringExtra && <div className="absolute inset-[16px] rounded-full border" style={{ borderColor: ringExtra }} aria-hidden="true" />}
    <div className="absolute inset-[6%] rounded-full" style={{ backgroundColor: gapColor }} aria-hidden="true" />
    <div className="absolute inset-[8.5%] rounded-full overflow-hidden bg-[#2b2522]">
      {isFilled.image(image) && <PrismicNextImage field={image} fill sizes={sizes} className="object-cover" priority={priority} />}
    </div>
  </div>
);

export default RingPortrait;
