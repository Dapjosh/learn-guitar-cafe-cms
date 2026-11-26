'use client';
import { useEffect, useState } from 'react';
import { getCookie, hasCookie, setCookie } from 'cookies-next';
import Link from 'next/link';

declare global {
  interface Window {
    gtag: (command: 'config' | 'event' | 'consent', action: string, params?: Record<string, any>) => void;
  }
}

export type CookieConsentProps = {
  /** Banner text (before the privacy link) */
  message?: string | null;
  /** Where "Privacy Policy" links to */
  privacyHref?: string | null;
  privacyLabel?: string | null;
  acceptLabel?: string | null;
  declineLabel?: string | null;
};

/**
 * Cookie consent banner in the site palette (charcoal card, cream text, orange accents).
 * Layout/colours live in global.scss (.lgc-cookie*) so it never depends on Tailwind JIT.
 */
export function CookieConsent({
  message,
  privacyHref,
  privacyLabel,
  acceptLabel,
  declineLabel,
}: CookieConsentProps) {
  // true = a choice has already been made (or we haven't checked yet) → banner hidden
  const [hasChoice, setHasChoice] = useState(true);

  useEffect(() => {
    const checkCookie = async () => {
      const cookieExists = await hasCookie('localConsent');

      setHasChoice(cookieExists);

      if (cookieExists) {
        const newValue = getCookie('localConsent') === 'true' ? 'granted' : 'denied';
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: newValue,
          });
        }
      }
    };

    void checkCookie();
  }, []);

  const choose = (accepted: boolean) => {
    setHasChoice(true);
    setCookie('localConsent', accepted ? 'true' : 'false', { maxAge: 60 * 60 * 24 * 365 });
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: accepted ? 'granted' : 'denied' });
    }
  };

  if (hasChoice) {
    return null;
  }

  return (
    <div className="lgc-cookie" role="region" aria-label="Cookie consent">
      <p className="lgc-cookie__text">
        {message ||
          'We use cookies for a better experience and to understand how the site is used. By continuing, you agree to our use of cookies.'}{' '}
        <Link href={privacyHref || '/legal/privacy'} className="lgc-cookie__link">
          {privacyLabel || 'Privacy Policy'}
        </Link>
      </p>

      <div className="lgc-cookie__actions">
        <button type="button" className="lgc-cookie__btn lgc-cookie__btn--decline" onClick={() => choose(false)}>
          {declineLabel || 'Decline'}
        </button>
        <button type="button" className="lgc-cookie__btn lgc-cookie__btn--accept" onClick={() => choose(true)}>
          {acceptLabel || 'Allow cookies'}
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
