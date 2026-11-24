'use server';

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

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.error(
      '[Footer newsletter] MAILERLITE_API_KEY is not set; cannot subscribe.'
    );
    return {
      status: 'error',
      message: 'Sign-up is temporarily unavailable. Please try again later.',
    };
  }

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
        ...(groupId ? { groups: [groupId] } : {}),
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      return { status: 'success', message: successMessage };
    }

    if (res.status === 422) {
      return { status: 'error', message: 'Please enter a valid email address.' };
    }

    console.error(
      '[Footer newsletter] MailerLite responded with',
      res.status,
      await res.text().catch(() => '')
    );
  } catch (error) {
    console.error('[Footer newsletter] Request failed', error);
  }

  return {
    status: 'error',
    message: 'Something went wrong. Please try again.',
  };
}
