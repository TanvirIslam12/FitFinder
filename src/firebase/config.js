import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRmrCwpILT6ZVCs7_5HVv4ToxvK9vIA3U",
  authDomain: "fitfinder-6fbfe.firebaseapp.com",
  projectId: "fitfinder-6fbfe",
  storageBucket: "fitfinder-6fbfe.firebasestorage.app",
  messagingSenderId: "492722886539",
  appId: "1:492722886539:web:6dd03dc9c492c7d469018e"
};

// Initialize Firebase
let app;
let auth;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    console.error("Firebase initialization error (in try-catch):", error);

    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app); 
  }
} else {
  app = getApp(); 
  auth = getAuth(app);
}


// Initialize other Firebase services
const firestore = getFirestore(app);



export { app, auth, firestore };
