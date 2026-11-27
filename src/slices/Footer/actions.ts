'use server';

import { addMailerLiteSubscriber } from '@/utils/mailerlite';

export type SubscribeState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter sign-up from the Footer slice.
 * Adds the email to MailerLite (optionally to a group set in the CMS).
 * Requires the MAILERLITE_API_KEY environment variable on the server.
 */
export async function subscribeToNewsletter(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get('email') || '').trim();
  const groupId = String(formData.get('group_id') || '').trim();
  const successMessage =
    String(formData.get('success_message') || '').trim() ||
    'Thanks! You’re on the list.';

  if (!EMAIL_PATTERN.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  const result = await addMailerLiteSubscriber({ email, groupId });
  if (result.ok) return { status: 'success', message: successMessage };
  if (result.reason === 'not-configured') {
    return {
      status: 'error',
      message: 'Sign-up is temporarily unavailable. Please try again later.',
    };
  }
  if (result.reason === 'invalid') {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  return {
    status: 'error',
    message: 'Something went wrong. Please try again.',
  };
}
