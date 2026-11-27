'use server';

import { addMailerLiteSubscriber } from '@/utils/mailerlite';

export type LeadState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors?: Partial<Record<'name' | 'email', string>>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Lead form on product landing pages: adds the visitor to a MailerLite group
 * (set per slice in Prismic). A MailerLite automation on that group sends the lesson.
 */
export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Honeypot: real visitors never fill this
  if (String(formData.get('company_website') ?? '').trim()) {
    return { status: 'success', message: 'Thanks! Check your inbox.' };
  }

  const name = String(formData.get('name') ?? '').trim().slice(0, 80);
  const email = String(formData.get('email') ?? '').trim().slice(0, 254);
  const nameRequired = formData.get('name_required') === 'true';
  const groupId = String(formData.get('group_id') ?? '').trim();
  const successMessage = String(formData.get('success_message') ?? '').trim().slice(0, 300) || 'Thanks! Check your inbox for the lesson.';

  const fieldErrors: LeadState['fieldErrors'] = {};
  if (nameRequired && !name) fieldErrors.name = 'Please enter your first name.';
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = 'Please enter a valid email address.';
  if (Object.keys(fieldErrors).length) return { status: 'error', message: '', fieldErrors };

  const result = await addMailerLiteSubscriber({ email, name, groupId });
  if (result.ok) return { status: 'success', message: successMessage };
  if (result.reason === 'invalid') return { status: 'error', message: '', fieldErrors: { email: 'Please enter a valid email address.' } };
  if (result.reason === 'not-configured') return { status: 'error', message: 'Sign-up is temporarily unavailable. Please try again later.' };
  return { status: 'error', message: 'Something went wrong. Please try again.' };
}
