'use client';

import type { ReactNode } from 'react';
import { FirebaseProvider, type FirebaseContextValue } from './provider';

// This provider is used to wrap the app and provide the Firebase context.
// Initialization is handled on-demand by hooks or components that need it.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // The value is null initially and will be set by the initialization logic.
  const initialValue: FirebaseContextValue = {
    app: null,
    auth: null,
    firestore: null,
  };

  return <FirebaseProvider value={initialValue}>{children}</FirebaseProvider>;
}
