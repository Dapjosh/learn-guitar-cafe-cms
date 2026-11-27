import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { asText } from '@prismicio/client';

import { createClient, repositoryName } from '@/prismicio';
import { CopyLinkButton } from './CopyLinkButton';

/**
 * /admin/links: an editor page listing every published page with its live URL,
 * so editors can copy or open a product page right after publishing.
 * Optional protection: set EDITOR_LINKS_KEY and open /admin/links?key=<value>.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Page links',
  robots: { index: false, follow: false },
};

const GROUPS: { label: string; types: string[]; open: boolean }[] = [
  { label: 'Product pages', types: ['landing_page'], open: true },
  {
    label: 'Main pages',
    types: ['home', 'courses_page', 'my_story_page', 'contact', 'page'],
    open: false,
  },
  { label: 'Blog posts', types: ['blog_post'], open: false },
  { label: 'Legal pages', types: ['legal'], open: false },
];

const titleOf = (doc: any): string => {
  const d = doc.data || {};
  for (const field of [d.title, d.meta_title]) {
    if (typeof field === 'string' && field.trim()) return field.trim();
    if (Array.isArray(field)) {
      const text = (asText(field as any) || '').trim();
      if (text) return text;
    }
  }
  return doc.uid || doc.type;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

type Props = { searchParams: Promise<{ key?: string }> };

export default async function EditorLinksPage({ searchParams }: Props) {
  const { key } = await searchParams;
  const requiredKey = process.env.EDITOR_LINKS_KEY;

  if (requiredKey && key !== requiredKey) {
    return (
      <main className="lgc-links">
        <div className="lgc-links__wrap">
          <h1 className="lgc-links__title">Page links</h1>
          <p className="lgc-links__muted">
            Sorry, you cannot access this page. You have not provided the
            correct value in the URL.
          </p>
        </div>
      </main>
    );
  }

  // Always read fresh from Prismic so a page shows up the moment it's published
  const client = createClient({ fetchOptions: { cache: 'no-store' } } as any);
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ||
    (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  const groups = await Promise.all(
    GROUPS.map(async (group) => {
      const docs = (
        await Promise.all(
          group.types.map((type) =>
            client.getAllByType(type as any).catch(() => [] as any[])
          )
        )
      )
        .flat()
        .filter((doc: any) => doc.url)
        .sort((a: any, b: any) =>
          b.last_publication_date.localeCompare(a.last_publication_date)
        );
      return { ...group, docs };
    })
  );

  return (
    <main className="lgc-links">
      <div className="lgc-links__wrap">
        <p className="lgc-links__eyebrow">For editors</p>
        <h1 className="lgc-links__title">Page links</h1>
        <p className="lgc-links__muted">
          Every published page and its live address. Newly published pages
          appear here straight away (refresh the page). Drafts don't show up
          here: use the Preview button in Prismic for those.
        </p>

        {groups.map((group) => (
          <details
            key={group.label}
            className="lgc-links__group"
            open={group.open || undefined}
          >
            <summary className="lgc-links__summary">
              {group.label}{' '}
              <span className="lgc-links__count">{group.docs.length}</span>
            </summary>
            {group.docs.length === 0 ? (
              <p className="lgc-links__muted lgc-links__empty">
                Nothing published yet.
              </p>
            ) : (
              <ul className="lgc-links__list">
                {group.docs.map((doc: any) => {
                  const url = `${origin}${doc.url}`;
                  return (
                    <li key={doc.id} className="lgc-links__item">
                      <div className="lgc-links__info">
                        <p className="lgc-links__name">{titleOf(doc)}</p>
                        <p className="lgc-links__url">{url}</p>
                        <p className="lgc-links__date">
                          Last published {formatDate(doc.last_publication_date)}
                        </p>
                      </div>
                      <div className="lgc-links__actions">
                        <CopyLinkButton url={url} />
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener"
                          className="lgc-links-btn"
                        >
                          Open
                        </a>
                        <a
                          href={`https://${repositoryName}.prismic.io/builder/pages/${doc.id}`}
                          target="_blank"
                          rel="noopener"
                          className="lgc-links-btn"
                        >
                          Edit
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </details>
        ))}
      </div>
    </main>
  );
}
