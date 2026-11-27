'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { submitLead, type LeadState } from './actions';

const initialState: LeadState = { status: 'idle', message: '' };

export type LeadFormFieldsProps = {
  nameLabel: string;
  namePlaceholder: string;
  showName: boolean;
  nameRequired: boolean;
  emailLabel: string;
  emailPlaceholder: string;
  buttonLabel: string;
  successMessage: string;
  redirectTo?: string | null;
  groupId?: string | null;
  colors: {
    label: string;
    inputBg: string;
    inputBorder: string;
    inputText: string;
    focus: string;
    buttonBg: string;
    buttonText: string;
    buttonHoverBg: string;
    buttonHoverText: string;
  };
};

/** Name + email lead form; adds the visitor to a MailerLite group, then shows a message or redirects. */
export const LeadFormFields = ({
  nameLabel,
  namePlaceholder,
  showName,
  nameRequired,
  emailLabel,
  emailPlaceholder,
  buttonLabel,
  successMessage,
  redirectTo,
  groupId,
  colors,
}: LeadFormFieldsProps) => {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const [values, setValues] = useState({ name: '', email: '' });

  // Optional thank-you page
  useEffect(() => {
    if (state.status === 'success' && redirectTo) window.location.assign(redirectTo);
  }, [state.status, redirectTo]);

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-md border px-5 py-6 text-[1rem]" style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }}>
        {redirectTo ? 'Thanks! Taking you there…' : state.message}
      </div>
    );
  }

  const errors = state.fieldErrors || {};
  const inputClass =
    'w-full h-12 rounded-md border px-4 text-[0.95rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lf-focus)] placeholder:text-[color:var(--lf-placeholder)]';
  const inputStyle = {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    color: colors.inputText,
    '--lf-focus': colors.focus,
    '--lf-placeholder': `color-mix(in srgb, ${colors.inputText} 55%, transparent)`,
  } as React.CSSProperties;

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-5">
      <input type="hidden" name="group_id" value={groupId || ''} />
      <input type="hidden" name="success_message" value={successMessage} />
      <input type="hidden" name="name_required" value={String(showName && nameRequired)} />
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="lf-company_website">Company website</label>
        <input id="lf-company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {showName && (
        <div className="flex flex-col gap-2">
          <label htmlFor="lf-name" className="text-sm font-semibold" style={{ color: colors.label }}>
            {nameLabel}
          </label>
          <input
            id="lf-name"
            name="name"
            type="text"
            autoComplete="given-name"
            maxLength={80}
            required={nameRequired}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder={namePlaceholder}
            className={inputClass}
            style={inputStyle}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'lf-name-error' : undefined}
          />
          {errors.name && <p id="lf-name-error" className="text-sm text-[#b42318]">{errors.name}</p>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="lf-email" className="text-sm font-semibold" style={{ color: colors.label }}>
          {emailLabel}
        </label>
        <input
          id="lf-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder={emailPlaceholder}
          className={inputClass}
          style={inputStyle}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'lf-email-error' : undefined}
        />
        {errors.email && <p id="lf-email-error" className="text-sm text-[#b42318]">{errors.email}</p>}
      </div>

      {state.status === 'error' && state.message && (
        <p role="alert" className="text-sm text-[#b42318]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="slice-custom-btn mt-1 w-full h-12 rounded-md border inline-flex items-center justify-center text-[0.95rem] font-medium disabled:opacity-70 disabled:cursor-wait"
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
        {pending ? 'Sending…' : buttonLabel}
      </button>
    </form>
  );
};

export default LeadFormFields;
