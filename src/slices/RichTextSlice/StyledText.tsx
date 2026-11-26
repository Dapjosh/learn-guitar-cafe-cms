import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { cn } from '@lgc_cms/util';
import { postRichTextComponents } from '@components/blog/post-rich-text';
import { alignClasses, sectionPaddingClass, sectionPaddingStyle, widthClass } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

const columnClasses: Record<string, string> = {
  '1': '',
  // In columns, big heading top margins would leave empty space at the bottom of the box
  '2': 'md:columns-2 md:gap-10 md:[&_h2]:!mt-6 md:[&_h3]:!mt-6 md:[&_h4]:!mt-6',
  '3': 'md:columns-2 lg:columns-3 md:gap-10 md:[&_h2]:!mt-6 md:[&_h3]:!mt-6 md:[&_h4]:!mt-6',
};

/**
 * "Styled Text" variation of RichTextSlice: full rich text (headings, lists, links,
 * images, embeds, code) with editor-controlled typography, columns, box style
 * (Plain / Card / Callout / Quote), background and spacing.
 */
export const StyledText = ({ slice, context }: { slice: any; context?: any }): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  if (!isFilled.richText(primary.text)) return null;

  const inPost = !!context?.inPost;
  const align = alignClasses(primary.alignment);
  const boxStyle = String(primary.box_style || 'Plain').toLowerCase();
  const accent = primary.accent_color || '#d85d18';
  const columns = columnClasses[String(primary.columns || '1')] || '';

  const components = postRichTextComponents({
    bodyFont: primary.body_font,
    headingFont: primary.heading_font,
    textColor: primary.text_color,
    headingColor: primary.heading_color,
    linkColor: primary.link_color || accent,
    size: boxStyle === 'quote' ? 'Large' : primary.text_size,
  });

  const content = (
    <div className={cn(columns, align.text, '[&>*]:break-inside-avoid-column')}>
      <PrismicRichText field={primary.text} components={components} />
    </div>
  );

  let body: React.ReactNode = content;
  if (boxStyle === 'card') {
    body = (
      <div
        className="rounded-[12px] border p-6 sm:p-8"
        style={{ backgroundColor: primary.box_bg_color || '#fbf9f5', borderColor: primary.box_border_color || 'transparent' }}
      >
        {content}
      </div>
    );
  } else if (boxStyle === 'callout') {
    body = (
      <div
        className="rounded-r-[8px] border-l-4 px-5 py-4 sm:px-6 sm:py-5"
        style={{ backgroundColor: primary.box_bg_color || '#fbe3d4', borderColor: accent }}
      >
        {content}
      </div>
    );
  } else if (boxStyle === 'quote') {
    body = (
      <blockquote className="relative pl-6 sm:pl-8 border-l-2" style={{ borderColor: accent }}>
        <span className="absolute -top-3 left-4 sm:left-6 text-[3rem] leading-none font-fraunces select-none" style={{ color: accent }} aria-hidden="true">
          “
        </span>
        <div className="pt-4 italic">{content}</div>
        {primary.quote_author && (
          <footer className="mt-4 text-sm not-italic" style={{ color: primary.heading_color || '#57534e' }}>
            — {primary.quote_author}
          </footer>
        )}
      </blockquote>
    );
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full font-sans', !inPost && 'px-4 sm:px-6 lg:px-8', !inPost && sectionPaddingClass)}
      style={inPost ? undefined : { backgroundColor: primary.section_bg_color || 'transparent', ...sectionPaddingStyle(primary, 'Medium') }}
    >
      <div className={cn('w-full', inPost ? '' : cn(widthClass(primary.content_width, 'Medium'), align.box))}>{body}</div>
    </section>
  );
};

export default StyledText;
