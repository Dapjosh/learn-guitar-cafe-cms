import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';

import type { JSX } from 'react';

/**
 * Props for `ImageBlock`.
 */
export type ImageBlockProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const sizes: Record<string, { box: string; sizes: string }> = {
  small: { box: 'max-w-[480px]', sizes: '480px' },
  medium: { box: 'max-w-[720px]', sizes: '(max-width: 768px) 100vw, 720px' },
  large: { box: 'max-w-[960px]', sizes: '(max-width: 1024px) 100vw, 960px' },
  wide: { box: 'max-w-[1200px]', sizes: '(max-width: 1280px) 100vw, 1200px' },
  'full width': { box: 'max-w-none', sizes: '100vw' },
};

const aspects: Record<string, string | null> = {
  original: null,
  landscape: 'aspect-[16/9]',
  classic: 'aspect-[4/3]',
  square: 'aspect-[1/1]',
  portrait: 'aspect-[3/4]',
  panorama: 'aspect-[21/9]',
};

const radii: Record<string, string> = {
  none: 'rounded-none',
  small: 'rounded-[4px]',
  medium: 'rounded-[8px]',
  large: 'rounded-[16px]',
};

/**
 * Component for "ImageBlock" Slices: one image with an optional title and caption,
 * with editor-controlled size, alignment, shape, corners, border, shadow and link.
 */
const ImageBlock = ({ slice, context }: ImageBlockProps): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  const hasImage = isFilled.image(primary.image);
  if (!hasImage && process.env.NODE_ENV === 'production') return null;

  const size = sizes[String(primary.size || 'Large').toLowerCase()] || sizes.large;
  // Inside a post the image is never wider than the article column
  const imageSizes = context?.inPost ? '(max-width: 768px) 100vw, 720px' : size.sizes;
  const isFull = String(primary.size || '').toLowerCase() === 'full width';
  const align = String(primary.alignment || 'Center').toLowerCase();
  const aspect = aspects[String(primary.aspect_ratio || 'Original').toLowerCase()] ?? null;
  const radius = radii[String(primary.corner_radius || 'Small').toLowerCase()] || radii.small;
  const titleAbove = String(primary.title_position || 'Above').toLowerCase() === 'above';
  const captionAlign = String(primary.caption_alignment || 'Left').toLowerCase() === 'center' ? 'text-center' : 'text-left';
  const titleFont = resolveFontFamily(primary.title_font, 'Fraunces');
  const fit = String(primary.image_fit || 'Cover').toLowerCase() === 'contain' ? 'object-contain' : 'object-cover';

  const title = primary.title ? (
    <p
      className={cn(titleFont.className, 'text-[1.25rem] sm:text-[1.5rem] leading-tight tracking-[-0.01em]', titleAbove ? 'mb-4' : 'mt-4', captionAlign)}
      style={{ fontFamily: titleFont.fontFamily, color: primary.title_color || '#1c1917' }}
    >
      {primary.title}
    </p>
  ) : null;

  const frameStyle = {
    borderColor: primary.border_color || 'transparent',
    backgroundColor: primary.image_bg_color || 'transparent',
  };
  const frameClass = cn(
    'relative block w-full overflow-hidden border',
    isFull ? 'rounded-none' : radius,
    aspect,
    primary.shadow === true && 'shadow-[0_20px_50px_-24px_rgba(28,25,23,0.45)]'
  );

  const image = hasImage ? (
    aspect ? (
      <PrismicNextImage field={primary.image} fallbackAlt="" fill sizes={imageSizes} className={fit} />
    ) : (
      <PrismicNextImage field={primary.image} fallbackAlt="" sizes={imageSizes} className="w-full h-auto" />
    )
  ) : (
    <span className="block w-full aspect-[16/9] bg-[#e7dfd2]" aria-hidden="true" />
  );

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full font-sans', context?.inPost ? '' : isFull ? 'py-0' : 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8')}
      style={{ backgroundColor: context?.inPost ? undefined : primary.section_bg_color || 'transparent' }}
    >
      <figure
        className={cn(
          'w-full',
          size.box,
          align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto'
        )}
      >
        {titleAbove && title}
        {isFilled.link(primary.link) ? (
          <PrismicNextLink field={primary.link} className={cn(frameClass, 'group')} style={frameStyle}>
            {image}
          </PrismicNextLink>
        ) : (
          <span className={frameClass} style={frameStyle}>
            {image}
          </span>
        )}
        {!titleAbove && title}
        {isFilled.richText(primary.caption) && (
          <figcaption
            className={cn('mt-3 text-sm leading-relaxed [&_p]:mb-1 [&_a]:underline', captionAlign, isFull && 'px-4')}
            style={{ color: primary.caption_color || '#78716c' }}
          >
            <PrismicRichText field={primary.caption} />
          </figcaption>
        )}
      </figure>
    </section>
  );
};

export default ImageBlock;
