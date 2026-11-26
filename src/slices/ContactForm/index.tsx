import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import { resolveHeadingTypography, resolveBodyTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { RingPortrait } from '@components/slice-ui/RingPortrait';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';
import { ContactFormFields } from './ContactFormFields';

import type { JSX } from 'react';

/**
 * Props for `ContactForm`.
 */
export type ContactFormProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

/**
 * Component for "ContactForm" Slices: circular photo with rings (or a plain rounded photo)
 * beside a heading, intro and contact form that emails the site owner.
 */
const ContactForm = ({ slice }: ContactFormProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;
  const imageRight = primary.image_position === 'Right';
  const imageStyle = String(primary.image_style || 'Circle with rings').toLowerCase();
  const showImage = imageStyle !== 'hidden';
  const sectionBg = primary.section_bg_color || '#f3efe6';

  const titleTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    color: primary.title_color,
    fallbackFont: 'Bebas Neue',
    fallbackSize: 'Large',
    fallbackColor: '#1c1917',
  });
  const titleClass = cn(titleTypo.className, 'uppercase tracking-tight leading-[1.02]');
  const introTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: 'Inter Tight',
    fallbackSize: 'Medium',
    fallbackColor: '#78716c',
  });
  const formFont = resolveFontFamily(primary.form_font, 'Inter Tight');
  const maxLength =
    typeof primary.message_max_length === 'number' && primary.message_max_length >= 50
      ? Math.min(Math.round(primary.message_max_length), 5000)
      : 1000;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
      id={primary.anchor_id || undefined}
    >
      <div className={cn('max-w-[1280px] mx-auto grid grid-cols-1 items-center gap-12 lg:gap-16 xl:gap-24', showImage && 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        {showImage && (
          <div className={cn('flex justify-center', imageRight && 'lg:order-2')}>
            {imageStyle === 'rounded rectangle' ? (
              <div className="relative w-full max-w-[480px] aspect-[4/5] rounded-[12px] overflow-hidden bg-[#e7dfd2]">
                {isFilled.image(primary.image) && <PrismicNextImage field={primary.image} fill sizes="(max-width: 1024px) 90vw, 480px" className="object-cover" />}
              </div>
            ) : (
              <RingPortrait
                image={primary.image}
                gapColor={sectionBg}
                ringOuter={primary.ring_outer_color || '#e8b04b'}
                ringInner={primary.ring_inner_color || '#d85d18'}
                ringExtra={primary.show_third_ring !== false ? primary.ring_extra_color || '#e8b04b' : null}
              />
            )}
          </div>
        )}

        <div className={cn('relative w-full', imageRight && 'lg:order-1', !showImage && 'max-w-[720px] mx-auto')}>
          {isFilled.richText(primary.title) ? (
            <PrismicRichText
              field={primary.title}
              components={{
                heading1: ({ children }: any) => <h1 className={titleClass} style={titleTypo.style}>{children}</h1>,
                heading2: ({ children }: any) => <h2 className={titleClass} style={titleTypo.style}>{children}</h2>,
              }}
            />
          ) : (
            <h2 className={titleClass} style={titleTypo.style}>
              Send us a message
            </h2>
          )}
          {isFilled.richText(primary.description) && (
            <div className={cn(introTypo.className, 'mt-5 sm:mt-6 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:underline')} style={introTypo.style}>
              <PrismicRichText field={primary.description} />
            </div>
          )}

          <div className="mt-8 sm:mt-10">
            <ContactFormFields
              maxLength={maxLength}
              fontFamily={formFont.fontFamily}
              text={{
                firstNameLabel: primary.first_name_label || 'First name',
                firstNamePlaceholder: primary.first_name_placeholder || 'Jamie',
                lastNameLabel: primary.last_name_label || 'Last name',
                lastNamePlaceholder: primary.last_name_placeholder || 'Walker',
                emailLabel: primary.email_label || 'Email',
                emailPlaceholder: primary.email_placeholder || 'you@example.com',
                messageLabel: primary.message_label || 'Message',
                messagePlaceholder: primary.message_placeholder || 'Ask about a lesson, your gear or a tuning',
                hint: primary.message_hint || `Up to ${maxLength.toLocaleString()} characters.`,
                buttonLabel: primary.button_label || 'Send message',
                successMessage: primary.success_message || 'Thanks! Your message has been sent. We’ll reply by email.',
              }}
              colors={{
                label: primary.label_color || '#1c1917',
                required: primary.required_color || '#d92d20',
                inputBg: primary.input_bg_color || '#fbf9f5',
                inputBorder: primary.input_border_color || '#e2d9cb',
                inputText: primary.input_text_color || '#1c1917',
                focus: primary.focus_color || '#d85d18',
                hint: primary.hint_color || '#78716c',
                buttonBg: primary.button_bg_color || '#1c1917',
                buttonText: primary.button_text_color || '#ffffff',
                buttonHoverBg: primary.button_hover_bg_color || '#d85d18',
                buttonHoverText: primary.button_hover_text_color || '#ffffff',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
