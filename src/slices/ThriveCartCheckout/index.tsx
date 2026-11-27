import React from 'react';
import { asLink, asText, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { resolveHeadingTypography, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import {
  sectionPaddingClass,
  sectionPaddingStyle,
} from '@components/slice-ui/section-style';
import { parseThriveCartEmbed } from './thrivecart';
import { ThriveCartEmbed } from './ThriveCartEmbed';

import type { JSX } from 'react';

/**
 * Props for `ThriveCartCheckout`.
 */
export type ThriveCartCheckoutProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const widths: Record<string, string> = {
  narrow: 'max-w-[560px]',
  medium: 'max-w-[760px]',
  wide: 'max-w-[1040px]',
};

/**
 * Component for "ThriveCartCheckout" Slices: header + a ThriveCart checkout
 * (embedded form or popup button) built from the embed code pasted in Prismic.
 */
const ThriveCartCheckout = ({
  slice,
}: ThriveCartCheckoutProps): JSX.Element | null => {
  const primary = (slice?.primary || {}) as any;
  // The embed code is pasted into a preformatted rich text field (or a plain text field)
  const code =
    typeof primary.embed_code === 'string'
      ? primary.embed_code
      : asText(primary.embed_code || [], { separator: '\n' });
  const embed = parseThriveCartEmbed(code);
  const isDev = process.env.NODE_ENV !== 'production';
  if (!embed && !isDev) return null;

  const isCentered =
    String(primary.header_alignment || 'Center').toLowerCase() === 'center';
  const width =
    widths[String(primary.width || 'Medium').toLowerCase()] || widths.medium;
  const fallbackHref = isFilled.link(primary.checkout_url)
    ? (asLink(primary.checkout_url) as string | null)
    : null;
  const showCard = primary.show_card !== false;

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const titleClass = cn(
    titleTypo.className,
    'uppercase tracking-tight leading-[1.02]'
  );
  const buttonBg = primary.button_bg_color || '#d85d18';
  const buttonStyle = {
    '--btn-bg': buttonBg,
    '--btn-text': primary.button_text_color || '#ffffff',
    '--btn-border': buttonBg,
    '--btn-hover-bg': primary.button_hover_bg_color || '#b94c10',
    '--btn-hover-text': primary.button_hover_text_color || '#ffffff',
    '--btn-hover-border': primary.button_hover_bg_color || '#b94c10',
  } as React.CSSProperties;

  return (
    <section
      id={primary.anchor_id || 'checkout'}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(
        'w-full px-4 sm:px-6 lg:px-8 font-sans scroll-mt-24',
        sectionPaddingClass
      )}
      style={{
        backgroundColor: primary.section_bg_color || '#f3efe6',
        ...sectionPaddingStyle(primary, 'Large'),
      }}
    >
      <div className={cn('mx-auto', width)}>
        {(primary.badge_text ||
          isFilled.richText(primary.title) ||
          isFilled.richText(primary.description)) && (
          <div
            className={cn(
              'flex flex-col mb-8 sm:mb-10',
              isCentered ? 'items-center text-center' : 'items-start text-left'
            )}
          >
            <BadgePill
              text={primary.badge_text}
              icon={primary.badge_icon}
              preset={primary.badge_icon_preset}
              bg={primary.badge_bg_color || '#ffffff'}
              textColor={primary.badge_text_color || '#d85d18'}
              iconColor={primary.badge_icon_color}
              borderColor={primary.badge_border_color}
              className="mb-5"
            />
            {isFilled.richText(primary.title) && (
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
            )}
            {isFilled.richText(primary.description) && (
              <div
                className="mt-4 text-[1rem] sm:text-[1.0625rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
                style={{ color: primary.description_color || '#78716c' }}
              >
                <PrismicRichText field={primary.description} />
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            showCard &&
              'rounded-[14px] border p-4 sm:p-6 shadow-[0_24px_60px_-30px_rgba(28,25,23,0.3)]',
            embed?.mode === 'popup' && 'flex justify-center'
          )}
          style={
            showCard
              ? {
                  backgroundColor: primary.card_bg_color || '#ffffff',
                  borderColor: primary.card_border_color || '#e7dfd2',
                }
              : undefined
          }
        >
          {embed ? (
            <ThriveCartEmbed
              embed={embed}
              buttonLabel={primary.button_label || 'Buy now'}
              buttonStyle={buttonStyle}
              fallbackHref={fallbackHref}
            />
          ) : (
            <p className="py-10 text-center text-sm text-[#a8a29e]">
              ThriveCart checkout: paste the embed code from ThriveCart
              (Checkouts → Embed) into this slice.
            </p>
          )}
        </div>

        {primary.fine_print && (
          <p
            className="mt-4 flex items-center justify-center gap-2 text-center text-xs sm:text-sm"
            style={{ color: primary.description_color || '#78716c' }}
          >
            {primary.show_lock_icon !== false && (
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              </svg>
            )}
            {primary.fine_print}
          </p>
        )}
      </div>
    </section>
  );
};

export default ThriveCartCheckout;
