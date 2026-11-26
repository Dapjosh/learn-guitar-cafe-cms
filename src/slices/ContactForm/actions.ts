'use server';

import { createClient } from '@/prismicio';

export type ContactState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  /** Per-field errors shown under the inputs */
  fieldErrors?: Partial<Record<'first_name' | 'last_name' | 'email' | 'message', string>>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Hard server-side cap, whatever the form's own limit says */
const MAX_MESSAGE = 5000;
const MAX_NAME = 80;

const clean = (value: FormDataEntryValue | null, max: number) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);

/** Where messages go: the Contact document's email address (editable in Prismic), else CONTACT_TO_EMAIL. */
async function recipient(): Promise<string | null> {
  const fromCms = await createClient()
    .getSingle('contact')
    .then((d: any) => String(d?.data?.email_address || '').trim())
    .catch(() => '');
  const to = fromCms || process.env.CONTACT_TO_EMAIL || '';
  return EMAIL_PATTERN.test(to) ? to : null;
}

/**
 * Contact form submission. Validates on the server, ignores bots (honeypot),
 * and sends the message by email through Resend (RESEND_API_KEY) with Reply-To set to the visitor.
 */
export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field
  if (String(formData.get('company_website') ?? '').trim()) {
    return { status: 'success', message: 'Thanks! Your message has been sent.' };
  }

  const firstName = clean(formData.get('first_name'), MAX_NAME);
  const lastName = clean(formData.get('last_name'), MAX_NAME);
  const email = clean(formData.get('email'), 254);
  const maxLength = Math.min(Math.max(Number(formData.get('max_length')) || 1000, 50), MAX_MESSAGE);
  const message = clean(formData.get('message'), MAX_MESSAGE);
  const successMessage = clean(formData.get('success_message'), 300) || 'Thanks! Your message has been sent. We’ll reply by email.';

  const fieldErrors: ContactState['fieldErrors'] = {};
  if (!firstName) fieldErrors.first_name = 'Please enter your first name.';
  if (!lastName) fieldErrors.last_name = 'Please enter your last name.';
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = 'Please enter a valid email address.';
  if (!message) fieldErrors.message = 'Please write a message.';
  else if (message.length > maxLength) fieldErrors.message = `Please keep your message under ${maxLength.toLocaleString()} characters.`;
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = await recipient();
  if (!apiKey || !to) {
    console.error('[contact] Missing RESEND_API_KEY or a recipient (Contact document email / CONTACT_TO_EMAIL).');
    return { status: 'error', message: 'Sorry, messages can’t be sent right now. Please email us directly.' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'Learn Guitar Cafe <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `New message from ${firstName} ${lastName}`,
        text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\n${message}`,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[contact] Resend responded with', res.status, await res.text().catch(() => ''));
      return { status: 'error', message: 'Sorry, something went wrong. Please try again.' };
    }
  } catch (error) {
    console.error('[contact] Send failed', error);
    return { status: 'error', message: 'Sorry, something went wrong. Please try again.' };
  }

  return { status: 'success', message: successMessage };
}
