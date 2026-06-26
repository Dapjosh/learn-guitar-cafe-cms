import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps, PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from '@prismicio/next';
import clsx from "clsx";

/**
 * Props for `HeroHeading`.
 */
export type HeroHeadingProps = SliceComponentProps<Content.HeroHeadingSlice>;

/**
 * Component for "HeroHeading" Slices.
 */
const HeroHeading: FC<HeroHeadingProps> = ({ slice }) => {

  const titleSizeClass =
    slice.primary.font_size === 'Small' ? 'text-3xl md:text-4xl' :
      slice.primary.font_size === 'Large' ? 'text-5xl md:text-7xl' :
        'text-4xl md:text-5xl';

  const overlayOpacity = isFilled.number(slice.primary.background_opacity)
    ? slice.primary.background_opacity / 100
    : 0.5;



  return (
    <section
      className="relative flex items-center justify-center py-24 px-4 min-h-[400px] overflow-hidden"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {isFilled.image(slice.primary.background_image) && (
        <div className="absolute inset-0 z-0">
          <PrismicNextImage
            field={slice.primary.background_image}
            fill
            className="object-cover"
            alt=""
          />

          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      <div className="relative z-10 text-center text-white max-w-3xl mx-auto drop-shadow-lg">


        <div className={clsx("font-bold mb-4", titleSizeClass)}>
          <PrismicRichText field={slice.primary.title} />
        </div>

        <div className="text-lg md:text-xl text-gray-200 font-medium">
          <PrismicRichText field={slice.primary.description} />
        </div>

      </div>

    </section>
  );
};

export default HeroHeading;
