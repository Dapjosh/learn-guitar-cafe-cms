'use client';

import React, { useActionState } from 'react';
import { cn } from '@lgc_cms/util';
import { subscribeToNewsletter, type SubscribeState } from './actions';

const initialState: SubscribeState = { status: 'idle', message: '' };

export type NewsletterFormProps = {
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
  groupId?: string | null;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  fontFamily: string;
  fontClass: string;
};

/**
 * Email sign-up form for the Footer slice (inline input + button,
 * stacked on very small screens). Submits via a server action.
 */
export const NewsletterForm = ({
  placeholder,
  buttonLabel,
  successMessage,
  groupId,
  inputBg,
  inputBorder,
  inputText,
  buttonBg,
  buttonText,
  buttonHoverBg,
  buttonHoverText,
  fontFamily,
  fontClass,
}: NewsletterFormProps) => {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialState
  );

  if (state.status === 'success') {
    return (
      <p className="text-sm sm:text-[0.95rem] py-3" role="status" style={{ color: inputText }}>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={cn('w-full', fontClass)} style={{ fontFamily }} noValidate>
      <input type="hidden" name="group_id" value={groupId || ''} />
      <input type="hidden" name="success_message" value={successMessage} />
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          {placeholder}
        </label>
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={placeholder}
          aria-invalid={state.status === 'error' || undefined}
          aria-describedby={state.message ? 'footer-newsletter-status' : undefined}
          className="min-w-0 flex-1 h-12 rounded-md border px-4 text-sm sm:text-[0.95rem] placeholder:text-[color:var(--nl-placeholder)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--nl-btn-bg)]"
          style={
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputText,
              '--nl-placeholder': `color-mix(in srgb, ${inputText} 60%, transparent)`,
              '--nl-btn-bg': buttonBg,
            } as React.CSSProperties
          }
        />
        <button
          type="submit"
          disabled={pending}
          className="slice-custom-btn h-12 shrink-0 rounded-md border px-5 sm:px-6 text-sm sm:text-[0.95rem] disabled:opacity-70 disabled:cursor-wait"
          style={
            {
              fontFamily,
              '--btn-bg': buttonBg,
              '--btn-text': buttonText,
              '--btn-border': buttonBg,
              '--btn-hover-bg': buttonHoverBg,
              '--btn-hover-text': buttonHoverText,
              '--btn-hover-border': buttonHoverBg,
            } as React.CSSProperties
          }
        >
          {pending ? 'Subscribing…' : buttonLabel}
        </button>
      </div>
      {state.status === 'error' && state.message && (
        <p id="footer-newsletter-status" role="alert" className="mt-2 text-sm text-[#f59e7a]">
          {state.message}
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
