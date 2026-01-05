'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

export const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export type FirebaseProviderProps = {
  children: ReactNode;
  value: { app: FirebaseApp | null };
};

export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  const [services, setServices] = useState<Omit<FirebaseContextValue, 'app'>>({ auth: null, firestore: null });

  useEffect(() => {
    if (value.app) {
      setServices({
        auth: getAuth(value.app),
        firestore: getFirestore(value.app),
      });
    }
  }, [value.app]);

  const contextValue = {
    ...value,
    ...services,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}
