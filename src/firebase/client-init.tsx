
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseProvider, type FirebaseContextValue } from './provider';
import { firebaseConfig } from './config';

export function FirebaseClientInit({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !instances) {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setInstances({ app, auth, firestore });
    }
  }, [instances]);

  if (!instances) {
    return null; // or a loading component
  }

  return <FirebaseProvider value={instances}>{children}</FirebaseProvider>;
}
