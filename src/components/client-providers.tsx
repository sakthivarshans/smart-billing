'use client';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import type { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
