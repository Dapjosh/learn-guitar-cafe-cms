/**
 * Adds (or updates) a subscriber in MailerLite, optionally into a group.
 * Server-only: needs MAILERLITE_API_KEY. Re-subscribing an existing email is fine (MailerLite upserts).
 */
export async function addMailerLiteSubscriber({
  email,
  name,
  groupId,
}: {
  email: string;
  name?: string;
  groupId?: string | null;
}): Promise<{ ok: true } | { ok: false; reason: 'not-configured' | 'invalid' | 'failed' }> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.error('[mailerlite] MAILERLITE_API_KEY is not set; cannot subscribe.');
    return { ok: false, reason: 'not-configured' };
  }

  // Group IDs are numeric in MailerLite; ignore anything else
  const group = groupId && /^\d{1,30}$/.test(groupId.trim()) ? groupId.trim() : null;

  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        ...(name ? { fields: { name } } : {}),
        ...(group ? { groups: [group] } : {}),
      }),
      cache: 'no-store',
    });
    if (res.ok) return { ok: true };
    if (res.status === 422) return { ok: false, reason: 'invalid' };
    console.error('[mailerlite] Responded with', res.status, await res.text().catch(() => ''));
  } catch (error) {
    console.error('[mailerlite] Request failed', error);
  }
  return { ok: false, reason: 'failed' };
}
