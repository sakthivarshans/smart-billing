
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function CustomerLoginClient() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/billing');
  }, [router]);
  return null;
}
