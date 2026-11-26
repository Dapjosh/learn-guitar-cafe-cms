import React from 'react';
import { asText, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import { createClient } from '@/prismicio';
import { resolveHeadingTypography, resolveBodyTypography, resolveFontFamily, cn } from '@lgc_cms/util';
import { BadgePill } from '../ContentImageSlice/shared';
import { ButtonRow } from '@components/slice-ui/ButtonRow';
import { sectionPaddingClass, sectionPaddingStyle } from '@components/slice-ui/section-style';

import type { JSX } from 'react';

type QA = { question: string; answer: any };

const sampleQuestions: QA[] = [
  ['What kind of guitar do I need to start?', 'Any acoustic or electric guitar you already own will do. For bottleneck slide, standard or slightly higher action helps, but you don’t need a special setup to begin.'],
  ['How long do I have access to the course?', 'Lifetime access: watch, rewatch and download the TABs whenever you like.'],
  ['Can I learn if I’ve never played with a slide?', 'Yes. The first lessons cover holding the slide, muting and intonation from scratch.'],
  ['Are backing tracks included?', 'Every lesson comes with backing tracks at several tempos.'],
].map(([question, answer]) => ({ question, answer: [{ type: 'paragraph', text: answer, spans: [] }] }));

const aspects: Record<string, string | null> = {
  landscape: 'aspect-[4/3]',
  square: 'aspect-[1/1]',
  portrait: 'aspect-[4/5]',
  wide: 'aspect-[16/9]',
  original: null,
};

/**
 * "With Image" variation of Faqs: badge, title, intro, image and button on one side,
 * an accordion of questions on the other. Questions can be typed in the slice or
 * linked from FAQ documents. Uses native <details> (no JS, accessible, crawlable)
 * and can output FAQPage structured data.
 */
export const FaqWithImage = async ({ slice }: { slice: any }): Promise<JSX.Element | null> => {
  const primary = (slice?.primary || {}) as any;
  const rows: any[] = Array.isArray(primary.questions) ? primary.questions : [];

  // Linked FAQ documents, fetched in one request
  const ids = rows.map((r) => (isFilled.contentRelationship(r?.faq) ? r.faq.id : null)).filter(Boolean) as string[];
  const docs = ids.length
    ? await createClient()
        .getByIDs(ids, { pageSize: 100 })
        .then((res) => new Map(res.results.map((d: any) => [d.id, d])))
        .catch(() => new Map())
    : new Map();

  let questions: QA[] = rows
    .map((r) => {
      const doc: any = isFilled.contentRelationship(r?.faq) ? docs.get(r.faq.id) : null;
      return {
        question: r?.question || doc?.data?.heading || '',
        answer: isFilled.richText(r?.answer) ? r.answer : doc?.data?.body,
      };
    })
    .filter((q) => q.question && isFilled.richText(q.answer));

  if (questions.length === 0) {
    if (process.env.NODE_ENV === 'production') return null;
    questions = sampleQuestions; // preview in development / Slice Machine
  }

  const openMode = String(primary.open_behaviour || 'First open, one at a time').toLowerCase();
  const firstOpen = openMode.startsWith('first open');
  const exclusive = openMode.includes('one at a time');
  const groupName = `faq-${slice.id || 'list'}`;
  const imageRight = primary.image_position === 'Right';
  const aspect = aspects[String(primary.image_aspect_ratio || 'Landscape').toLowerCase()] ?? aspects.landscape;

  const c = {
    sectionBg: primary.section_bg_color || '#f3efe6',
    openBg: primary.open_item_bg_color || '#fbf9f5',
    divider: primary.divider_color || '#e2d9cb',
    question: primary.question_color || '#1c1917',
    answer: primary.answer_color || '#78716c',
    icon: primary.icon_color || '#1c1917',
    iconOpen: primary.icon_open_color || '#d85d18',
  };

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
  const questionFont = resolveFontFamily(primary.question_font, 'Inter Tight');

  const jsonLd =
    primary.add_faq_schema !== false
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: questions.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: asText(q.answer) },
          })),
        }
      : null;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn('w-full px-4 sm:px-6 lg:px-8 font-sans', sectionPaddingClass)}
      style={{ backgroundColor: c.sectionBg, ...sectionPaddingStyle(primary, 'Large') }}
    >
      {/* Mobile order: header → questions → image & button. Desktop: two columns. */}
      <div className={cn('max-w-[1280px] mx-auto grid grid-cols-1 gap-x-16 xl:gap-x-24 gap-y-10 items-start', imageRight ? 'lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]')}>
        <div className={cn('lg:row-start-1', imageRight ? 'lg:col-start-2' : 'lg:col-start-1')}>
          <BadgePill
            text={primary.badge_text || 'Help'}
            icon={primary.badge_icon}
            preset={primary.badge_icon_preset}
            bg={primary.badge_bg_color || '#ffffff'}
            textColor={primary.badge_text_color || '#d85d18'}
            iconColor={primary.badge_icon_color}
            borderColor={primary.badge_border_color}
            className="mb-5 sm:mb-6"
          />
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
              Frequently asked questions
            </h2>
          )}
          {isFilled.richText(primary.description) && (
            <div className={cn(introTypo.className, 'mt-5 sm:mt-6 max-w-lg leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:underline')} style={introTypo.style}>
              <PrismicRichText field={primary.description} />
            </div>
          )}
        </div>

        {/* Questions */}
        <div className={cn('lg:row-start-1 lg:row-span-2', imageRight ? 'lg:col-start-1' : 'lg:col-start-2')}>
          {questions.map((q, i) => (
            <details
              key={i}
              name={exclusive ? groupName : undefined}
              open={firstOpen && i === 0}
              className="group border-b transition-colors open:rounded-[12px] open:border-b-transparent open:bg-[color:var(--faq-open-bg)]"
              style={{ borderColor: c.divider, '--faq-open-bg': c.openBg } as React.CSSProperties}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 sm:px-6 py-5 sm:py-6 [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--faq-icon-open)] rounded-[12px]" style={{ '--faq-icon-open': c.iconOpen } as React.CSSProperties}>
                <span className={cn(questionFont.className, 'text-[1.125rem] sm:text-[1.375rem] leading-snug tracking-[-0.01em]')} style={{ fontFamily: questionFont.fontFamily, color: c.question }}>
                  {q.question}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="mt-1 w-5 h-5 shrink-0 transition-transform duration-200 group-open:rotate-180 text-[color:var(--faq-icon)] group-open:text-[color:var(--faq-icon-open)]"
                  style={{ '--faq-icon': c.icon, '--faq-icon-open': c.iconOpen } as React.CSSProperties}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-4 sm:px-6 pb-6 -mt-1 text-[0.95rem] sm:text-[1rem] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5" style={{ color: c.answer }}>
                <PrismicRichText field={q.answer} />
              </div>
            </details>
          ))}
        </div>

        {/* Image + button */}
        {(isFilled.image(primary.image) || (primary.buttons || []).length > 0) && (
          <div className={cn('lg:row-start-2', imageRight ? 'lg:col-start-2' : 'lg:col-start-1')}>
            {isFilled.image(primary.image) && (
              <div className={cn('relative w-full overflow-hidden rounded-[12px]', aspect)}>
                {aspect ? (
                  <PrismicNextImage field={primary.image} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" fallbackAlt="" />
                ) : (
                  <PrismicNextImage field={primary.image} sizes="(max-width: 1024px) 100vw, 560px" className="w-full h-auto" fallbackAlt="" />
                )}
              </div>
            )}
            <ButtonRow
              className="mt-6 sm:mt-8 [&>*]:flex-1"
              buttons={primary.buttons}
              font={primary.button_font}
              radius={primary.button_radius}
              colors={{
                filledBg: primary.button_bg_color || '#1c1917',
                filledText: primary.button_text_color || '#ffffff',
                filledHoverBg: primary.button_hover_bg_color || '#d85d18',
                filledHoverText: primary.button_hover_text_color || '#ffffff',
                outlineColor: primary.outline_button_color || '#1c1917',
                outlineHoverBg: primary.outline_button_hover_bg_color || '#1c1917',
                outlineHoverText: primary.outline_button_hover_text_color || '#ffffff',
              }}
            />
          </div>
        )}
      </div>

      {jsonLd && (
        // Escape '<' so answer text can never close the script tag
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      )}
    </section>
  );
};

export default FaqWithImage;
