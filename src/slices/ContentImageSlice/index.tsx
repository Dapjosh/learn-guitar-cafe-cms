import { asText, Content, isFilled } from '@prismicio/client';
import { PrismicRichText, SliceComponentProps } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { Bounded } from '../../components/Bounded';
import { ContentBlockImage, SectionContentBlockList } from '@lgc_cms/features';
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
} from '@lgc_cms/util';
import cn from 'classnames';

import type { JSX } from 'react';

/**
 * Props for `ContentImageSlice`.
 */
export type ContentImageSliceProps =
  SliceComponentProps<Content.ContentImageSliceSlice>;

/**
 * Component for "ContentImageSlice" Slices.
 */
const ContentImageSlice = ({ slice }: ContentImageSliceProps): JSX.Element => {
  if (slice.variation === 'splitWithImage') {
    const primary = slice.primary as any;

    // Background configurations
    const containerBgColor = primary.container_background_color || '#f4eee5';
    const outerBgColor = primary.outer_background_color || containerBgColor;
    const hasBgImage = isFilled.image(primary.background_image);
    const rawOpacity = primary.background_image_opacity;
    const bgOpacity = isFilled.number(rawOpacity)
      ? rawOpacity > 1
        ? Math.min(Math.max(rawOpacity / 100, 0), 1)
        : Math.max(rawOpacity, 0)
      : 1;

    // Typography resolution from CMS
    const headingTypo = resolveHeadingTypography({
      size: primary.title_size,
      font: primary.title_font,
      weight: primary.title_weight,
      color: primary.title_color,
      fallbackFont: 'Inter',
      fallbackSize: 'Large',
      fallbackWeight: 'Black',
      fallbackColor: '#000000',
    });

    const bodyTypo = resolveBodyTypography({
      size: primary.description_size,
      font: primary.description_font,
      weight: primary.description_weight,
      color: primary.description_color,
      fallbackFont: 'Raleway',
      fallbackSize: 'Medium',
      fallbackWeight: 'Normal',
      fallbackColor: '#2b2b2b',
    });

    // Button configuration
    const buttonLabel = primary.button_label || 'Explore the courses';
    const buttonFont = resolveFontFamily(primary.button_font, 'Inter');
    const buttonStyle = primary.button_style || 'Outline';

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

    // Button colors & hover configuration from CMS
    const isFilledButton = buttonStyle === 'Filled';
    const btnBg =
      primary.button_background_color ||
      (isFilledButton ? '#1c1917' : 'transparent');
    const btnTextColor =
      primary.button_text_color || (isFilledButton ? '#ffffff' : '#1c1917');
    const btnHoverBg =
      primary.button_hover_background_color ||
      (isFilledButton ? '#000000' : '#1c1917');
    const btnHoverTextColor = primary.button_hover_text_color || '#ffffff';

    const buttonStyleProps: React.CSSProperties = {
      fontFamily: buttonFont.fontFamily,
      backgroundColor: 'var(--btn-bg, ' + btnBg + ')',
      color: 'var(--btn-text, ' + btnTextColor + ')',
      borderColor: 'var(--btn-border, ' + (isFilledButton ? btnBg : btnTextColor) + ')',
      '--btn-bg': btnBg,
      '--btn-text': btnTextColor,
      '--btn-border': isFilledButton ? btnBg : btnTextColor,
      '--btn-hover-bg': btnHoverBg,
      '--btn-hover-text': btnHoverTextColor,
      '--btn-hover-border': btnHoverBg,
    } as React.CSSProperties;

    const buttonClass = cn(
      'slice-custom-btn group border px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold inline-flex items-center gap-2.5 transition-all duration-200 shadow-sm',
      buttonRadiusClass,
      buttonFont.className
    );

    const isAnton = primary.title_font?.toLowerCase() === 'anton';

    // Rich text serializers
    const titleComponents = {
      heading1: ({ children }: any) => (
        <h1
          className={cn(
            headingTypo.className,
            'uppercase mb-4 sm:mb-6',
            !isAnton && 'tracking-[-0.03em] leading-[1.08]'
          )}
          style={headingTypo.style}
        >
          {children}
        </h1>
      ),
      heading2: ({ children }: any) => (
        <h2
          className={cn(
            headingTypo.className,
            'uppercase mb-4 sm:mb-6',
            !isAnton && 'tracking-[-0.03em] leading-[1.08]'
          )}
          style={headingTypo.style}
        >
          {children}
        </h2>
      ),
      heading3: ({ children }: any) => (
        <h3
          className={cn(
            headingTypo.className,
            'uppercase mb-4 sm:mb-6',
            !isAnton && 'tracking-[-0.03em] leading-[1.08]'
          )}
          style={headingTypo.style}
        >
          {children}
        </h3>
      ),
    };

    const descriptionComponents = {
      paragraph: ({ children }: any) => (
        <p
          className={cn(bodyTypo.className, 'leading-relaxed mb-4 last:mb-0')}
          style={bodyTypo.style}
        >
          {children}
        </p>
      ),
      strong: ({ children }: any) => (
        <strong className="font-bold">{children}</strong>
      ),
      em: ({ children }: any) => <em className="italic">{children}</em>,
      hyperlink: ({ node, children }: any) => (
        <PrismicNextLink
          field={node.data}
          className="text-[#d85d18] underline underline-offset-4 hover:text-[#c04f12] transition-colors"
        >
          {children}
        </PrismicNextLink>
      ),
    };

    const isImageLeft = primary.image_position === 'Left';

    return (
      <section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        className="relative w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-6 font-sans transition-colors duration-200"
        style={{ backgroundColor: outerBgColor }}
      >
        <div
          className="relative max-w-[1380px] mx-auto rounded-lg sm:rounded-md lg:rounded-[10px] overflow-hidden p-6 sm:p-10 md:p-12 lg:p-16 transition-colors duration-200"
          style={{ backgroundColor: containerBgColor }}
        >
          {/* Optional background texture/image with opacity */}
          {hasBgImage && (
            <div
              className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
              style={{ opacity: bgOpacity }}
            >
              <PrismicNextImage
                field={primary.background_image}
                fill
                className="object-cover object-center"
                alt=""
                priority
              />
            </div>
          )}

          {/* Grid Layout: Text Content + Rounded Photo */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-12 lg:gap-16 xl:gap-20">
            {/* Content Column */}
            <div
              className={cn(
                'flex flex-col items-start text-left',
                isImageLeft ? 'lg:order-2' : 'lg:order-1'
              )}
            >
              {/* Badge Pill */}
              {primary.badge_text && (
                <div className="mb-5 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#d85d18]">
                  <svg
                    className="w-3.5 h-3.5 text-[#d85d18] shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                  </svg>
                  <span>{primary.badge_text}</span>
                </div>
              )}

              {/* Headline */}
              {isFilled.richText(primary.title) ? (
                <PrismicRichText
                  field={primary.title}
                  components={titleComponents}
                />
              ) : (
                <h2
                  className={cn(
                    headingTypo.className,
                    'uppercase mb-4 sm:mb-6',
                    !isAnton && 'tracking-[-0.03em] leading-[1.08]'
                  )}
                  style={headingTypo.style}
                >
                  AN AUTHENTIC APPROACH TO SLIDE &amp; ROOTS GUITAR
                </h2>
              )}

              {/* Description */}
              <div className="max-w-xl mb-6 sm:mb-8">
                {isFilled.richText(primary.description) ? (
                  <PrismicRichText
                    field={primary.description}
                    components={descriptionComponents}
                  />
                ) : (
                  <p
                    className={cn(bodyTypo.className, 'leading-relaxed mb-4')}
                    style={bodyTypo.style}
                  >
                    Learn Guitar Cafe is for players seeking depth rather than
                    just mindless scale drills. We emphasize timeless nuances
                    like intonation, touch, open tunings, and phrasing, helping
                    you find your unique voice and discover authentic vintage
                    tones that inspire your music.
                  </p>
                )}
              </div>

              {/* Action Button */}
              {buttonLabel && (
                <div>
                  {isFilled.link(primary.button_link) ? (
                    <PrismicNextLink
                      field={primary.button_link}
                      className={buttonClass}
                      style={buttonStyleProps}
                    >
                      <span>{buttonLabel}</span>
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
                    </PrismicNextLink>
                  ) : (
                    <a
                      href="/courses"
                      className={buttonClass}
                      style={buttonStyleProps}
                    >
                      <span>{buttonLabel}</span>
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
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Image Column */}
            <div
              className={cn(
                'flex justify-center',
                isImageLeft ? 'lg:order-1' : 'lg:order-2'
              )}
            >
              <div className="relative w-full max-w-[480px] aspect-[4/3] sm:aspect-[14/11] rounded-2xl sm:rounded-3xl lg:rounded-[28px] overflow-hidden">
                {isFilled.image(primary.image) ? (
                  <PrismicNextImage
                    field={primary.image}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
                    alt={primary.image.alt || 'Guitar lesson overview'}
                    priority
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200"
                    alt="Musician playing slide guitar"
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (slice.variation === 'sectionContentImage') {
    return (
      <Bounded as="section" className="mx-auto" yPadding={'md'}>
        <SectionContentBlockList data={{ ...slice.primary, id: slice.id }} />
      </Bounded>
    );
  }

  if (slice.variation === 'default') {
    let type: 'div' | 'section' | 'header' | 'article' = 'div';

    switch (slice.primary.type) {
      case 'Section':
        type = 'section';
        break;
      case 'Article':
        type = 'article';
        break;
      case 'Default':
        type = 'div';
    }

    return (
      <Bounded as={type} className="mx-auto" yPadding={'md'}>
        <ContentBlockImage
          data={{
            section_title: {
              title: slice.primary.heading,
              subtitle: slice.primary.subheading,
            },
            motto: {
              text: slice.primary.body,
            },
            images: [
              {
                image: slice.primary.image,
                alt: '1: ' + asText(slice.primary.heading),
              },
              {
                image: slice.primary.optional_image,
                alt: '2: ' + asText(slice.primary.heading),
              },
            ],
          }}
          titleSize="large"
          alignment={slice.primary.alignment as 'Left' | 'Right' | undefined}
          hasDecor={slice.primary.has_decoration}
        />
      </Bounded>
    );
  }

  return <> </>;
};

export default ContentImageSlice;
