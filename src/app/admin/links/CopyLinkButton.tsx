'use client';

import React, { useState } from 'react';

/** Copies a URL to the clipboard and briefly confirms it. */
export const CopyLinkButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API
      const input = document.createElement('textarea');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" onClick={copy} className="lgc-links-btn lgc-links-btn--filled" aria-live="polite">
      {copied ? 'Copied ✓' : 'Copy link'}
    </button>
  );
};

export default CopyLinkButton;
