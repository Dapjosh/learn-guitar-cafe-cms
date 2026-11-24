import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import { Bounded } from '@components/Bounded';
import { SectionTestimonials } from '@lgc_cms/features';
import { TestimonialsType } from '@lgc_cms/types';
import { TestimonialCarousel } from './TestimonialCarousel';

import type { JSX } from "react";

/**
 * Props for `Testimonials`.
 */
export type TestimonialsProps = SliceComponentProps<Content.TestimonialsSlice>;

/**
 * Component for "Testimonials" Slices.
 */
const Testimonials = ({ slice }: TestimonialsProps): JSX.Element => {
  // Cast so the check compiles whether or not prismicio-types.d.ts includes the variation yet
  if ((slice.variation as string) === 'carousel') {
    return <TestimonialCarousel slice={slice} />;
  }

  const testimonials = ((slice.primary as any).items || []).map((item: any) => {
    const testimonial: TestimonialsType = {
      name: item.name as string,
      designation: item.designation as string,
      review: item.review,
      image: item.image,
      rating: item.rating as number,
    };
    return testimonial;
  });

  return (
    <Bounded as={'section'} yPadding={'sm'}>
      <SectionTestimonials data={testimonials} />
    </Bounded>
  );
};

export default Testimonials;
