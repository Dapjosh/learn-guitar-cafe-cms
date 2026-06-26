'use client';
import { Button } from '@lgc_cms/shadcn-ui/server';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { currentFullPath } from '@lgc_cms/util';

export const UserAccountButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const open = () => {
    const returnTo = encodeURIComponent(currentFullPath(pathname, sp, window.location.hash));
    // this navigates to the intercepting modal route
    router.replace(`/account?returnTo=${returnTo}`, { scroll: false });
  };

  return (
    <Button variant="link" onClick={open}>
      Parent Profile
    </Button>
  );
};
