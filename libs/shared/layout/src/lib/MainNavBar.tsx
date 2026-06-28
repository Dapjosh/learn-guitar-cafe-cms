'use client';
import React, { useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavigationDocumentData } from '../../../../../prismicio-types';
import cn from 'classnames';
import { asText } from '@prismicio/client';

interface HeaderProps {
  navigation: NavigationDocumentData;
  logo: StaticImageData;
  children?: React.ReactNode;
}

export function MainNavbar({ navigation, logo, children }: HeaderProps) {
  const currentRoute = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const elementId = document.getElementById('navbar');

    const handleScroll = () => {
      if (window.scrollY > 5) {
        elementId?.classList.add('isSticky');
      } else {
        elementId?.classList.remove('isSticky');
      }
    };

    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div
      id="navbar"
      className="navbar-area fixed top-0 w-full z-10 bg-transparent px-5 py-[20px] lg:py-[25px] xl:py-0"
    >
      <div className="container mx-auto max-w-[1266px]">
        <nav className={`navbar relative flex flex-wrap justify-end items-center`}>
          <div className="grow md:grow-0 self-center">
            <Link href="/" onClick={closeMenu}>
              <Image src={logo} className="inline w-10" alt="logo" />
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-gray-800 hover:text-primary focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (

                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (

                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <div className={cn(
            'navbar-collapse grow basis-auto self-center md:flex',
            // Mobile behavior: dropdown card with white background
            isMobileMenuOpen
              ? 'absolute left-0 top-full mt-4 w-full rounded-xl bg-white p-6 shadow-xl block'
              : 'hidden',
            // Desktop behavior: static, transparent, flex row
            'md:static md:mt-0 md:w-auto md:bg-transparent md:p-0 md:shadow-none'
          )}>
            <ul className="navbar-nav mx-auto flex flex-col md:flex-row w-full md:w-auto gap-2 md:gap-0 self-center">
              {navigation?.links &&
                navigation.links.map((item, idx) => (
                  <li
                    key={`main-nav- ${idx}`}
                    className="group relative mx-[5px] py-[10px] first:ml-0 last:mr-0 lg:py-[5px] xl:mx-[10px] xl:py-[35px] 2xl:mx-[18px] 2xl:py-[30px]"
                  >
                    <Link
                      href={(item.link as { url?: string })?.url || '#'}
                      onClick={closeMenu}
                      className={cn(
                        'block w-full hover:text-primary text-base font-medium text-gray-500 underline-offset-4 transition-all hover:underline',
                        (item.link as { url?: string })?.url === currentRoute &&
                        'text-primary'
                      )}
                    >
                      {asText(item.label)}
                    </Link>
                  </li>
                ))}
            </ul>
            {children && (
              <div className="mt-6 flex flex-col md:hidden gap-3 border-t border-gray-100 pt-6">
                {children}
              </div>
            )}
          </div>
          {children && (
            <div className="hidden md:flex items-center">
              {children}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

export default MainNavbar;
