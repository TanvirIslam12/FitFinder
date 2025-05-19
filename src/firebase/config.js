// File: src/firebase/config.js
// Role: Initializes Firebase and exports Firebase services.

import { initializeApp, getApp, getApps } from 'firebase/app';
// It's good practice to alias getAuth if you're also using a variable named 'auth' for the instance
import { initializeAuth, getReactNativePersistence, getAuth as getFirebaseAuthInstance } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// User's actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRmrCwpILT6ZVCs7_5HVv4ToxvK9vIA3U",
  authDomain: "fitfinder-6fbfe.firebaseapp.com",
  projectId: "fitfinder-6fbfe",
  storageBucket: "fitfinder-6fbfe.firebasestorage.app", // Included as per user's provided config
  messagingSenderId: "492722886539",
  appId: "1:492722886539:web:6dd03dc9c492c7d469018e"
};

let app;
let authInstance; // Using a different variable name internally for clarity
let firestoreInstance; // Using a different variable name internally

// Step 1: Initialize or get the Firebase App instance
if (getApps().length === 0) {
  console.log("[FirebaseConfig] Firebase App is not initialized. Attempting to initialize...");
  try {
    app = initializeApp(firebaseConfig);
    console.log("[FirebaseConfig] Firebase App initialized successfully via initializeApp().");
  } catch (e) {
    console.error("[FirebaseConfig] CRITICAL: Firebase App core initialization (initializeApp) FAILED:", e);
    // If app initialization fails here, subsequent Firebase service initializations will also fail.
    // This is a critical error that needs to be addressed (e.g., check firebaseConfig).
  }
} else {
  console.log("[FirebaseConfig] Firebase App already initialized. Getting existing App instance...");
  app = getApp();
  console.log("[FirebaseConfig] Existing Firebase App instance retrieved.");
}

// Step 2: Initialize Firebase services (Auth, Firestore) only if the 'app' instance is valid
if (app) {
  console.log("[FirebaseConfig] Firebase App instance is valid. Proceeding with Auth and Firestore initialization...");

  // Initialize Authentication
  try {
    console.log("[FirebaseConfig] Attempting to initialize Auth with persistence...");
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    console.log("[FirebaseConfig] Firebase Auth with persistence initialized successfully.");
  } catch (authError) {
    console.error("[FirebaseConfig] Firebase Auth with persistence (initializeAuth) FAILED:", authError);
    console.warn("[FirebaseConfig] Falling back to basic Firebase Auth initialization (getAuth)...");
    try {
      authInstance = getFirebaseAuthInstance(app); // Fallback to basic auth initialization
      console.log("[FirebaseConfig] Basic Firebase Auth (getAuth) initialized successfully as fallback.");
    } catch (basicAuthError) {
        console.error("[FirebaseConfig] CRITICAL: Basic Firebase Auth (getAuth) fallback FAILED:", basicAuthError);
        authInstance = null; // Ensure authInstance is null if all attempts fail
    }
  }

  // Initialize Firestore
  try {
    firestoreInstance = getFirestore(app);
    console.log("[FirebaseConfig] Firestore instance initialized/retrieved successfully.");
  } catch (firestoreError) {
    console.error("[FirebaseConfig] CRITICAL: Firestore initialization (getFirestore) FAILED:", firestoreError);
    firestoreInstance = null; // Ensure firestoreInstance is null if it fails
  }

} else {
  console.error("[FirebaseConfig] Firebase App instance is NOT valid. Auth and Firestore CANNOT be initialized.");
  // Set services to null if app is not available, so the app can potentially check for this.
  authInstance = null;
  firestoreInstance = null;
}

// Export the initialized services, aliasing them back to 'auth' and 'firestore' for consistency
// It's crucial that the rest of your app checks if these are null before using them if initialization can fail.
export { app, authInstance as auth, firestoreInstance as firestore };
