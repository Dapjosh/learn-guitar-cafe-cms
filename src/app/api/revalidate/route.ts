import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(_request: Request) {
  revalidateTag('prismic', 'max');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
