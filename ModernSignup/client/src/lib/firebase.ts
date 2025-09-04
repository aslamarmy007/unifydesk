import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";

// Check if Firebase keys are available
const hasFirebaseKeys = import.meta.env.VITE_FIREBASE_API_KEY && 
                       import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                       import.meta.env.VITE_FIREBASE_APP_ID;

let auth: any = null;
let provider: GoogleAuthProvider | null = null;

if (hasFirebaseKeys) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { auth };

export function loginWithGoogle() {
  if (!auth || !provider) {
    alert('Google Sign-in is not available. Please configure Firebase keys or sign up with email.');
    return;
  }
  signInWithRedirect(auth, provider);
}

export function handleRedirect() {
  if (!auth) {
    return Promise.resolve(null);
  }
  return getRedirectResult(auth);
}
