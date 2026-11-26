'use client';

import React, { useActionState, useState } from 'react';
import { cn } from '@lgc_cms/util';
import { sendContactMessage, type ContactState } from './actions';

const initialState: ContactState = { status: 'idle', message: '' };

export type ContactFormText = {
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  hint: string;
  buttonLabel: string;
  successMessage: string;
};

export type ContactFormColors = {
  label: string;
  required: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  focus: string;
  hint: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
};

type FieldName = 'first_name' | 'last_name' | 'email' | 'message';

/**
 * Contact form (client): labelled fields with required markers, character limit,
 * per-field errors and a success state. Fields keep their values if sending fails.
 */
export const ContactFormFields = ({
  text,
  colors,
  maxLength,
  fontFamily,
}: {
  text: ContactFormText;
  colors: ContactFormColors;
  maxLength: number;
  fontFamily: string;
}) => {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const [values, setValues] = useState<Record<FieldName, string>>({ first_name: '', last_name: '', email: '', message: '' });
  const set = (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }));

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-md border px-5 py-6 text-[1rem]" style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }}>
        {state.message}
      </div>
    );
  }

  const errors = state.fieldErrors || {};
  const inputClass =
    'w-full rounded-md border px-4 text-[0.95rem] transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cf-focus)] placeholder:text-[color:var(--cf-placeholder)]';
  const inputStyle = {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    color: colors.inputText,
    '--cf-focus': colors.focus,
    '--cf-placeholder': `color-mix(in srgb, ${colors.inputText} 55%, transparent)`,
  } as React.CSSProperties;

  const field = (name: FieldName, label: string, input: React.ReactNode) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={`cf-${name}`} className="text-sm font-semibold" style={{ color: colors.label }}>
        {label}{' '}
        <span style={{ color: colors.required }} aria-hidden="true">
          *
        </span>
      </label>
      {input}
      {errors[name] && (
        <p id={`cf-${name}-error`} className="text-sm text-[#b42318]">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const aria = (name: FieldName) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `cf-${name}-error` : undefined,
  });

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-5 sm:gap-6" style={{ fontFamily }}>
      <input type="hidden" name="max_length" value={maxLength} />
      <input type="hidden" name="success_message" value={text.successMessage} />
      {/* Honeypot for spam bots: hidden from people and screen readers */}
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-company_website">Company website</label>
        <input id="cf-company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
        {field(
          'first_name',
          text.firstNameLabel,
          <input id="cf-first_name" name="first_name" type="text" autoComplete="given-name" required maxLength={80} value={values.first_name} onChange={set('first_name')} placeholder={text.firstNamePlaceholder} className={cn(inputClass, 'h-12')} style={inputStyle} {...aria('first_name')} />
        )}
        {field(
          'last_name',
          text.lastNameLabel,
          <input id="cf-last_name" name="last_name" type="text" autoComplete="family-name" required maxLength={80} value={values.last_name} onChange={set('last_name')} placeholder={text.lastNamePlaceholder} className={cn(inputClass, 'h-12')} style={inputStyle} {...aria('last_name')} />
        )}
      </div>

      {field(
        'email',
        text.emailLabel,
        <input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} value={values.email} onChange={set('email')} placeholder={text.emailPlaceholder} className={cn(inputClass, 'h-12')} style={inputStyle} {...aria('email')} />
      )}

      <div className="flex flex-col gap-2">
        {field(
          'message',
          text.messageLabel,
          <textarea id="cf-message" name="message" required rows={6} maxLength={maxLength} value={values.message} onChange={set('message')} placeholder={text.messagePlaceholder} className={cn(inputClass, 'py-3 resize-y min-h-[144px]')} style={inputStyle} {...aria('message')} />
        )}
        <p className="text-sm flex justify-between gap-4" style={{ color: colors.hint }}>
          <span>{text.hint}</span>
          {values.message.length > maxLength * 0.8 && (
            <span className="tabular-nums" aria-live="polite">
              {values.message.length.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          )}
        </p>
      </div>

      {state.status === 'error' && state.message && (
        <p role="alert" className="text-sm text-[#b42318]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="slice-custom-btn group mt-1 w-full h-12 rounded-md border inline-flex items-center justify-center gap-3 text-[0.95rem] disabled:opacity-70 disabled:cursor-wait"
        style={
          {
            '--btn-bg': colors.buttonBg,
            '--btn-text': colors.buttonText,
            '--btn-border': colors.buttonBg,
            '--btn-hover-bg': colors.buttonHoverBg,
            '--btn-hover-text': colors.buttonHoverText,
            '--btn-hover-border': colors.buttonHoverBg,
          } as React.CSSProperties
        }
      >
        {pending ? 'Sending…' : text.buttonLabel}
        {!pending && (
          <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </form>
  );
};

export default ContactFormFields;
