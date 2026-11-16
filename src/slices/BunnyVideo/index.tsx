"use client";

import { FC, useState, useEffect } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicText } from "@prismicio/react";
import dynamic from "next/dynamic";

// Dynamically import ReactPlayer to avoid SSR hydration issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

/**
 * Props for `BunnyVideo`.
 */
export type BunnyVideoProps = SliceComponentProps<Content.BunnyVideoSlice>;

/**
 * Component for "BunnyVideo" Slices.
 */
const BunnyVideo: FC<BunnyVideoProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="container mx-auto my-12 px-4 md:px-8"
    >


      {slice.primary.title && (
        <div className="mb-8 md:mb-12 flex justify-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center max-w-4xl">

            {typeof slice.primary.title === "string" ? (
              slice.primary.title
            ) : (
              <PrismicText field={slice.primary.title as any} />
            )}
          </h2>
        </div>
      )}

      <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden shadow-2xl bg-gray-100 border border-gray-200">

        {(() => {
          const videoUrl = slice.primary.video_url as string;

          if (!videoUrl) {
            return (
              <div className="absolute inset-0 flex items-center justify-center w-full h-full text-gray-500">
                Please provide a video URL in Prismic.
              </div>
            );
          }

          // Check if it's a Bunny.net Stream URL (usually uses mediadelivery.net)
          if (videoUrl.includes("mediadelivery.net")) {
            return (
              <iframe
                src={videoUrl}
                loading="lazy"
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
              />
            );
          }

          // Fallback to ReactPlayer for YouTube, Vimeo, etc.
          return (
            <ReactPlayer
              url={videoUrl}
              className="absolute top-0 left-0"
              width="100%"
              height="100%"
              controls={true}
            />
          );
        })()}

      </div>

    </section>
  );
};

export default BunnyVideo;
