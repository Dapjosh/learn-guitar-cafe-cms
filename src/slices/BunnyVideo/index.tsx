"use client";

import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicText } from "@prismicio/react";

/**
 * Props for `BunnyVideo`.
 */
export type BunnyVideoProps = SliceComponentProps<Content.BunnyVideoSlice>;

function getEmbedUrl(url: string): { type: "iframe" | "video"; src: string } {
  // Bunny Stream
  if (url.includes("mediadelivery.net")) {
    return { type: "iframe", src: url };
  }

  // YouTube
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch) {
    return {
      type: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&controls=1`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/
  );
  if (vimeoMatch) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&dnt=1`,
    };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg)($|\?)/i.test(url)) {
    return { type: "video", src: url };
  }

  // Fallback to iframe
  return { type: "iframe", src: url };
}

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

          const embed = getEmbedUrl(videoUrl);

          if (embed.type === "video") {
            return (
              <video
                src={embed.src}
                controls
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            );
          }

          return (
            <iframe
              src={embed.src}
              loading="lazy"
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen={true}
            />
          );
        })()}
      </div>
    </section>
  );
};

export default BunnyVideo;
