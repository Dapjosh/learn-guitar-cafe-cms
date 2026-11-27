'use client';

import React, { useEffect } from 'react';
import type { ThriveCartEmbed as Embed } from './thrivecart';

/**
 * Renders ThriveCart's checkout markup from validated settings and loads
 * ThriveCart's script. The script is (re)added on mount so the checkout also
 * appears after client-side navigation, and removed on unmount.
 */
export const ThriveCartEmbed = ({
  embed,
  buttonLabel,
  buttonStyle,
  fallbackHref,
}: {
  embed: Embed;
  buttonLabel: string;
  buttonStyle: React.CSSProperties;
  fallbackHref?: string | null;
}) => {
  const scriptId = embed.embeddable || `tc-${embed.account}-${embed.product}-button`;

  useEffect(() => {
    document.getElementById(scriptId)?.remove();
    const script = document.createElement('script');
    script.src = embed.scriptSrc;
    script.async = true;
    script.id = scriptId;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [scriptId, embed.scriptSrc]);

  const dataAttrs = {
    'data-thrivecart-account': embed.account,
    'data-thrivecart-tpl': embed.template,
    'data-thrivecart-product': embed.product,
  };

  if (embed.mode === 'popup') {
    return (
      <a
        {...dataAttrs}
        href={fallbackHref || '#'}
        className={`${embed.className} slice-custom-btn inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md border text-[0.95rem] font-medium w-full sm:w-auto`}
        style={buttonStyle}
      >
        {buttonLabel}
      </a>
    );
  }

  return (
    <div className={`${embed.className} min-h-[320px]`} data-thrivecart-embeddable={embed.embeddable || undefined} {...dataAttrs}>
      {fallbackHref && (
        <noscript>
          <a href={fallbackHref}>{buttonLabel}</a>
        </noscript>
      )}
    </div>
  );
};

export default ThriveCartEmbed;
