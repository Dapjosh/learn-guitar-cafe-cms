import React, { Suspense } from 'react';
import { BackToTop, MainNavbar } from '@lgc_cms/layout';
import logo from '@assets/lgc.png';
import { createClient } from '@/prismicio';
import { Footer } from '@lgc_cms/layout/server';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = createClient();
  const navigation = await client.getSingle('navigation').catch(() => null);
  const settings = await client.getSingle('settings').catch(() => null);

  return (
    <>
      {/* Menu header */}
      <MainNavbar navigation={navigation?.data} logo={logo} />

      {children}

      {/* Footer */}

      {/* BackToTop */}
      <Suspense>
        <Footer
          navigation={navigation?.data || { links: [] }}
          logo={logo}
          secondaryNavigation={settings?.data?.secondary_navigation}
          social={settings?.data?.social_media}
          copyright={settings?.data?.copyright_line}
        />

        <BackToTop />
      </Suspense>
    </>
  );
}
