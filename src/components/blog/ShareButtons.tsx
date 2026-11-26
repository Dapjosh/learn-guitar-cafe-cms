'use client';

import React, { useState } from 'react';

/**
 * Share icons for a post: Facebook, X and copy link.
 * Uses the page's own address so it works on any domain.
 */
export const ShareButtons = ({
  title,
  bg = '#1c1917',
  color = '#ffffff',
  hoverBg = '#d85d18',
}: {
  title: string;
  bg?: string;
  color?: string;
  hoverBg?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const share = (network: 'facebook' | 'x') => {
    const url = encodeURIComponent(window.location.href);
    const href =
      network === 'facebook'
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : `https://x.com/intent/post?url=${url}&text=${encodeURIComponent(title)}`;
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=540');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', window.location.href);
    }
  };

  const btn =
    'relative w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors bg-[color:var(--share-bg)] text-[color:var(--share-color)] hover:bg-[color:var(--share-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--share-hover)]';
  const vars = { '--share-bg': bg, '--share-color': color, '--share-hover': hoverBg } as React.CSSProperties;

  return (
    <div className="flex items-center gap-2" style={vars}>
      <button type="button" className={btn} onClick={() => share('facebook')} aria-label="Share on Facebook">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z" />
        </svg>
      </button>
      <button type="button" className={btn} onClick={() => share('x')} aria-label="Share on X">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
          <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
        </svg>
      </button>
      <button type="button" className={btn} onClick={copy} aria-label={copied ? 'Link copied' : 'Copy link'}>
        {copied ? (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
            <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </svg>
        )}
        <span className="sr-only" role="status">
          {copied ? 'Link copied' : ''}
        </span>
      </button>
    </div>
  );
};

export default ShareButtons;
