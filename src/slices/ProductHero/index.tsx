import React from "react";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  cn,
} from "@lgc_cms/util";
import { BadgePill } from "../ContentImageSlice/shared";
import { ButtonRow } from "@components/slice-ui/ButtonRow";
import { vinylBackground } from "@components/slice-ui/RingPortrait";
import {
  sectionPaddingClass,
  sectionPaddingStyle,
} from "@components/slice-ui/section-style";

import type { JSX } from "react";

/**
 * Props for `ProductHero`.
 */
export type ProductHeroProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.3l2.4 2.4 4.6-5" />
  </svg>
);

/**
 * Component for "ProductHero" Slices: product landing hero (badge, title, intro, checklist,
 * product image with optional vinyl record, buttons). The sign-up form is the separate Lead Form slice.
 */
const ProductHero = ({ slice }: ProductHeroProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;
  const imageRight = primary.image_position === "Right";
  const showVinyl = primary.show_vinyl !== false;
  const checklist = (Array.isArray(primary.checklist) ? primary.checklist : [])
    .map((c: any) => c?.text)
    .filter(Boolean) as string[];

  const c = {
    heroBg: primary.hero_bg_color || "#1c1917",
    text: primary.description_color || "#a8a29e",
    listText: primary.checklist_text_color || "#f3efe6",
    checkBg: primary.check_bg_color || "rgba(216, 93, 24, 0.16)",
    check: primary.check_color || "#e07b39",
    vinyl: primary.vinyl_color || "#1c1917",
    groove: primary.vinyl_groove_color || "rgba(216, 93, 24, 0.55)",
    label: primary.vinyl_label_color || "#d85d18",
    labelText: primary.vinyl_label_text_color || "#fbe3d4",
  };

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: "Bebas Neue",
    fallbackSize: "Extra Large",
    fallbackColor: "#f3efe6",
  });
  const titleClass = cn(
    titleTypo.className,
    "uppercase tracking-tight leading-[0.98]",
  );
  const introTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    color: c.text,
    fallbackFont: "Inter Tight",
    fallbackSize: "Medium",
    fallbackColor: "#a8a29e",
  });

  return (
    // Hero (pair with the Lead Form slice for the sign-up card)
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(
        "relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 font-sans",
        sectionPaddingClass,
      )}
      style={{
        backgroundColor: c.heroBg,
        ...sectionPaddingStyle(primary, "Large"),
      }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 xl:gap-24">
        {/* Product visual (after the text on phones, beside it on desktop) */}
        <div
          className={cn(
            "order-2 flex justify-center",
            imageRight ? "lg:order-2" : "lg:order-1",
          )}
        >
          <div className="relative w-full max-w-[560px] aspect-[4/3]">
            {showVinyl && (
              <div
                aria-hidden="true"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-[78%] aspect-[1/1] rounded-full",
                  imageRight ? "left-0" : "right-0",
                )}
                style={{
                  background: vinylBackground(c.vinyl, c.groove),
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="absolute inset-[33%] rounded-full flex flex-col items-center justify-center text-center leading-tight px-1"
                  style={{ backgroundColor: c.label, color: c.labelText }}
                >
                  {primary.vinyl_label_text && (
                    <span className="text-[clamp(0.55rem,1.6vw,0.85rem)] font-semibold">
                      {primary.vinyl_label_text}
                    </span>
                  )}
                  {primary.vinyl_label_subtext && (
                    <span className="mt-0.5 text-[clamp(0.45rem,1.2vw,0.65rem)] opacity-80">
                      {primary.vinyl_label_subtext}
                    </span>
                  )}
                  <span
                    className="absolute w-[6%] aspect-[1/1] rounded-full"
                    style={{ backgroundColor: c.vinyl }}
                  />
                </div>
              </div>
            )}
            <div
              className={cn(
                "absolute top-0 h-full z-10",
                showVinyl ? "w-[66%]" : "w-full",
                imageRight ? "right-0" : "left-0",
              )}
            >
              {isFilled.image(primary.product_image) ? (
                <PrismicNextImage
                  field={primary.product_image}
                  fill
                  sizes="(max-width: 1024px) 70vw, 380px"
                  className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
                  priority
                  fallbackAlt=""
                />
              ) : (
                <div
                  className="absolute inset-[6%] rounded-[6px] bg-[#ece4d8] -rotate-3 shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>

        {/* Text */}
        <div
          className={cn(
            "order-1 flex flex-col items-start",
            imageRight ? "lg:order-1" : "lg:order-2",
          )}
        >
          <BadgePill
            text={primary.badge_text || "Free lesson pack"}
            icon={primary.badge_icon}
            preset={primary.badge_icon_preset}
            bg={primary.badge_bg_color || "rgba(216, 93, 24, 0.16)"}
            textColor={primary.badge_text_color || "#e07b39"}
            iconColor={primary.badge_icon_color}
            borderColor={primary.badge_border_color}
            className="mb-5 sm:mb-6"
          />
          {isFilled.richText(primary.title) ? (
            <PrismicRichText
              field={primary.title}
              components={{
                heading1: ({ children }: any) => (
                  <h1 className={titleClass} style={titleTypo.style}>
                    {children}
                  </h1>
                ),
                heading2: ({ children }: any) => (
                  <h2 className={titleClass} style={titleTypo.style}>
                    {children}
                  </h2>
                ),
              }}
            />
          ) : (
            <h1 className={titleClass} style={titleTypo.style}>
              Get the complete lesson and tabs, free
            </h1>
          )}
          {isFilled.richText(primary.description) && (
            <div
              className={cn(
                introTypo.className,
                "mt-6 sm:mt-8 max-w-xl leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:underline",
              )}
              style={introTypo.style}
            >
              <PrismicRichText field={primary.description} />
            </div>
          )}
          {checklist.length > 0 && (
            <ul className="mt-6 sm:mt-8 flex flex-col gap-3">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-[1px] w-7 h-7 shrink-0 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: c.checkBg, color: c.check }}
                  >
                    <CheckIcon />
                  </span>
                  <span
                    className="text-[1rem] sm:text-[1.0625rem] leading-snug pt-[3px]"
                    style={{ color: c.listText }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <ButtonRow
            className="mt-8 sm:mt-10"
            buttons={primary.buttons}
            font={primary.button_font}
            radius={primary.button_radius}
            colors={{
              filledBg: primary.button_bg_color || "#d85d18",
              filledText: primary.button_text_color || "#ffffff",
              filledHoverBg: primary.button_hover_bg_color || "#b94c10",
              filledHoverText: primary.button_hover_text_color || "#ffffff",
              outlineColor: primary.outline_button_color || "#f3efe6",
              outlineHoverBg:
                primary.outline_button_hover_bg_color || "#f3efe6",
              outlineHoverText:
                primary.outline_button_hover_text_color || "#1c1917",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ProductHero;
