import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Called by the Prismic webhook whenever content is published or unpublished.
 *
 * - Expires all cached Prismic data immediately (not "stale-while-revalidate"),
 *   so the very next visitor gets the new content.
 * - Also expires every cached page, including pages pre-built at deploy time.
 *
 * Optional: set PRISMIC_WEBHOOK_SECRET (same value as the webhook's "Secret" in Prismic)
 * so only Prismic can trigger this.
 */
export async function POST(request: Request) {
  const expectedSecret = process.env.PRISMIC_WEBHOOK_SECRET;

  if (expectedSecret) {
    const body = await request.json().catch(() => null);
    if (body?.secret !== expectedSecret) {
      console.warn('[revalidate] Rejected request with a missing or wrong secret');
      return NextResponse.json({ revalidated: false, message: 'Invalid secret' }, { status: 401 });
    }
  }

  revalidateTag('prismic', { expire: 0 });
  revalidatePath('/', 'layout');

  console.log('[revalidate] Prismic content and all pages revalidated');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
