import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { asText, isFilled } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';

import { createClient } from '@/prismicio';
import { components } from '@/slices';

/**
 * /contact — built from the "Contact" single document in Prismic.
 * Uses the document's slices (Contact Info, Contact Form, …). If it has none yet,
 * the two sections are built from the document's own fields (heading, subtitle,
 * email, phone, form image/heading/body) plus the social links in Settings.
 */
async function getContactPage() {
  return createClient()
    .getSingle('contact')
    .catch(() => null);
}

/** 1200×630 social image via Prismic's imgix params. */
const shareImageUrl = (raw: string) => {
  const url = new URL(raw);
  url.searchParams.set('w', '1200');
  url.searchParams.set('h', '630');
  url.searchParams.set('fit', 'crop');
  return url.toString();
};

const heading = (type: 'heading1' | 'heading2', text: string) => [{ type, text, spans: [] }];
const paragraph = (text: string) => (text ? [{ type: 'paragraph', text, spans: [] }] : []);

const PLATFORMS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'X',
  tiktok: 'TikTok',
};

/** Slices built from the Contact document's fields (used until editors add slices). */
function slicesFromFields(d: any, settings: any) {
  const socials = (settings?.social_media || [])
    .filter((s: any) => isFilled.link(s?.url))
    .map((s: any) => ({ platform: PLATFORMS[String(s.type || '').toLowerCase()] || 'Website', link: s.url }));

  const cards = [
    d.email_address && { icon: 'Email', title: 'Email', email: d.email_address },
    d.phone_number && { icon: 'Phone', title: 'Phone', phone: d.phone_number },
    socials.length > 0 && { icon: 'Community', title: 'Community', show_social: true },
  ].filter(Boolean);

  const title = asText(d.heading) || 'Have a question about lessons or tone?';
  return [
    {
      id: 'contact-info',
      slice_type: 'contact_info',
      variation: 'default',
      version: 'initial',
      slice_label: null,
      items: [],
      primary: { title: heading('heading1', title), description: paragraph(d.subtitle || ''), cards, social_links: socials },
    },
    {
      id: 'contact-form',
      slice_type: 'contact_form',
      variation: 'default',
      version: 'initial',
      slice_label: null,
      items: [],
      primary: {
        title: heading('heading2', d.form_heading || 'Send us a message'),
        description: paragraph(d.form_body || ''),
        image: d.form_image,
        padding_top: 'None',
      },
    },
  ];
}

export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const page = await getContactPage();
  const d = (page?.data ?? {}) as any;
  const parentMeta = await parent;
  const title = d.meta_title || asText(d.heading) || 'Contact';

  return {
    title,
    description: d.meta_description || d.subtitle || parentMeta.description,
    alternates: { canonical: '/contact' },
    openGraph: {
      title,
      ...(isFilled.image(d.meta_image) ? { images: [{ url: shareImageUrl(d.meta_image.url) }] } : {}),
    },
  };
}

export default async function ContactPage() {
  const client = createClient();
  const [page, settings] = await Promise.all([getContactPage(), client.getSingle('settings').catch(() => null)]);

  // Development preview before the Contact document is published: build from empty fields (defaults)
  if (!page && process.env.NODE_ENV === 'production') notFound();
  const d = (page?.data ?? {}) as any;

  const slices = Array.isArray(d.slices) && d.slices.length > 0 ? d.slices : slicesFromFields(d, settings?.data);

  return (
    <main>
      <SliceZone slices={slices} components={components} />
    </main>
  );
}
