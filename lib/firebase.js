// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase config is valid
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.appId;
};

// Log configuration status
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Configuration Status:');
  console.log('✅ API Key:', firebaseConfig.apiKey ? 'Present' : '❌ Missing');
  console.log('✅ Auth Domain:', firebaseConfig.authDomain ? 'Present' : '❌ Missing');
  console.log('✅ Project ID:', firebaseConfig.projectId ? 'Present' : '❌ Missing');
  console.log('✅ App ID:', firebaseConfig.appId ? 'Present' : '❌ Missing');
  
  if (!isFirebaseConfigValid()) {
    console.error('❌ Firebase configuration is incomplete!');
    console.log('🔧 Please check your .env.local file or create a new Firebase project');
  }
}

// Initialize Firebase only if no apps exist and config is valid
let app;
try {
  if (isFirebaseConfigValid()) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  } else {
    console.warn('⚠️ Firebase not initialized due to missing configuration');
    app = null;
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  app = null;
}

// Initialize services with error handling
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const functions = app ? getFunctions(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;