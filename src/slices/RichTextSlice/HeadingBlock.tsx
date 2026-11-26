import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { resolveFontFamily, cn } from '@lgc_cms/util';
import { alignClasses, sectionPaddingClass, sectionPaddingStyle, widthClass } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

type Level = 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6';

/** Default size for each heading level (used when Size = "Auto"). */
const levelSizes: Record<Level, string> = {
  heading1: 'text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem]',
  heading2: 'text-[2rem] sm:text-[2.5rem] lg:text-[3rem]',
  heading3: 'text-[1.625rem] sm:text-[2rem]',
  heading4: 'text-[1.375rem] sm:text-[1.625rem]',
  heading5: 'text-[1.125rem] sm:text-[1.25rem]',
  heading6: 'text-[1rem] sm:text-[1.0625rem]',
};

const sizeOverrides: Record<string, string> = {
  'extra large': 'text-[2.75rem] sm:text-[4rem] lg:text-[5rem]',
  large: 'text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem]',
  medium: 'text-[1.75rem] sm:text-[2.25rem]',
  small: 'text-[1.375rem] sm:text-[1.625rem]',
  'extra small': 'text-[1.0625rem] sm:text-[1.25rem]',
};

const weights: Record<string, number> = { light: 300, normal: 400, medium: 500, 'semi bold': 600, bold: 700, black: 900 };
const lineHeights: Record<string, string> = { tight: 'leading-[1]', snug: 'leading-[1.1]', normal: 'leading-[1.25]', relaxed: 'leading-[1.4]' };
const letterSpacing: Record<string, string> = { tighter: 'tracking-[-0.03em]', tight: 'tracking-[-0.015em]', normal: 'tracking-normal', wide: 'tracking-[0.04em]' };

/**
 * "Heading" variation of RichTextSlice: one h1–h6 heading (level chosen in the text field),
 * with optional eyebrow and subtitle, and editor-controlled font, size, colour, background and spacing.
 */
export const HeadingBlock = ({ slice, context }: { slice: any; context?: any }): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  if (!isFilled.richText(primary.heading)) return null;

  const inPost = !!context?.inPost;
  const align = alignClasses(primary.alignment);
  const font = resolveFontFamily(primary.font, 'Bebas Neue');
  const sizeChoice = String(primary.size || 'Auto').toLowerCase();
  const transform = String(primary.text_transform || 'None').toLowerCase();
  const color = primary.color || '#1c1917';
  const highlight = primary.highlight_color || '#d85d18';

  const classFor = (level: Level) =>
    cn(
      font.className,
      sizeOverrides[sizeChoice] || levelSizes[level],
      lineHeights[String(primary.line_height || 'Snug').toLowerCase()] || lineHeights.snug,
      letterSpacing[String(primary.letter_spacing || 'Tight').toLowerCase()] || letterSpacing.tight,
      transform === 'uppercase' && 'uppercase',
      transform === 'capitalize' && 'capitalize',
      align.text
    );
  const style = {
    fontFamily: font.fontFamily,
    fontWeight: weights[String(primary.weight || 'Normal').toLowerCase()] ?? 400,
    color,
  };
  const heading = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', level: Level) =>
    // eslint-disable-next-line react/display-name
    ({ children }: any) => (
      <Tag className={classFor(level)} style={style}>
        {children}
      </Tag>
    );
  // Bold / italic words take the highlight colour
  const highlightSpan = ({ children }: any) => <span style={{ color: highlight }}>{children}</span>;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full font-sans', !inPost && 'px-4 sm:px-6 lg:px-8', !inPost && sectionPaddingClass)}
      style={inPost ? undefined : { backgroundColor: primary.section_bg_color || 'transparent', ...sectionPaddingStyle(primary, 'Medium') }}
    >
      <div className={cn('flex flex-col', align.items, inPost ? 'w-full' : cn('w-full', widthClass(primary.content_width, 'Wide'), align.box))}>
        {primary.eyebrow && (
          <p
            className={cn('text-xs sm:text-sm font-medium tracking-[0.08em] uppercase mb-3', align.text)}
            style={{ color: primary.eyebrow_color || highlight }}
          >
            {primary.eyebrow}
          </p>
        )}
        <PrismicRichText
          field={primary.heading}
          components={{
            heading1: heading('h1', 'heading1'),
            heading2: heading('h2', 'heading2'),
            heading3: heading('h3', 'heading3'),
            heading4: heading('h4', 'heading4'),
            heading5: heading('h5', 'heading5'),
            heading6: heading('h6', 'heading6'),
            strong: highlightSpan,
            em: highlightSpan,
          }}
        />
        {primary.subtitle && (
          <p
            className={cn('mt-4 max-w-2xl text-[1rem] sm:text-[1.125rem] leading-relaxed', align.text)}
            style={{ color: primary.subtitle_color || '#78716c' }}
          >
            {primary.subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default HeadingBlock;
