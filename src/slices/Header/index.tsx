'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import defaultLogo from '@assets/lgc.png';
import { resolveFontFamily } from '@lgc_cms/util';
import cn from 'classnames';

import type { JSX } from 'react';

/**
 * Props for `Header`.
 */
export type HeaderProps = SliceComponentProps<any>;

/**
 * Component for "Header" Slice.
 */
const Header = ({ slice }: HeaderProps): JSX.Element => {
  const currentRoute = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const primary = (slice?.primary || {}) as any;

  // Header background & height
  const headerBg = primary.header_bg_color || '#f4eee5';
  const rawHeight = primary.header_height;
  const headerHeight =
    typeof rawHeight === 'number' && rawHeight > 0
      ? `${rawHeight}px`
      : '90px';
  const shouldBeSticky = primary.header_sticky ?? true;

  useEffect(() => {
    if (!shouldBeSticky) return;

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldBeSticky]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Logo Display Options: supports both slice.variation ('logoOnly', 'textOnly', 'default')
  // and primary.logo_display ('Logo Only', 'Text Only', 'Logo + Text')
  const isLogoOnly =
    slice?.variation === 'logoOnly' || primary.logo_display === 'Logo Only';
  const isTextOnly =
    slice?.variation === 'textOnly' || primary.logo_display === 'Text Only';
  const showLogo = !isTextOnly;
  const showText = !isLogoOnly;

  // Logo sizing: custom size/height & width from CMS, with proportional scaling fallback
  const rawLogoSize = primary.logo_size;
  const rawLogoWidth = primary.logo_width;
  const customLogoSize =
    typeof rawLogoSize === 'number' && rawLogoSize > 0 ? rawLogoSize : null;
  const customLogoWidth =
    typeof rawLogoWidth === 'number' && rawLogoWidth > 0 ? rawLogoWidth : null;

  const logoDimensions = isFilled.image(primary.logo_image)
    ? (primary.logo_image as any).dimensions
    : null;

  let logoHeight = customLogoSize || 40;
  let logoWidth = customLogoWidth || customLogoSize || 40;

  if (logoDimensions?.width && logoDimensions?.height) {
    const aspectRatio = logoDimensions.width / logoDimensions.height;
    if (!customLogoWidth) {
      logoWidth = Math.round(logoHeight * aspectRatio);
    }
  }

  const siteTitle = primary.site_title || 'PAUL GREIG';
  const siteName = primary.site_name || 'LEARN GUITAR CAFE';
  const siteNameFont = resolveFontFamily(primary.site_name_font, 'Fraunces');
  const siteTitleColor = primary.site_title_color || '#1c1917';
  const siteNameColor = primary.site_name_color || '#000000';

  // Navigation Links
  const defaultLinks = [
    { label: 'Home', url: '/' },
    { label: 'All courses', url: '/courses' },
    { label: 'Lessons & styles', url: '/lessons' },
    { label: 'Blog', url: '/blog' },
  ];

  let rawLinks: Array<{ label: string; url: string; prismicLink?: any }> = [];

  // Check primary.menu_items first
  if (Array.isArray(primary.menu_items) && primary.menu_items.length > 0) {
    rawLinks = primary.menu_items
      .map((item: any) => {
        const label =
          typeof item.label === 'string'
            ? item.label.trim()
            : item.label?.[0]?.text?.trim() || '';
        const url = item.link?.url || (typeof item.link === 'string' ? item.link : '#');
        return label ? { label, url, prismicLink: item.link } : null;
      })
      .filter(Boolean);
  } else if (Array.isArray(slice?.items) && slice.items.length > 0) {
    // Check slice.items next
    rawLinks = slice.items
      .map((item: any) => {
        const label =
          typeof item.label === 'string'
            ? item.label.trim()
            : item.label?.[0]?.text?.trim() || '';
        const url = item.link?.url || (typeof item.link === 'string' ? item.link : '#');
        return label ? { label, url, prismicLink: item.link } : null;
      })
      .filter(Boolean);
  }

  const navLinks = rawLinks.length > 0 ? rawLinks : defaultLinks;

  // Menu Typography & Colors (Default: Inter Tight)
  const menuFont = resolveFontFamily(primary.menu_font, 'Inter Tight');
  const menuTextColor = primary.menu_text_color || '#2b2b2b';
  const menuActiveColor = primary.menu_active_color || '#d85d18';
  const menuHoverColor = primary.menu_hover_color || '#d85d18';

  // Button Typography & Radius (Default: Inter Tight Medium)
  const buttonFont = resolveFontFamily(primary.button_font, 'Inter Tight');
  let buttonRadiusClass = 'rounded-md';
  if (primary.button_radius) {
    const r = String(primary.button_radius).toLowerCase();
    if (r.includes('sharp') || r.includes('none') || r.includes('square')) {
      buttonRadiusClass = 'rounded-none';
    } else if (r.includes('pill') || r.includes('full')) {
      buttonRadiusClass = 'rounded-full';
    } else if (r.includes('large') || r.includes('lg')) {
      buttonRadiusClass = 'rounded-lg';
    } else if (r.includes('small') || r.includes('sm')) {
      buttonRadiusClass = 'rounded-sm';
    } else if (
      r.includes('medium') ||
      r.includes('md') ||
      r.includes('rounded')
    ) {
      buttonRadiusClass = 'rounded-md';
    }
  }

  // 1. Login / Secondary Button Styling
  const loginLabel = primary.login_button_label || 'Login';
  const loginLink = primary.login_button_link;
  const loginBg = primary.login_button_bg_color || 'transparent';
  const loginText = primary.login_button_text_color || '#1c1917';
  const loginBorder = primary.login_button_border_color || 'rgba(0, 0, 0, 0.25)';
  const loginHoverBg = primary.login_button_hover_bg_color || 'rgba(0, 0, 0, 0.05)';
  const loginHoverText = primary.login_button_hover_text_color || loginText;
  const loginHoverBorder =
    primary.login_button_hover_border_color || 'rgba(0, 0, 0, 0.5)';

  // 2. CTA / Primary Button Styling
  const ctaLabel = primary.cta_button_label || 'Free starter pack';
  const ctaLink = primary.cta_button_link;
  const ctaBg = primary.cta_button_bg_color || '#1c1917';
  const ctaText = primary.cta_button_text_color || '#ffffff';
  const ctaHoverBg = primary.cta_button_hover_bg_color || '#000000';
  const ctaHoverText = primary.cta_button_hover_text_color || '#ffffff';
  const ctaHasArrow = primary.cta_button_has_arrow ?? true;

  // Custom CSS variables for hover styling without Tailwind JIT interference
  const loginStyleProps: React.CSSProperties = {
    fontFamily: buttonFont.fontFamily,
    fontWeight: 500,
    backgroundColor: loginBg,
    color: loginText,
    borderColor: loginBorder,
    '--btn-hover-bg': loginHoverBg,
    '--btn-hover-text': loginHoverText,
    '--btn-hover-border': loginHoverBorder,
  } as React.CSSProperties;

  const ctaStyleProps: React.CSSProperties = {
    fontFamily: buttonFont.fontFamily,
    fontWeight: 500,
    backgroundColor: ctaBg,
    color: ctaText,
    borderColor: ctaBg,
    '--btn-hover-bg': ctaHoverBg,
    '--btn-hover-text': ctaHoverText,
    '--btn-hover-border': ctaHoverBg,
  } as React.CSSProperties;

  return (
    <header
      data-slice-type={slice?.slice_type || 'header'}
      data-slice-variation={slice?.variation || 'default'}
      className={cn(
        'w-full z-40 transition-all duration-200',
        shouldBeSticky && 'sticky top-0',
        isSticky && 'shadow-sm'
      )}
      style={{ backgroundColor: headerBg }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <nav
          className="flex items-center justify-between py-4 sm:py-5 lg:py-6"
          style={{ minHeight: headerHeight }}
        >
          {/* Brand Logo & Name (Left side) */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
            aria-label={`${siteTitle} ${siteName}`}
          >
            {showLogo && (
              <div
                className="relative shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  width: `${logoWidth}px`,
                  height: `${logoHeight}px`,
                }}
              >
                {isFilled.image(primary.logo_image) ? (
                  <PrismicNextImage
                    field={primary.logo_image}
                    fill
                    sizes={`${logoWidth}px`}
                    className="object-contain"
                    alt={siteName || ''}
                    priority
                  />
                ) : (
                  <Image
                    src={defaultLogo}
                    fill
                    sizes={`${logoWidth}px`}
                    className="object-contain"
                    alt={siteName || ''}
                    priority
                  />
                )}
              </div>
            )}

            {showText && (
              <div className="flex flex-col text-left justify-center">
                {siteTitle && (
                  <span
                    className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase leading-tight font-sans"
                    style={{ color: siteTitleColor }}
                  >
                    {siteTitle}
                  </span>
                )}
                {siteName && (
                  <span
                    className={cn(
                      'text-sm sm:text-base font-black tracking-[-0.02em] uppercase leading-none',
                      siteNameFont.className
                    )}
                    style={{
                      fontFamily: siteNameFont.fontFamily,
                      color: siteNameColor,
                    }}
                  >
                    {siteName}
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* Center Navigation Links (Between Left and Right) */}
          <ul className="hidden md:flex items-center justify-center gap-6 lg:gap-8 grow px-4">
            {navLinks.map((item, idx) => {
              const isActive =
                item.url === currentRoute ||
                (item.url === '/' &&
                  (currentRoute === '/' || currentRoute === ''));

              return (
                <li key={`header-nav-${idx}`}>
                  <Link
                    href={item.url}
                    className={cn(
                      'text-[15px] transition-colors py-2 block font-medium',
                      menuFont.className,
                      isActive ? 'font-semibold' : 'hover:opacity-80'
                    )}
                    style={{
                      fontFamily: menuFont.fontFamily,
                      color: isActive ? menuActiveColor : menuTextColor,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons (Right side) */}
          <div className="hidden md:flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {/* Login / Secondary Button */}
            {loginLabel && (
              isFilled.link(loginLink) ? (
                <PrismicNextLink
                  field={loginLink}
                  className={cn(
                    'slice-custom-btn border px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium transition-all text-center inline-flex items-center justify-center',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={loginStyleProps}
                >
                  {loginLabel}
                </PrismicNextLink>
              ) : (
                <Link
                  href="/sign-in"
                  className={cn(
                    'slice-custom-btn border px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium transition-all text-center inline-flex items-center justify-center',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={loginStyleProps}
                >
                  {loginLabel}
                </Link>
              )
            )}

            {/* CTA / Primary Button */}
            {ctaLabel && (
              isFilled.link(ctaLink) ? (
                <PrismicNextLink
                  field={ctaLink}
                  className={cn(
                    'slice-custom-btn group border inline-flex items-center justify-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium shadow-sm hover:shadow transition-all text-center',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={ctaStyleProps}
                >
                  <span>{ctaLabel}</span>
                  {ctaHasArrow && (
                    <svg
                      className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </PrismicNextLink>
              ) : (
                <Link
                  href="/sign-up"
                  className={cn(
                    'slice-custom-btn group border inline-flex items-center justify-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium shadow-sm hover:shadow transition-all text-center',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={ctaStyleProps}
                >
                  <span>{ctaLabel}</span>
                  {ctaHasArrow && (
                    <svg
                      className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </Link>
              )
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="p-2 text-[#1c1917] hover:text-[#d85d18] focus:outline-none rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t border-black/10 py-5 px-2 flex flex-col gap-4 animate-in fade-in duration-200"
            style={{ backgroundColor: headerBg }}
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((item, idx) => {
                const isActive =
                  item.url === currentRoute ||
                  (item.url === '/' &&
                    (currentRoute === '/' || currentRoute === ''));

                return (
                  <li key={`mobile-nav-${idx}`}>
                    <Link
                      href={item.url}
                      onClick={closeMenu}
                      className={cn(
                        'text-base py-2 px-3 rounded-md transition-colors block font-medium',
                        menuFont.className
                      )}
                      style={{
                        fontFamily: menuFont.fontFamily,
                        color: isActive ? menuActiveColor : menuTextColor,
                        backgroundColor: isActive
                          ? 'rgba(216, 93, 24, 0.08)'
                          : 'transparent',
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-black/10">
              {loginLabel && (
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className={cn(
                    'slice-custom-btn border px-5 py-2.5 text-sm font-medium transition-all text-center block w-full',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={loginStyleProps}
                >
                  {loginLabel}
                </Link>
              )}
              {ctaLabel && (
                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className={cn(
                    'slice-custom-btn border inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium shadow-sm transition-all text-center w-full',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={ctaStyleProps}
                >
                  <span>{ctaLabel}</span>
                  {ctaHasArrow && (
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
