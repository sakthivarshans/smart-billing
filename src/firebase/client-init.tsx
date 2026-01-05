'use client';

import { useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientInit({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !instances) {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setInstances({ app, auth, firestore });
    }
  }, [instances]);

  if (!instances) {
    // You can return a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider value={{ app: instances.app, auth: instances.auth, firestore: instances.firestore }}>
      {children}
    </FirebaseProvider>
  );
}
