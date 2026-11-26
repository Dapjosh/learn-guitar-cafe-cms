import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextLink } from '@prismicio/next';
import { resolveHeadingTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

/**
 * Props for `ContactInfo`.
 */
export type ContactInfoProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const CardIcon = ({ name }: { name?: string | null }) => {
  switch (String(name || 'Email').toLowerCase()) {
    case 'community':
      return (
        <svg {...iconProps}>
          <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" />
          <path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" strokeWidth="2.2" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...iconProps}>
          <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />
        </svg>
      );
    case 'location':
      return (
        <svg {...iconProps}>
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...iconProps}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      );
    case 'link':
      return (
        <svg {...iconProps}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
          <path d="M4 6.5l8 6 8-6" />
        </svg>
      );
  }
};

const SocialIcon = ({ name }: { name: string }) => {
  const p = { ...iconProps, className: 'w-[22px] h-[22px]' };
  switch (name.toLowerCase()) {
    case 'youtube':
      return (
        <svg {...p}>
          <rect x="2.5" y="5" width="19" height="14" rx="4" />
          <path d="M10 9.2v5.6l4.8-2.8z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...p}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.2 6.8h.01" strokeWidth="2.4" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M13 21v-7.5h2.5M15.5 9H14a1.5 1.5 0 0 0-1.5 1.5V21M10.5 13.5h4" />
        </svg>
      );
    case 'x':
      return (
        <svg {...p}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...p}>
          <path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5M14 3.5c.5 2.5 2.4 4.3 5 4.5" />
        </svg>
      );
    case 'spotify':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7.5 9.5c3-1 6.5-.7 9 .8M8 12.6c2.5-.7 5.2-.5 7.3.7M8.6 15.5c2-.5 4-.3 5.6.6" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
      );
  }
};

const socialLabel = (name: string) =>
  ({ youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', x: 'X', tiktok: 'TikTok', spotify: 'Spotify' })[name.toLowerCase()] || 'Website';

/**
 * Component for "ContactInfo" Slices: centred header with badge, then cards for
 * email, phone, community/social links, location and more.
 */
const ContactInfo = ({ slice }: ContactInfoProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;
  const cards = (Array.isArray(primary.cards) ? primary.cards : []).filter((c: any) => c?.title);
  const socials = (Array.isArray(primary.social_links) ? primary.social_links : []).filter((s: any) => isFilled.link(s?.link));
  const isCentered = String(primary.header_alignment || 'Center').toLowerCase() === 'center';

  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    cardBg: primary.card_bg_color || '#fbf9f5',
    cardBorder: primary.card_border_color || '#e2d9cb',
    iconBg: primary.icon_bg_color || '#f8d5c0',
    icon: primary.icon_color || '#d85d18',
    cardTitle: primary.card_title_color || '#1c1917',
    cardText: primary.card_text_color || '#57534e',
    link: primary.link_color || '#d85d18',
    social: primary.social_icon_color || '#1c1917',
    socialHover: primary.social_icon_hover_color || '#d85d18',
  };

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const titleClass = cn(titleTypo.className, 'uppercase tracking-tight leading-[1.02]');
  const cardFont = resolveFontFamily(primary.card_title_font, 'Inter Tight');
  const cols = cards.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : cards.length === 2 ? 'sm:grid-cols-2' : '';

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className={cn('flex flex-col mb-10 sm:mb-12', isCentered ? 'items-center text-center max-w-3xl mx-auto' : 'items-start text-left max-w-3xl')}>
          <BadgePill
            text={primary.badge_text || 'Get in touch'}
            icon={primary.badge_icon}
            preset={primary.badge_icon_preset}
            bg={primary.badge_bg_color || '#ffffff'}
            textColor={primary.badge_text_color || '#d85d18'}
            iconColor={primary.badge_icon_color}
            borderColor={primary.badge_border_color}
            className="mb-5 sm:mb-6"
          />
          {isFilled.richText(primary.title) ? (
            <PrismicRichText
              field={primary.title}
              components={{
                heading1: ({ children }: any) => <h1 className={titleClass} style={titleTypo.style}>{children}</h1>,
                heading2: ({ children }: any) => <h2 className={titleClass} style={titleTypo.style}>{children}</h2>,
              }}
            />
          ) : (
            <h1 className={titleClass} style={titleTypo.style}>
              Have a question about lessons or tone?
            </h1>
          )}
          {isFilled.richText(primary.description) && (
            <div className="mt-5 max-w-2xl text-[1rem] sm:text-[1.125rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:underline" style={{ color: primary.description_color || '#78716c' }}>
              <PrismicRichText field={primary.description} />
            </div>
          )}
        </div>

        {cards.length > 0 && (
          <ul className={cn('grid grid-cols-1 gap-5 sm:gap-6 mx-auto', cols, cards.length <= 2 ? 'max-w-[824px]' : 'max-w-[1240px]')}>
            {cards.map((card: any, i: number) => {
              const email = String(card.email || '').trim();
              const phone = String(card.phone || '').trim();
              return (
                <li key={i} className="flex flex-col rounded-[14px] border p-6 sm:p-8" style={{ backgroundColor: c.cardBg, borderColor: c.cardBorder }}>
                  <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: c.iconBg, color: c.icon }}>
                    <CardIcon name={card.icon} />
                  </span>
                  <h2 className={cn(cardFont.className, 'mt-6 text-[1.375rem] sm:text-[1.5rem] leading-tight tracking-[-0.01em]')} style={{ fontFamily: cardFont.fontFamily, color: c.cardTitle }}>
                    {card.title}
                  </h2>
                  <div className="mt-3 flex flex-col gap-2 text-[1rem] sm:text-[1.0625rem] min-w-0">
                    {card.text && <p style={{ color: c.cardText }}>{card.text}</p>}
                    {email && (
                      <a href={`mailto:${email}`} className="break-all hover:underline underline-offset-4" style={{ color: c.link }}>
                        {email}
                      </a>
                    )}
                    {phone && (
                      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:underline underline-offset-4" style={{ color: c.link }}>
                        {phone}
                      </a>
                    )}
                    {isFilled.link(card.link) && (
                      <PrismicNextLink field={card.link} className="hover:underline underline-offset-4" style={{ color: c.link }}>
                        {card.link_label || 'Learn more'}
                      </PrismicNextLink>
                    )}
                    {card.show_social === true && socials.length > 0 && (
                      <ul className="flex flex-wrap items-center gap-4 pt-1" aria-label="Social links">
                        {socials.map((s: any, si: number) => (
                          <li key={si}>
                            <PrismicNextLink
                              field={s.link}
                              className="block transition-colors text-[color:var(--ci-social)] hover:text-[color:var(--ci-social-hover)]"
                              style={{ '--ci-social': c.social, '--ci-social-hover': c.socialHover } as React.CSSProperties}
                              aria-label={socialLabel(String(s.platform || 'Website'))}
                            >
                              <SocialIcon name={String(s.platform || 'Website')} />
                            </PrismicNextLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ContactInfo;
