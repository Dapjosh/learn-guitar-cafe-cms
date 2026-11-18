'use client';

import React, { useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavigationDocumentData } from '../../../../../prismicio-types';
import cn from 'classnames';
import { asText } from '@prismicio/client';
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

  // Configurable navbar height and background from CMS
  const rawNavbarHeight = (navigation as any)?.navbar_height;
  const navbarHeight =
    typeof rawNavbarHeight === 'number' && rawNavbarHeight > 0
      ? `${rawNavbarHeight}px`
      : '90px';
  const navbarBg = (navigation as any)?.navbar_bg_color || '#f4eee5';

  // Configurable fonts from CMS
  const siteNameFont = resolveFontFamily(
    (navigation as any)?.site_name_font,
    'Inter'
  );
  const menuFont = resolveFontFamily((navigation as any)?.menu_font, 'Raleway');
  const buttonFont = resolveFontFamily(
    (navigation as any)?.button_font,
    'Inter'
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
            aria-label="Paul Greig Learn Guitar Cafe"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src={logo}
                fill
                sizes="40px"
                className="object-contain"
                alt=""
                priority
              />
            </div>
            <div className="flex flex-col text-left justify-center">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] text-[#1c1917] uppercase leading-tight font-sans">
                PAUL GREIG
              </span>
              <span
                className={cn(
                  'text-sm sm:text-base font-black tracking-[-0.02em] text-black uppercase leading-none',
                  siteNameFont.className
                )}
                style={{
                  fontFamily: siteNameFont.fontFamily,
                }}
              >
                LEARN GUITAR CAFE
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (In between Left and Right) */}
          <ul className="hidden md:flex items-center justify-center gap-6 lg:gap-8 grow px-4">
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
                      'text-[15px] transition-colors py-2 block',
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
          <div className="hidden md:flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {children ? (
              children
            ) : (
              <>
                <Link
                  href={loginUrl}
                  className={cn(
                    buttonRadiusClass,
                    'border border-black/25 hover:border-black/50 bg-transparent px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-semibold text-[#1c1917] hover:bg-black/5 transition-all text-center',
                    buttonFont.className
                  )}
                  style={{
                    fontFamily: buttonFont.fontFamily,
                  }}
                >
                  {loginLabel}
                </Link>
                <Link
                  href={ctaUrl}
                  className={cn(
                    buttonRadiusClass,
                    'inline-flex items-center justify-center gap-2 bg-[#1c1917] hover:bg-black active:bg-neutral-900 px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-semibold text-white shadow-sm hover:shadow transition-all text-center',
                    buttonFont.className
                  )}
                  style={{
                    fontFamily: buttonFont.fontFamily,
                  }}
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

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center md:hidden">
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
            className="md:hidden py-5 px-4 mb-3 rounded-2xl border border-black/10 shadow-xl transition-all"
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
                        'block text-base py-2 transition-colors',
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
                      buttonRadiusClass,
                      'w-full text-center border border-black/25 bg-transparent py-2.5 text-sm font-semibold text-[#1c1917] hover:bg-black/5 transition-all',
                      buttonFont.className
                    )}
                    style={{
                      fontFamily: buttonFont.fontFamily,
                    }}
                  >
                    {loginLabel}
                  </Link>
                  <Link
                    href={ctaUrl}
                    onClick={closeMenu}
                    className={cn(
                      buttonRadiusClass,
                      'w-full inline-flex items-center justify-center gap-2 bg-[#1c1917] hover:bg-black py-2.5 text-sm font-semibold text-white shadow-sm transition-all',
                      buttonFont.className
                    )}
                    style={{
                      fontFamily: buttonFont.fontFamily,
                    }}
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
