import { Content } from '@prismicio/client';
import { PrismicRichText, SliceComponentProps } from '@prismicio/react';

import { Bounded } from '../../components/Bounded';
import cn from 'classnames';
import { HeadingBlock } from './HeadingBlock';
import { StyledText } from './StyledText';

import type { JSX } from "react";

/**
 * Props for `RichTextSlice`.
 */
export type RichTextSliceProps = SliceComponentProps<Content.RichTextSliceSlice>;

/**
 * Component for "RichTextSlice" Slices.
 */
const RichTextSlice = ({ slice, context }: RichTextSliceProps): JSX.Element | null => {
  if (slice.variation === 'heading') return <HeadingBlock slice={slice} context={context} />;
  if (slice.variation === 'styledText') return <StyledText slice={slice} context={context} />;

  return (
    <Bounded as="section" className="prose prose-sm md:prose-md lg:prose-xl prose-neutral mx-auto max-w-full">
      {slice.variation === 'twoColumnsWithHeader' && (
        <h2
          className={cn(
            slice.primary.header_alignment === 'Center' && 'w-full text-center',
            slice.primary.header_alignment === 'Right' && 'w-full text-right',
          )}
        >
          {slice.primary.heading} {slice.primary.header_alignment}
        </h2>
      )}
      <div
        className={cn(
          (slice.variation === 'twoColumns' || slice.variation === 'twoColumnsWithHeader') && 'md:columns-2 md:gap-6',
          'rich-text-prose',
        )}
      >
        <PrismicRichText field={slice.primary.text} />
      </div>
    </Bounded>
  );
};

export default RichTextSlice;
