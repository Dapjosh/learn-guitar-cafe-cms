import type React from 'react';

/**
 * Shared "section" controls for simple content slices (heading, styled text, media embed):
 * background, top/bottom padding (preset or exact px), content width and alignment.
 */

const paddingPx: Record<string, number> = {
  none: 0,
  small: 24,
  medium: 48,
  large: 80,
  'extra large': 120,
};

/** Smaller padding on phones so presets don't feel huge on small screens. */
const mobileScale = 0.6;

const toPx = (preset: unknown, custom: unknown, fallback: string) => {
  if (typeof custom === 'number' && custom >= 0) return custom;
  return paddingPx[String(preset || fallback).toLowerCase()] ?? paddingPx[fallback.toLowerCase()];
};

/**
 * CSS variables for responsive top/bottom padding. Pair with the class
 * `pt-[var(--pad-t-sm)] pb-[var(--pad-b-sm)] md:pt-[var(--pad-t)] md:pb-[var(--pad-b)]` (see sectionPaddingClass).
 */
export function sectionPaddingStyle(primary: any, fallback = 'Medium'): React.CSSProperties {
  const top = toPx(primary?.padding_top, primary?.padding_top_custom, fallback);
  const bottom = toPx(primary?.padding_bottom, primary?.padding_bottom_custom, fallback);
  return {
    '--pad-t': `${top}px`,
    '--pad-b': `${bottom}px`,
    '--pad-t-sm': `${Math.round(top * mobileScale)}px`,
    '--pad-b-sm': `${Math.round(bottom * mobileScale)}px`,
  } as React.CSSProperties;
}

export const sectionPaddingClass =
  'pt-[var(--pad-t-sm)] pb-[var(--pad-b-sm)] md:pt-[var(--pad-t)] md:pb-[var(--pad-b)]';

export const contentWidths: Record<string, string> = {
  narrow: 'max-w-[640px]',
  medium: 'max-w-[800px]',
  wide: 'max-w-[1100px]',
  'extra wide': 'max-w-[1380px]',
  full: 'max-w-none',
};

export const widthClass = (value: unknown, fallback = 'Medium') =>
  contentWidths[String(value || fallback).toLowerCase()] || contentWidths[fallback.toLowerCase()];

export const alignClasses = (value: unknown) => {
  const a = String(value || 'Left').toLowerCase();
  if (a === 'center') return { box: 'mx-auto', text: 'text-center', items: 'items-center' };
  if (a === 'right') return { box: 'ml-auto', text: 'text-right', items: 'items-end' };
  return { box: 'mr-auto', text: 'text-left', items: 'items-start' };
};

