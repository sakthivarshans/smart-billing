
'use client';

import type { ReactNode } from 'react';
import { FirebaseClientInit } from './client-init';

// This provider is used to initialize Firebase on the client side.
// It ensures that Firebase is initialized only once.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <FirebaseClientInit>{children}</FirebaseClientInit>;
}
