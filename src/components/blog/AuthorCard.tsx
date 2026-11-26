import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { resolveFontFamily, cn } from '@lgc_cms/util';

export type AuthorLink = { label: string; link: any; icon?: string | null };

export type AuthorInfo = {
  name: string;
  role?: string | null;
  bio?: any; // rich text
  image?: any;
  links: AuthorLink[];
};

export type AuthorCardStyle = {
  layout?: 'card' | 'compact';
  label?: string | null; // e.g. "Written by"
  cardBg?: string | null;
  cardBorder?: string | null;
  labelColor?: string | null;
  nameColor?: string | null;
  textColor?: string | null;
  linkColor?: string | null;
  linkBorderColor?: string | null;
  linkHoverColor?: string | null;
  nameFont?: string | null;
  showLinks?: boolean;
  showImage?: boolean;
};

/** Reads an Author document (or its fetched link data) into AuthorInfo. */
export function authorFromData(data: any): AuthorInfo | null {
  if (!data?.name) return null;
  return {
    name: data.name,
    role: data.role || null,
    bio: data.bio,
    image: isFilled.image(data.profile_image) ? data.profile_image : null,
    links: (Array.isArray(data.links) ? data.links : [])
      .filter((l: any) => l?.label && isFilled.link(l?.link))
      .map((l: any) => ({ label: l.label, link: l.link, icon: l.icon })),
  };
}

const LinkIcon = ({ name }: { name?: string | null }) => {
  const n = String(name || 'Arrow').toLowerCase();
  if (n === 'none') return null;
  if (n === 'youtube' || n === 'play') {
    return (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M8.5 7.3v5.4l4.2-2.7z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (n === 'external') {
    return (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M11 4h5v5M16 4l-7 7M14 11v4.5H4.5V6H9" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
};

const Avatar = ({ author, size }: { author: AuthorInfo; size: number }) => (
  <span
    className="relative shrink-0 rounded-full overflow-hidden bg-[#e7dfd2] flex items-center justify-center text-[#57534e] font-semibold"
    style={{ width: size, height: size, fontSize: size / 3 }}
  >
    {author.image ? (
      <PrismicNextImage field={author.image} fill sizes={`${size * 2}px`} className="object-cover" alt="" />
    ) : (
      <span aria-hidden="true">
        {author.name
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p[0])
          .join('')}
      </span>
    )}
  </span>
);

/**
 * Author card: "card" (avatar left, name in a serif, bio and link buttons)
 * or "compact" (single row with name, bio and outline buttons on the right).
 */
export const AuthorCard = ({ author, style = {} }: { author: AuthorInfo; style?: AuthorCardStyle }) => {
  const layout = style.layout || 'card';
  const nameFont = resolveFontFamily(style.nameFont, layout === 'card' ? 'Fraunces' : 'Inter Tight');
  const showLinks = style.showLinks !== false && author.links.length > 0;
  const showImage = style.showImage !== false;
  const colors = {
    bg: style.cardBg || '#fbf9f5',
    border: style.cardBorder || 'transparent',
    label: style.labelColor || '#78716c',
    name: style.nameColor || '#1c1917',
    text: style.textColor || '#57534e',
    link: style.linkColor || '#1c1917',
    linkBorder: style.linkBorderColor || (layout === 'card' ? '#d6cdbf' : '#1c1917'),
    linkHover: style.linkHoverColor || '#d85d18',
  };

  const bio = isFilled.richText(author.bio) ? (
    <div className="[&_p]:mb-2 [&_p:last-child]:mb-0" style={{ color: colors.text }}>
      <PrismicRichText field={author.bio} />
    </div>
  ) : null;

  const linkStyle = { color: colors.link, borderColor: colors.linkBorder, '--author-link-hover': colors.linkHover } as React.CSSProperties;

  if (layout === 'compact') {
    return (
      <div
        className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 rounded-[12px] border px-5 sm:px-6 py-5"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {showImage && author.image && <Avatar author={author} size={48} />}
          <div className="min-w-0 text-sm leading-relaxed">
            <p className={cn(nameFont.className, 'text-[1rem] font-semibold')} style={{ fontFamily: nameFont.fontFamily, color: colors.name }}>
              {author.name}
            </p>
            {bio && <div className="mt-1 max-w-xl">{bio}</div>}
          </div>
        </div>
        {showLinks && (
          <ul className="flex flex-wrap gap-3 shrink-0">
            {author.links.map((l, i) => (
              <li key={i}>
                <PrismicNextLink
                  field={l.link}
                  className="group inline-flex items-center gap-2 rounded-md border h-11 px-4 text-sm transition-colors hover:!text-[color:var(--author-link-hover)] hover:!border-[color:var(--author-link-hover)]"
                  style={linkStyle}
                >
                  {l.label}
                  <LinkIcon name={l.icon} />
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 rounded-[12px] border p-6 sm:p-8"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      {showImage && <Avatar author={author} size={88} />}
      <div className="min-w-0 flex-1">
        {style.label !== '' && (
          <p className="text-xs sm:text-sm mb-1" style={{ color: colors.label }}>
            {style.label ?? 'Written by'}
          </p>
        )}
        <p className={cn(nameFont.className, 'text-[1.75rem] sm:text-[2rem] leading-tight tracking-[-0.01em]')} style={{ fontFamily: nameFont.fontFamily, color: colors.name }}>
          {author.name}
        </p>
        {author.role && (
          <p className="text-sm mt-1" style={{ color: colors.label }}>
            {author.role}
          </p>
        )}
        {bio && <div className="mt-3 text-sm sm:text-[0.95rem] leading-relaxed">{bio}</div>}
        {showLinks && (
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-3">
            {author.links.map((l, i) => (
              <li key={i}>
                <PrismicNextLink
                  field={l.link}
                  className="group inline-flex items-center gap-2 border-b-2 pb-1.5 pr-1 text-sm transition-colors hover:!text-[color:var(--author-link-hover)] hover:!border-[color:var(--author-link-hover)]"
                  style={linkStyle}
                >
                  {l.label}
                  <LinkIcon name={l.icon} />
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
