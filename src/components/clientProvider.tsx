'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

import { UIProvider } from '@lgc_cms/hooks';
import { ConfettiProvider } from '@lgc_cms/providers';

type ClientProvidersProps = {
  children: React.ReactNode;
};

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <UIProvider>
      <ConfettiProvider />
      {children}
      <Toaster position="bottom-center" />
    </UIProvider>
  );
}

export default ClientProviders;
