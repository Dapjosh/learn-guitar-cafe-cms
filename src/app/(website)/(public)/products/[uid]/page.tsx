import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { isFilled } from '@prismicio/client';
import { SliceZone } from '@prismicio/react';

import { createClient } from '@/prismicio';
import { components } from '@/slices';
import productHeroMocks from '@/slices/ProductHero/mocks.json';
import leadFormMocks from '@/slices/LeadForm/mocks.json';
import deliverablesMocks from '@/slices/Deliverables/mocks.json';
import faqMocks from '@/slices/Faqs/mocks.json';
import thrivecartMocks from '@/slices/ThriveCartCheckout/mocks.json';

/**
 * /products/<uid> — product landing pages, built from "Landing Page" documents in Prismic.
 * In development, /products/preview-sample shows the landing-page slices with sample content.
 */
type Props = { params: Promise<{ uid: string }> };

const PREVIEW_UID = 'preview-sample';
const isDev = process.env.NODE_ENV !== 'production';

async function getLandingPage(uid: string) {
  return createClient()
    .getByUID('landing_page' as any, uid)
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

/** Slice Machine mock value → the shape Prismic returns (development preview only). */
function fromMock(value: any): any {
  if (!value || typeof value !== 'object') return value;
  switch (value.__TYPE__) {
    case 'FieldContent':
    case 'BooleanContent':
      return value.value;
    case 'StructuredTextContent':
      return value.value.map((b: any) => ({ type: b.type, text: b.content.text, spans: b.content.spans || [] }));
    case 'GroupContentType':
      return value.value.map((item: any) => Object.fromEntries(item.value.map(([k, v]: [string, any]) => [k, fromMock(v)])));
    case 'LinkContent':
      return { link_type: 'Web', url: value.value?.url };
    default:
      return {};
  }
}

const sampleSlices = () =>
  [
    ['product_hero', (productHeroMocks as any[])[0]],
    ['lead_form', (leadFormMocks as any[])[0]],
    ['deliverables', (deliverablesMocks as any[])[0]],
    ['faqs', (faqMocks as any[]).find((m) => m.variation === 'withImage')],
    ['thrivecart_checkout', (thrivecartMocks as any[])[0]],
  ]
    .filter(([, mock]) => mock)
    .map(([type, mock]: any, i) => ({
      id: `sample-${i}`,
      slice_type: type,
      slice_label: null,
      variation: mock.variation,
      version: 'initial',
      primary: Object.fromEntries(Object.entries(mock.primary).map(([k, v]) => [k, fromMock(v)])),
      items: [],
    }));

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { uid } = await params;
  const page = await getLandingPage(uid);
  if (!page) return {};
  const d = page.data as any;
  const parentMeta = await parent;
  const title = d.meta_title || d.title || parentMeta.title;

  return {
    title,
    description: d.meta_description || parentMeta.description,
    alternates: { canonical: `/products/${uid}` },
    robots: d.no_index ? { index: false, follow: false } : undefined,
    openGraph: {
      title: title || undefined,
      ...(isFilled.image(d.meta_image) ? { images: [{ url: shareImageUrl(d.meta_image.url) }] } : {}),
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { uid } = await params;

  if (uid === PREVIEW_UID && isDev) {
    return (
      <main>
        <SliceZone slices={sampleSlices() as any} components={components} />
      </main>
    );
  }

  const page = await getLandingPage(uid);
  if (!page) notFound();

  return (
    <main>
      <SliceZone slices={(page.data as any).slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const pages = await createClient()
    .getAllByType('landing_page' as any)
    .catch(() => []);
  return pages.map((p: any) => ({ uid: p.uid }));
}
