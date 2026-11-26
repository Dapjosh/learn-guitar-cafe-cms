import React from 'react';
import { isFilled } from '@prismicio/client';
import { createClient } from '@/prismicio';
import { AuthorCard, authorFromData, type AuthorInfo } from '@components/blog/AuthorCard';
import { cn } from '@lgc_cms/util';

import type { JSX } from 'react';

/**
 * Props for `AuthorBio`.
 */
export type AuthorBioProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const sampleAuthor: AuthorInfo = {
  name: 'Paul Greig',
  bio: [
    {
      type: 'paragraph',
      text: 'Roots and blues guitarist who helps players find their way around the fretboard. When he isn’t teaching, he performs and records with traditional slide setups.',
      spans: [],
    },
  ],
  image: null,
  links: [
    { label: 'YouTube channel', link: { link_type: 'Web', url: 'https://www.youtube.com' }, icon: 'YouTube' },
    { label: 'Explore the courses', link: { link_type: 'Web', url: '/all-courses' }, icon: 'Arrow' },
  ],
};

const widths: Record<string, string> = {
  narrow: 'max-w-[720px]',
  medium: 'max-w-[960px]',
  wide: 'max-w-[1380px]',
};

/**
 * Component for "AuthorBio" Slices: an author's card ("card") or a single-row bio bar ("compact").
 */
const AuthorBio = async ({ slice, context }: AuthorBioProps): Promise<JSX.Element | null> => {
  const primary = (slice?.primary || {}) as any;
  const layout = slice.variation === 'compact' ? 'compact' : 'card';

  let author: AuthorInfo | null = null;
  if (isFilled.contentRelationship(primary.author)) {
    const doc = await createClient()
      .getByID(primary.author.id)
      .catch(() => null);
    author = authorFromData(doc?.data);
  }
  if (!author) {
    if (process.env.NODE_ENV === 'production') return null;
    author = sampleAuthor; // preview in development / Slice Machine
  }

  const width = widths[String(primary.width || (layout === 'card' ? 'Narrow' : 'Wide')).toLowerCase()] || widths.narrow;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full font-sans', !context?.inPost && 'px-4 sm:px-6 lg:px-8 py-8 sm:py-10')}
      style={{ backgroundColor: context?.inPost ? undefined : primary.section_bg_color || 'transparent' }}
    >
      <div className={cn('mx-auto', context?.inPost ? 'w-full' : width)}>
        <AuthorCard
          author={author}
          style={{
            layout,
            label: primary.show_label === false ? '' : primary.label || 'Written by',
            cardBg: primary.card_bg_color,
            cardBorder: primary.card_border_color,
            labelColor: primary.label_color,
            nameColor: primary.name_color,
            textColor: primary.text_color,
            linkColor: primary.link_color,
            linkBorderColor: primary.link_border_color,
            linkHoverColor: primary.link_hover_color,
            nameFont: primary.name_font,
            showLinks: primary.show_links !== false,
            showImage: primary.show_image !== false,
          }}
        />
      </div>
    </section>
  );
};

export default AuthorBio;
