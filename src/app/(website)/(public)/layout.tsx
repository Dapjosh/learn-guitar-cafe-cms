import React, { Suspense } from 'react';
import { BackToTop, MainNavbar } from '@lgc_cms/layout';
import logo from '@assets/lgc.png';
import { createClient } from '@/prismicio';
import { Footer } from '@lgc_cms/layout/server';
import { SliceZone } from '@prismicio/react';
import { components } from '@/slices';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = createClient();
  const navigation = await client.getSingle('navigation').catch(() => null);
  const settings = await client.getSingle('settings').catch(() => null);
  // Site-wide footer built from the Footer slice in the `footer` single document
  const footer = await client.getSingle('footer' as any).catch(() => null);
  const footerSlices = (footer?.data as any)?.slices ?? [];
  // Scroll-to-top colours are set on the Footer slice (falls back to brand colours)
  const footerPrimary = footerSlices.find((s: any) => s.slice_type === 'footer')?.primary ?? {};

  return (
    <>
      {/* Menu header */}
      <MainNavbar navigation={navigation?.data} logo={logo} />

      {children}

      {/* Footer */}

      {/* BackToTop */}
      <Suspense>
        {footerSlices.length > 0 ? (
          <SliceZone slices={footerSlices} components={components} />
        ) : (
          // Legacy footer until a `footer` document is published in Prismic
          <Footer
            navigation={navigation?.data || { links: [] }}
            logo={logo}
            secondaryNavigation={settings?.data?.secondary_navigation}
            social={settings?.data?.social_media}
            copyright={settings?.data?.copyright_line}
          />
        )}

        <BackToTop
          bgColor={footerPrimary.back_to_top_bg_color}
          iconColor={footerPrimary.back_to_top_icon_color}
          hoverBgColor={footerPrimary.back_to_top_hover_bg_color}
          hoverIconColor={footerPrimary.back_to_top_hover_icon_color}
        />
      </Suspense>
    </>
  );
}
