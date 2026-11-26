import React from 'react';
import type { JSXMapSerializer } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';

export type PostTypography = {
  bodyFont?: string | null;
  headingFont?: string | null;
  textColor?: string | null;
  headingColor?: string | null;
  linkColor?: string | null;
  /** Body text size (default Medium) */
  size?: string | null;
};

/** Rich-text styling for blog post bodies (serif headings, readable paragraphs, styled links/lists/images). */
export function postRichTextComponents(t: PostTypography = {}): JSXMapSerializer {
  const body = resolveFontFamily(t.bodyFont, 'Inter Tight');
  const heading = resolveFontFamily(t.headingFont, 'Fraunces');
  const text = t.textColor || '#1c1917';
  const headingColor = t.headingColor || '#1c1917';
  const link = t.linkColor || '#d85d18';
  const textSizes: Record<string, string> = {
    small: 'text-[0.9375rem] leading-[1.65]',
    medium: 'text-[1rem] sm:text-[1.0625rem] leading-[1.7]',
    large: 'text-[1.0625rem] sm:text-[1.1875rem] leading-[1.7]',
  };
  const textSize = textSizes[String(t.size || 'Medium').toLowerCase()] || textSizes.medium;
  const h = (cls: string) => ({
    className: cn(heading.className, cls, 'leading-tight tracking-[-0.01em] mt-12 mb-4 first:mt-0'),
    style: { fontFamily: heading.fontFamily, color: headingColor },
  });
  const p = {
    className: cn(body.className, textSize, 'mb-5 last:mb-0'),
    style: { fontFamily: body.fontFamily, color: text },
  };

  return {
    heading1: ({ children }) => <h2 {...h('text-[1.875rem] sm:text-[2.25rem]')}>{children}</h2>,
    heading2: ({ children }) => <h2 {...h('text-[1.625rem] sm:text-[1.875rem]')}>{children}</h2>,
    heading3: ({ children }) => <h3 {...h('text-[1.375rem] sm:text-[1.5rem]')}>{children}</h3>,
    heading4: ({ children }) => <h4 {...h('text-[1.125rem] sm:text-[1.25rem]')}>{children}</h4>,
    heading5: ({ children }) => <h5 {...h('text-[1rem]')}>{children}</h5>,
    heading6: ({ children }) => <h6 {...h('text-[1rem]')}>{children}</h6>,
    paragraph: ({ children }) => <p {...p}>{children}</p>,
    preformatted: ({ children }) => (
      <pre className="mb-5 overflow-x-auto rounded-md bg-[#1c1917] p-4 text-sm leading-relaxed text-[#f5f0e8]">
        <code>{children}</code>
      </pre>
    ),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    hyperlink: ({ node, children }) => (
      <PrismicNextLink field={node.data} className="underline underline-offset-4 decoration-1 hover:decoration-2" style={{ color: link }}>
        {children}
      </PrismicNextLink>
    ),
    list: ({ children }) => (
      <ul className={cn(p.className, 'list-disc pl-6 space-y-2 marker:text-[color:var(--post-link)]')} style={{ ...p.style, '--post-link': link } as React.CSSProperties}>
        {children}
      </ul>
    ),
    oList: ({ children }) => (
      <ol className={cn(p.className, 'list-decimal pl-6 space-y-2 marker:text-[color:var(--post-link)]')} style={{ ...p.style, '--post-link': link } as React.CSSProperties}>
        {children}
      </ol>
    ),
    listItem: ({ children }) => <li className="pl-1">{children}</li>,
    oListItem: ({ children }) => <li className="pl-1">{children}</li>,
    image: ({ node }) => (
      <figure className="my-8">
        <PrismicNextImage field={node} className="w-full h-auto rounded-[8px]" sizes="(max-width: 768px) 100vw, 720px" />
        {node.alt && (
          <figcaption className="mt-2 text-sm text-center" style={{ color: '#78716c' }}>
            {node.alt}
          </figcaption>
        )}
      </figure>
    ),
    embed: ({ node }) => (
      <div className="my-8 aspect-[16/9] w-full overflow-hidden rounded-[8px] [&_iframe]:w-full [&_iframe]:h-full" dangerouslySetInnerHTML={{ __html: node.oembed.html ?? '' }} />
    ),
  };
}
