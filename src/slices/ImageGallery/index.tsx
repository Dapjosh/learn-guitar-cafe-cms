import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from '@prismicio/next';
import clsx from 'clsx';

/**
 * Props for `ImageGallery`.
 */
export type ImageGalleryProps = SliceComponentProps<Content.ImageGallerySlice>;

/**
 * Component for "ImageGallery" Slices.
 */
const ImageGallery: FC<ImageGalleryProps> = ({ slice }) => {

  const paddingClass =
    slice.primary.padding === 'None' ? 'py-0 px-4' :
      slice.primary.padding === "Small" ? "py-4 md:py-8" :
        slice.primary.padding === "Medium" ? "py-8 md:py-16" :
          slice.primary.padding === "Large" ? "py-12 md:py-24" : "py-8 md:py-16";

  const bgColor = isFilled.color(slice.primary.background_color)
    ? slice.primary.background_color
    : 'transparent';

  return (
    <section
      className={clsx("w-full transition-colors duration-300 ", paddingClass)}
      style={{ backgroundColor: bgColor }}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="max-w-7xl mx-auto ">
        {isFilled.keyText(slice.primary.title) && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900">
            {slice.primary.title}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 rounded-3xl overflow-hidden">
          {slice.primary.images.map((item, index) => {
            if (isFilled.image(item.image)) {
              return (
                <div key={index} className="flex flex-col group">

                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                    <PrismicNextImage
                      field={item.image}
                      fill
                      className="object-cover"
                      fallbackAlt=""
                    />
                  </div>

                  {isFilled.keyText(item.caption) && (
                    <p className="text-sm font-medium text-gray-600 text-center mt-3">
                      {item.caption}
                    </p>
                  )}

                </div>
              );
            }
            return null;
          })}

        </div>
      </div>

    </section>
  );
};

export default ImageGallery;
