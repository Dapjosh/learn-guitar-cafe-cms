import React from 'react';

export type TitleSizeOption = 'Small' | 'Medium' | 'Large' | 'Extra Large' | string;
export type DescriptionSizeOption = 'Small' | 'Medium' | 'Large' | string;
export type FontFamilyOption =
  | 'Fraunces'
  | 'Bebas Neue'
  | 'Inter Tight'
  | 'Inter'
  | 'Raleway'
  | 'Nunito'
  | 'Mochiy Pop One'
  | 'Anton'
  | string;
export type FontWeightOption =
  | 'Thin'
  | 'Light'
  | 'Normal'
  | 'Medium'
  | 'Semi Bold'
  | 'Bold'
  | 'Extra Bold'
  | 'Black'
  | string;

export interface HeadingTypographyConfig {
  size?: TitleSizeOption | null;
  font?: FontFamilyOption | null;
  weight?: FontWeightOption | null;
  color?: string | null;
  fallbackFont?: FontFamilyOption;
  fallbackSize?: TitleSizeOption;
  fallbackWeight?: FontWeightOption;
  fallbackColor?: string;
}

export interface BodyTypographyConfig {
  size?: DescriptionSizeOption | null;
  font?: FontFamilyOption | null;
  weight?: FontWeightOption | null;
  color?: string | null;
  fallbackFont?: FontFamilyOption;
  fallbackSize?: DescriptionSizeOption;
  fallbackWeight?: FontWeightOption;
  fallbackColor?: string;
}

export interface ResolvedTypography {
  className: string;
  style: React.CSSProperties;
}

/**
 * Resolves a font family name to its corresponding CSS class and inline fallback font-family rule
 */
export function resolveFontFamily(
  font?: string | null,
  fallback = 'Inter Tight'
): { className: string; fontFamily: string } {
  const f = (font || fallback).toLowerCase();
  if (f.includes('fraunces')) {
    return {
      className: 'font-fraunces',
      fontFamily: 'var(--font-fraunces), "Fraunces", serif',
    };
  }
  if (f.includes('bebas')) {
    return {
      className: 'font-bebas',
      fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
    };
  }
  if (f.includes('tight')) {
    return {
      className: 'font-inter-tight',
      fontFamily: 'var(--font-inter-tight), "Inter Tight", sans-serif',
    };
  }
  if (f.includes('raleway')) {
    return {
      className: 'font-sans',
      fontFamily: 'var(--font-raleway), -apple-system, BlinkMacSystemFont, sans-serif',
    };
  }
  if (f.includes('nunito')) {
    return {
      className: 'font-lesson-body',
      fontFamily: 'var(--font-nunito), -apple-system, BlinkMacSystemFont, sans-serif',
    };
  }
  if (f.includes('mochiy')) {
    return {
      className: 'font-lesson-heading',
      fontFamily: 'var(--font-mochiy-pop-one), sans-serif',
    };
  }
  if (f.includes('anton')) {
    return {
      className: 'font-anton',
      fontFamily: 'var(--font-anton), Anton, sans-serif',
    };
  }
  if (f.includes('inter')) {
    return {
      className: 'font-inter',
      fontFamily: '"Inter", var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif',
    };
  }
  return {
    className: 'font-inter-tight',
    fontFamily: 'var(--font-inter-tight), "Inter Tight", -apple-system, BlinkMacSystemFont, sans-serif',
  };
}

function resolveFontWeight(weight?: string | null, fallback = 'Normal') {
  const w = (weight || fallback).toLowerCase().replace(/[\s-_]/g, '');

  switch (w) {
    case 'thin':
      return { className: 'font-thin', fontWeight: 100 };
    case 'light':
      return { className: 'font-light', fontWeight: 300 };
    case 'normal':
    case 'regular':
      return { className: 'font-normal', fontWeight: 400 };
    case 'medium':
      return { className: 'font-medium', fontWeight: 500 };
    case 'semibold':
      return { className: 'font-semibold', fontWeight: 600 };
    case 'bold':
      return { className: 'font-bold', fontWeight: 700 };
    case 'extrabold':
      return { className: 'font-extrabold', fontWeight: 800 };
    case 'black':
      return { className: 'font-black', fontWeight: 900 };
    default:
      return { className: 'font-normal', fontWeight: 400 };
  }
}

/**
 * Resolves heading typography (size class, font class, weight, and style) from CMS configuration
 * Defaults to Fraunces Regular (400)
 */
export function resolveHeadingTypography(config: HeadingTypographyConfig = {}): ResolvedTypography {
  const size = config.size || config.fallbackSize || 'Large';
  const font = config.font || config.fallbackFont || 'Fraunces';
  const weight = config.weight || config.fallbackWeight || 'Normal';
  const color = config.color || config.fallbackColor || '#000000';

  // Size classes
  let sizeClass = 'text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.65rem]';
  const s = size.toLowerCase();
  if (s.includes('small')) {
    sizeClass = 'text-2xl sm:text-3xl md:text-4xl';
  } else if (s.includes('extra') || s.includes('xl')) {
    sizeClass = 'text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[5rem]';
  } else if (s.includes('medium')) {
    sizeClass = 'text-3xl sm:text-4xl md:text-5xl';
  } else if (s.includes('large')) {
    sizeClass = 'text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.65rem]';
  }

  // Font family resolution via shared resolveFontFamily helper
  const fontInfo = resolveFontFamily(font, config.fallbackFont || 'Fraunces');

  // Weight resolution (defaults to Normal / 400 for headers)
  const weightInfo = resolveFontWeight(weight, 'Normal');

  return {
    className: `${fontInfo.className} ${sizeClass} ${weightInfo.className}`,
    style: {
      fontFamily: fontInfo.fontFamily,
      fontWeight: weightInfo.fontWeight,
      color,
    },
  };
}

/**
 * Resolves body / description typography (size class, font class, weight, and style) from CMS configuration
 * Defaults to Inter Tight Regular (400)
 */
export function resolveBodyTypography(config: BodyTypographyConfig = {}): ResolvedTypography {
  const size = config.size || config.fallbackSize || 'Medium';
  const font = config.font || config.fallbackFont || 'Inter Tight';
  const weight = config.weight || config.fallbackWeight || 'Normal';
  const color = config.color || config.fallbackColor || '#000000';

  let sizeClass = 'text-base sm:text-lg md:text-[1.05rem]';
  const s = size.toLowerCase();
  if (s.includes('small')) {
    sizeClass = 'text-sm sm:text-base';
  } else if (s.includes('large')) {
    sizeClass = 'text-lg sm:text-xl md:text-2xl';
  } else if (s.includes('medium')) {
    sizeClass = 'text-base sm:text-lg md:text-[1.05rem]';
  }

  // Font family resolution via shared resolveFontFamily helper
  const fontInfo = resolveFontFamily(font, config.fallbackFont || 'Inter Tight');

  // Weight resolution (defaults to Normal / 400 for body)
  const weightInfo = resolveFontWeight(weight, 'Normal');

  return {
    className: `${fontInfo.className} ${sizeClass} ${weightInfo.className}`,
    style: {
      fontFamily: fontInfo.fontFamily,
      fontWeight: weightInfo.fontWeight,
      color,
    },
  };
}

/**
 * Resolves button typography from CMS configuration
 * Defaults to Inter Tight Medium (500)
 */
export function resolveButtonTypography(config: {
  font?: FontFamilyOption | null;
  weight?: FontWeightOption | null;
  fallbackFont?: FontFamilyOption;
} = {}): ResolvedTypography {
  const font = config.font || config.fallbackFont || 'Inter Tight';
  const weight = config.weight || 'Medium';

  const fontInfo = resolveFontFamily(font, 'Inter Tight');
  const weightInfo = resolveFontWeight(weight, 'Medium');

  return {
    className: `${fontInfo.className} ${weightInfo.className}`,
    style: {
      fontFamily: fontInfo.fontFamily,
      fontWeight: weightInfo.fontWeight,
    },
  };
}
