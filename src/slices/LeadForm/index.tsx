import React from 'react';
import { asLink, isFilled } from '@prismicio/client';
import { resolveFontFamily, cn } from '@lgc_cms/util';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';
import { LeadFormFields } from './LeadFormFields';

import type { JSX } from 'react';

/**
 * Props for `LeadForm`.
 */
export type LeadFormProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

const widths: Record<string, string> = { narrow: 'max-w-[480px]', medium: 'max-w-[560px]', wide: 'max-w-[720px]' };

/**
 * Component for "LeadForm" Slices: a sign-up card (name + email) that adds the visitor
 * to a MailerLite group, then shows a message or redirects to a thank-you page.
 */
const LeadForm = ({ slice }: LeadFormProps): JSX.Element => {
  const primary = (slice?.primary || {}) as any;
  const align = String(primary.alignment || 'Center').toLowerCase();
  const showCard = primary.show_card !== false;

  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    card: primary.card_bg_color || '#fbf9f5',
    cardBorder: primary.card_border_color || '#e7dfd2',
    title: primary.title_color || '#1c1917',
    text: primary.text_color || '#78716c',
  };
  const titleFont = resolveFontFamily(primary.title_font, 'Fraunces');
  const redirectTo = isFilled.link(primary.success_redirect) ? (asLink(primary.success_redirect) as string | null) : null;

  return (
    <section
      id={primary.anchor_id || 'get-the-lesson'}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full px-4 sm:px-6 lg:px-8 font-sans scroll-mt-24', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      <div
        className={cn(
          'w-full',
          widths[String(primary.width || 'Medium').toLowerCase()] || widths.medium,
          align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto',
          showCard && 'rounded-[14px] border p-6 sm:p-8 shadow-[0_24px_60px_-30px_rgba(28,25,23,0.35)]'
        )}
        style={showCard ? { backgroundColor: c.card, borderColor: c.cardBorder } : undefined}
      >
        <h2
          className={cn(titleFont.className, 'text-[1.75rem] sm:text-[2.125rem] leading-tight tracking-[-0.01em]')}
          style={{ fontFamily: titleFont.fontFamily, color: c.title }}
        >
          {primary.title || 'Send me the free lesson'}
        </h2>
        {primary.description && (
          <p className="mt-2 text-[0.95rem] sm:text-[1rem] leading-relaxed" style={{ color: c.text }}>
            {primary.description}
          </p>
        )}
        <div className="mt-6 sm:mt-8">
          <LeadFormFields
            showName={primary.show_name_field !== false}
            nameRequired={primary.name_required === true}
            nameLabel={primary.name_label || 'Your name'}
            namePlaceholder={primary.name_placeholder || 'First name'}
            emailLabel={primary.email_label || 'Your email address'}
            emailPlaceholder={primary.email_placeholder || 'you@example.com'}
            buttonLabel={primary.button_label || 'Send my free lesson'}
            successMessage={primary.success_message || 'Thanks! Check your inbox: the lesson is on its way.'}
            redirectTo={redirectTo}
            groupId={primary.mailerlite_group_id}
            colors={{
              label: primary.label_color || '#1c1917',
              inputBg: primary.input_bg_color || '#fbf9f5',
              inputBorder: primary.input_border_color || '#e2d9cb',
              inputText: primary.input_text_color || '#1c1917',
              focus: primary.button_bg_color || '#d85d18',
              buttonBg: primary.button_bg_color || '#d85d18',
              buttonText: primary.button_text_color || '#ffffff',
              buttonHoverBg: primary.button_hover_bg_color || '#b94c10',
              buttonHoverText: primary.button_hover_text_color || '#ffffff',
            }}
          />
        </div>
        {primary.fine_print && (
          <p className="mt-5 text-center text-xs leading-relaxed" style={{ color: c.text }}>
            {primary.fine_print}
          </p>
        )}
      </div>
    </section>
  );
};

export default LeadForm;
