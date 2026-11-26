import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';
import defaultLogo from '@assets/logo.png';

import { RetroStripes } from '../ContentImageSlice/shared';
import { NewsletterForm } from './NewsletterForm';

import type { JSX } from 'react';

/**
 * Props for `Footer`.
 */
export type FooterProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

type FooterLink = { label: string; link: any };

const fallbackColumns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Explore',
    links: ['The Course', 'Our Story', 'Pricing', 'Blog', 'Contact'].map((label) => ({ label, link: null })),
  },
  {
    heading: 'Follow',
    links: ['YouTube', 'Instagram', 'Facebook'].map((label) => ({ label, link: null })),
  },
];

const fallbackLegal: FooterLink[] = ['Terms', 'Privacy', 'Cookies'].map((label) => ({ label, link: null }));

const newsletterHeadingSizes: Record<string, string> = {
  small: 'text-xl sm:text-2xl',
  medium: 'text-2xl sm:text-[1.75rem] lg:text-[2rem]',
  large: 'text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem]',
};

/** Renders a CMS link, or plain text when the link is empty (e.g. while setting up). */
const FooterAnchor = ({
  item,
  className,
  style,
}: {
  item: FooterLink;
  className?: string;
  style?: React.CSSProperties;
}) =>
  isFilled.link(item.link) ? (
    <PrismicNextLink field={item.link} className={className} style={style}>
      {item.label}
    </PrismicNextLink>
  ) : (
    <span className={className} style={style}>
      {item.label}
    </span>
  );

/**
 * Component for "Footer" Slices. Used site-wide via the `footer` single
 * custom type, rendered from the public layout.
 */
const Footer = ({ slice }: FooterProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;

  // ---- Colours ----
  const sectionBg = primary.background_color || '#1c1917';
  const taglineColor = primary.tagline_color || '#a8a29e';
  const columnHeadingColor = primary.column_heading_color || '#e07b39';
  const linkColor = primary.link_color || '#fafaf9';
  const linkHoverColor = primary.link_hover_color || '#e07b39';
  const dividerColor = primary.divider_color || 'rgba(255, 255, 255, 0.12)';
  const bottomTextColor = primary.bottom_text_color || '#8a8580';

  // ---- Typography ----
  const bodyFont = resolveFontFamily(primary.body_font, 'Inter Tight');
  const linkFont = resolveFontFamily(primary.link_font, 'Inter Tight');
  const nlHeadingFont = resolveFontFamily(primary.newsletter_heading_font, 'Fraunces');
  const nlHeadingSize =
    newsletterHeadingSizes[(primary.newsletter_heading_size || 'Medium').toLowerCase()] ||
    newsletterHeadingSizes.medium;

  // ---- Logo ----
  const logoWidth =
    typeof primary.logo_width === 'number' && primary.logo_width > 0 ? Math.min(primary.logo_width, 320) : 96;

  // ---- Link columns (each link picks its column) ----
  const cmsLinks: (FooterLink & { column: string })[] = (Array.isArray(primary.links) ? primary.links : [])
    .filter((l: any) => l?.label)
    .map((l: any) => ({ label: l.label, link: l.link, column: String(l.column || 'Column 1') }));
  const columns =
    cmsLinks.length > 0
      ? [1, 2, 3]
          .map((n) => ({
            heading: primary[`column_${n}_heading`] || '',
            links: cmsLinks.filter((l) => l.column.endsWith(String(n))),
          }))
          .filter((c) => c.links.length > 0)
      : fallbackColumns;

  const cmsLegal: FooterLink[] = (Array.isArray(primary.legal_links) ? primary.legal_links : [])
    .filter((l: any) => l?.label)
    .map((l: any) => ({ label: l.label, link: l.link }));
  const legalLinks = cmsLegal.length > 0 ? cmsLegal : fallbackLegal;

  // "{year}" in the copyright text is replaced with the current year
  const copyright = (primary.copyright_text || '© {year} Learn Guitar Cafe. All rights reserved.').replace(
    /\{year\}/gi,
    String(new Date().getFullYear())
  );

  // ---- Newsletter ----
  const showNewsletter = primary.show_newsletter !== false;

  const linkStyle = {
    fontFamily: linkFont.fontFamily,
    color: linkColor,
    '--footer-link-hover': linkHoverColor,
  } as React.CSSProperties;
  const linkClass = cn(
    linkFont.className,
    'text-sm sm:text-[0.95rem] font-semibold transition-colors duration-200 hover:!text-[color:var(--footer-link-hover)] focus:outline-none focus-visible:underline'
  );

  return (
    <footer
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full', bodyFont.className)}
      style={{ backgroundColor: sectionBg, fontFamily: bodyFont.fontFamily }}
    >
      {primary.show_top_stripes !== false && (
        <RetroStripes stripes={primary.stripes} gap={primary.stripe_gap} gapColor={primary.stripe_gap_color} />
      )}

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 lg:pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-10 gap-y-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block" aria-label="Home">
              {isFilled.image(primary.logo) ? (
                <PrismicNextImage
                  field={primary.logo}
                  style={{ width: logoWidth, height: 'auto' }}
                  sizes={`${logoWidth}px`}
                  fallbackAlt=""
                />
              ) : (
                <Image src={defaultLogo} alt="Learn Guitar Cafe" style={{ width: logoWidth, height: 'auto' }} />
              )}
            </Link>
            <div
              className="mt-6 sm:mt-8 max-w-sm text-[0.95rem] sm:text-[1.05rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
              style={{ color: taglineColor }}
            >
              {isFilled.richText(primary.tagline) ? (
                <PrismicRichText field={primary.tagline} />
              ) : (
                <p>Online slide &amp; roots guitar lessons with Paul Greig, for players who want tone and feel.</p>
              )}
            </div>
          </div>

          {/* Link columns */}
          {columns.length > 0 && (
            <nav aria-label="Footer" className="lg:col-span-4 lg:pl-8 xl:pl-12">
              <div className="flex flex-wrap gap-x-14 gap-y-10 lg:gap-x-16">
                {columns.map((col, ci) => (
                  <div key={ci} className="min-w-0">
                    {col.heading && (
                      <p className="text-sm sm:text-[0.95rem] mb-4" style={{ color: columnHeadingColor }}>
                        {col.heading}
                      </p>
                    )}
                    <ul className="flex flex-col gap-3.5">
                      {col.links.map((item, li) => (
                        <li key={li}>
                          <FooterAnchor item={item} className={linkClass} style={linkStyle} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          )}

          {/* Newsletter */}
          {showNewsletter && (
            <div className="md:col-span-2 lg:col-span-4 md:max-w-md lg:max-w-none">
              <h2
                className={cn(nlHeadingFont.className, nlHeadingSize, 'leading-tight tracking-[-0.01em]')}
                style={{
                  fontFamily: nlHeadingFont.fontFamily,
                  color: primary.newsletter_heading_color || '#f5f0e8',
                }}
              >
                {primary.newsletter_heading || 'Stay in the groove'}
              </h2>
              <p
                className="mt-3 mb-6 text-sm sm:text-[0.95rem] leading-relaxed"
                style={{ color: primary.newsletter_text_color || taglineColor }}
              >
                {primary.newsletter_text || 'Tone tips and new lessons, about once a month.'}
              </p>
              <NewsletterForm
                placeholder={primary.newsletter_placeholder || 'Email address'}
                buttonLabel={primary.newsletter_button_label || 'Subscribe'}
                successMessage={primary.newsletter_success_message || 'Thanks! You’re on the list.'}
                groupId={primary.mailerlite_group_id}
                inputBg={primary.input_bg_color || '#26221f'}
                inputBorder={primary.input_border_color || 'rgba(255, 255, 255, 0.14)'}
                inputText={primary.input_text_color || '#f5f0e8'}
                buttonBg={primary.newsletter_button_bg_color || '#d85d18'}
                buttonText={primary.newsletter_button_text_color || '#ffffff'}
                buttonHoverBg={primary.newsletter_button_hover_bg_color || '#b94c10'}
                buttonHoverText={primary.newsletter_button_hover_text_color || '#ffffff'}
                fontFamily={bodyFont.fontFamily}
                fontClass={bodyFont.className}
              />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 lg:mt-16 pt-6 sm:pt-8 border-t flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: dividerColor }}
        >
          <p className="text-xs sm:text-sm" style={{ color: bottomTextColor }}>
            {copyright}
          </p>
          {legalLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {legalLinks.map((item, i) => (
                <li key={i}>
                  <FooterAnchor
                    item={item}
                    className="text-xs sm:text-sm transition-colors duration-200 hover:!text-[color:var(--footer-link-hover)]"
                    style={{ color: bottomTextColor, '--footer-link-hover': linkHoverColor } as React.CSSProperties}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
