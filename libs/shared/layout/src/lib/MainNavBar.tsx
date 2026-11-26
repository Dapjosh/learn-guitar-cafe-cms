'use client';

import React, { useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavigationDocumentData } from '../../../../../prismicio-types';
import cn from 'classnames';
import { asText, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { resolveFontFamily } from '@lgc_cms/util';

interface HeaderProps {
  navigation?: NavigationDocumentData | null;
  logo: StaticImageData;
  children?: React.ReactNode;
}

export function MainNavbar({ navigation, logo, children }: HeaderProps) {
  const currentRoute = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const elementId = document.getElementById('navbar');

    const handleScroll = () => {
      if (window.scrollY > 10) {
        elementId?.classList.add('isSticky');
      } else {
        elementId?.classList.remove('isSticky');
      }
    };

    handleScroll();
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Default links matching the design mockup if not populated in Prismic
  const defaultLinks = [
    { label: 'Home', url: '/' },
    { label: 'All courses', url: '/courses' },
    { label: 'Lessons & styles', url: '/lessons' },
    { label: 'Blog', url: '/blog' },
  ];

  const cmsLinks =
    navigation?.links && navigation.links.length > 0
      ? navigation.links
          .map((item) => {
            const label = asText(item.label)?.trim();
            const url = (item.link as { url?: string })?.url || '#';
            return label ? { label, url } : null;
          })
          .filter(Boolean)
      : [];

  const navLinks =
    cmsLinks.length > 0
      ? (cmsLinks as Array<{ label: string; url: string }>)
      : defaultLinks;

  // Login and CTA button configuration (editable via CMS with fallbacks)
  const loginLabel = (navigation as any)?.login_label || 'Login';
  const loginUrl =
    ((navigation as any)?.login_link as { url?: string })?.url || '/sign-in';

  const ctaLabel = (navigation as any)?.cta_label || 'Free starter pack';
  const ctaUrl =
    ((navigation as any)?.cta_link as { url?: string })?.url || '/sign-up';

  // Logo Display Options: 'Logo + Text' | 'Logo Only' | 'Text Only'
  const logoDisplay = (navigation as any)?.logo_display || 'Logo + Text';
  const showLogo = logoDisplay !== 'Text Only';
  const showText = logoDisplay !== 'Logo Only';

  // Logo sizing: custom size/height & width from CMS, with proportional scaling fallback
  const rawLogoSize = (navigation as any)?.logo_size;
  const rawLogoWidth = (navigation as any)?.logo_width;
  const customLogoSize =
    typeof rawLogoSize === 'number' && rawLogoSize > 0 ? rawLogoSize : null;
  const customLogoWidth =
    typeof rawLogoWidth === 'number' && rawLogoWidth > 0 ? rawLogoWidth : null;

  const logoDimensions = isFilled.image((navigation as any)?.logo_image)
    ? ((navigation as any).logo_image as any).dimensions
    : null;

  let logoHeight = customLogoSize || 40;
  let logoWidth = customLogoWidth || customLogoSize || 40;

  if (logoDimensions?.width && logoDimensions?.height) {
    const aspectRatio = logoDimensions.width / logoDimensions.height;
    if (!customLogoWidth) {
      logoWidth = Math.round(logoHeight * aspectRatio);
    }
  }

  const siteTitle = (navigation as any)?.site_title || 'PAUL GREIG';
  const siteName = (navigation as any)?.site_name || 'LEARN GUITAR CAFE';
  const siteNameColor = (navigation as any)?.site_name_color || '#000000';
  const siteTitleColor = (navigation as any)?.site_title_color || '#1c1917';

  // Brand text sizes from CMS ("Small" = the original sizes; smaller on phones)
  const siteTitleSizes: Record<string, string> = {
    small: 'text-[10px] sm:text-[11px]',
    medium: 'text-[11px] sm:text-[13px]',
    large: 'text-[12px] sm:text-[15px]',
    'extra large': 'text-[13px] sm:text-[17px]',
  };
  const siteNameSizes: Record<string, string> = {
    small: 'text-sm sm:text-[1rem]',
    medium: 'text-[1rem] sm:text-[1.25rem]',
    large: 'text-[1.125rem] sm:text-[1.5rem]',
    'extra large': 'text-[1.25rem] sm:text-[1.75rem]',
  };
  const siteTitleSize =
    siteTitleSizes[String((navigation as any)?.site_title_size || 'Medium').toLowerCase()] || siteTitleSizes.medium;
  const siteNameSize =
    siteNameSizes[String((navigation as any)?.site_name_size || 'Medium').toLowerCase()] || siteNameSizes.medium;

  // Configurable navbar height and background from CMS
  const rawNavbarHeight = (navigation as any)?.navbar_height;
  const navbarHeight =
    typeof rawNavbarHeight === 'number' && rawNavbarHeight > 0
      ? `${rawNavbarHeight}px`
      : '90px';
  const navbarBg = (navigation as any)?.navbar_bg_color || '#f4eee5';

  // Configurable fonts from CMS (Defaults: Fraunces for site name, Inter Tight for menu and buttons)
  const siteNameFont = resolveFontFamily(
    (navigation as any)?.site_name_font,
    'Fraunces'
  );
  const siteTitleFont = resolveFontFamily((navigation as any)?.site_title_font, 'Inter Tight');
  const menuFont = resolveFontFamily((navigation as any)?.menu_font, 'Inter Tight');
  const menuActiveColor = (navigation as any)?.menu_active_color || '#d85d18';
  const buttonFont = resolveFontFamily(
    (navigation as any)?.button_font,
    'Inter Tight'
  );

  // Configurable button border radius (from CMS or fallback to rounded-md)
  const rawRadius = (navigation as any)?.button_radius;
  let buttonRadiusClass = 'rounded-md';
  if (rawRadius) {
    const r = String(rawRadius).toLowerCase();
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

  // Button colors & hover configuration from CMS
  const loginBg = (navigation as any)?.login_button_bg_color || 'transparent';
  const loginText = (navigation as any)?.login_button_text_color || '#1c1917';
  const loginHoverBg =
    (navigation as any)?.login_button_hover_bg_color || 'rgba(0, 0, 0, 0.05)';
  const loginHoverText =
    (navigation as any)?.login_button_hover_text_color || loginText;

  const ctaBg = (navigation as any)?.cta_button_bg_color || '#1c1917';
  const ctaText = (navigation as any)?.cta_button_text_color || '#ffffff';
  const ctaHoverBg =
    (navigation as any)?.cta_button_hover_bg_color || '#000000';
  const ctaHoverText =
    (navigation as any)?.cta_button_hover_text_color || '#ffffff';

  const loginStyleProps: React.CSSProperties = {
    fontFamily: buttonFont.fontFamily,
    fontWeight: 500,
    backgroundColor: loginBg,
    color: loginText,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    '--btn-hover-bg': loginHoverBg,
    '--btn-hover-text': loginHoverText,
    '--btn-hover-border': 'rgba(0, 0, 0, 0.5)',
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
    <div
      id="navbar"
      className="navbar-area sticky top-0 w-full z-40 transition-all duration-200"
      style={{ backgroundColor: navbarBg }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <nav
          className="flex items-center justify-between py-4 sm:py-5 lg:py-6"
          style={{ minHeight: navbarHeight }}
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
                {isFilled.image((navigation as any)?.logo_image) ? (
                  <PrismicNextImage
                    field={(navigation as any).logo_image}
                    fill
                    sizes={`${logoWidth}px`}
                    className="object-contain"
                    alt={siteName || ''}
                    priority
                  />
                ) : (
                  <Image
                    src={logo}
                    fill
                    sizes={`${logoWidth}px`}
                    className="object-contain"
                    alt=""
                    priority
                  />
                )}
              </div>
            )}
            {showText && (
              <div className="flex flex-col text-left justify-center">
                <span
                  className={cn('font-bold tracking-[0.14em] uppercase leading-tight', siteTitleSize, siteTitleFont.className)}
                  style={{ fontFamily: siteTitleFont.fontFamily, color: siteTitleColor }}
                >
                  {siteTitle}
                </span>
                <span
                  className={cn(
                    'font-black tracking-[-0.02em] uppercase leading-none',
                    siteNameSize,
                    siteNameFont.className
                  )}
                  style={{
                    fontFamily: siteNameFont.fontFamily,
                    color: siteNameColor,
                  }}
                >
                  {siteName}
                </span>
              </div>
            )}
          </Link>

          {/* Center Navigation Links (In between Left and Right) */}
          <ul className="lgc-nav-desktop items-center justify-center gap-6 xl:gap-8 grow px-4">
            {navLinks.map((item, idx) => {
              const isActive =
                item.url === currentRoute ||
                (item.url === '/' &&
                  (currentRoute === '/' || currentRoute === ''));

              return (
                <li key={`main-nav-${idx}`}>
                  <Link
                    href={item.url}
                    className={cn(
                      'text-[15px] transition-colors py-2 block whitespace-nowrap',
                      menuFont.className,
                      isActive
                        ? 'text-[#d85d18] font-semibold'
                        : 'text-[#2b2b2b] hover:text-[#d85d18] font-medium'
                    )}
                    style={{
                      fontFamily: menuFont.fontFamily,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons (Right side) */}
          <div className="lgc-nav-desktop items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {children ? (
              children
            ) : (
              <>
                <Link
                  href={loginUrl}
                  className={cn(
                    'slice-custom-btn border px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium transition-all text-center inline-flex items-center justify-center',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={loginStyleProps}
                >
                  {loginLabel}
                </Link>
                <Link
                  href={ctaUrl}
                  className={cn(
                    'slice-custom-btn group border inline-flex items-center justify-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium shadow-sm hover:shadow transition-all text-center',
                    buttonRadiusClass,
                    buttonFont.className
                  )}
                  style={ctaStyleProps}
                >
                  <span>{ctaLabel}</span>
                  <svg
                    className="w-4 h-4 text-white shrink-0 transition-transform duration-200 group-hover:translate-x-1"
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
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center lgc-nav-mobile">
            <button
              type="button"
              className="p-2 text-[#1c1917] hover:text-[#d85d18] focus:outline-none rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div
            className="lgc-nav-mobile py-5 px-4 mb-3 rounded-2xl border border-black/10 shadow-xl transition-all"
            style={{ backgroundColor: navbarBg }}
          >
            <ul className="flex flex-col gap-3">
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
                        'block text-[1rem] py-2 transition-colors',
                        menuFont.className,
                        isActive
                          ? 'text-[#d85d18] font-bold'
                          : 'text-[#2b2b2b] hover:text-[#d85d18] font-medium'
                      )}
                      style={{
                        fontFamily: menuFont.fontFamily,
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 pt-4 border-t border-black/10 flex flex-col gap-2.5">
              {children ? (
                children
              ) : (
                <>
                  <Link
                    href={loginUrl}
                    onClick={closeMenu}
                    className={cn(
                      'slice-custom-btn border w-full text-center py-2.5 text-sm font-medium transition-all inline-flex items-center justify-center',
                      buttonRadiusClass,
                      buttonFont.className
                    )}
                    style={loginStyleProps}
                  >
                    {loginLabel}
                  </Link>
                  <Link
                    href={ctaUrl}
                    onClick={closeMenu}
                    className={cn(
                      'slice-custom-btn group border w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium shadow-sm transition-all',
                      buttonRadiusClass,
                      buttonFont.className
                    )}
                    style={ctaStyleProps}
                  >
                    <span>{ctaLabel}</span>
                    <svg
                      className="w-4 h-4 text-white shrink-0"
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
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainNavbar;
