import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import { Bounded } from '@components/Bounded';
import { SectionFaqs } from '@lgc_cms/features';
import { createClient } from '@/prismicio';
import { AllDocumentTypes } from '../../../prismicio-types';
import { logger } from '@lgc_cms/util';
import { FaqWithImage } from './FaqWithImage';

/**
 * Props for `Faqs`.
 */
export type FaqsProps = SliceComponentProps<Content.FaqsSlice>;

/**
 * Component for "Faqs" Slices.
 */
const Faqs = async ({ slice }: FaqsProps) => {
  // Cast so the check compiles before prismicio-types.d.ts is regenerated with the new variation
  if ((slice.variation as string) === 'withImage') return <FaqWithImage slice={slice} />;

  const client = createClient();
  const faqItems: AllDocumentTypes[] = [];

  if (!(slice.primary as any).faqs?.length) {
    logger.debug('No faqs found');
    return null;
  }

  for (const item of (slice.primary as any).faqs) {
    if (item.faq) {
      const faq = await client.getByID(item.faq?.id);
      faqItems.push(faq);
    }
  }

  if (faqItems.length === 0) {
    logger.debug('No faq items found');
  }

  return (
    <Bounded as={'section'} yPadding={'sm'}>
      <SectionFaqs
        data={{
          headings: slice.primary.heading,
          text: slice.primary.subtitle,
          body: slice.primary.body,
          faqs: faqItems,
        }}
      />
    </Bounded>
  );
};

export default Faqs;
