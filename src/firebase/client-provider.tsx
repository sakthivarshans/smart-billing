'use client';

import { ReactNode } from 'react';
import { getFirebase } from '.';
import { FirebaseProvider } from './provider';

// This provider is used to initialize Firebase on the client side.
// It ensures that Firebase is initialized only once.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseApp = getFirebase();
  return <FirebaseProvider value={{ app: firebaseApp }}>{children}</FirebaseProvider>;
}
