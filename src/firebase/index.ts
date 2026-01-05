import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import { 
    FirebaseProvider, 
    useFirebaseApp, 
    useFirestore, 
    useAuth 
} from './provider';
import { FirebaseClientProvider } from './client-provider';


export type FirebaseInstances = {
  app: FirebaseApp;
  auth?: Auth;
  firestore?: Firestore;
};

// Initializes and returns a new Firebase app instance.
function initializeFirebase(): FirebaseApp {
  return initializeApp(firebaseConfig);
}

// Gets the existing Firebase app instance or initializes a new one.
function getFirebase(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  } else {
    return initializeFirebase();
  }
}

export {
  getFirebase,
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
