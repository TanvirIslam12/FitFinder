import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  
} from 'firebase/auth';
import { auth } from './config';


export const signUpUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    return userCredential;
  } catch (error) {
    
    let errorMessage = "An unknown error occurred during sign up.";
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "This email address is already in use by another account.";
        break;
      case 'auth/invalid-email':
        errorMessage = "The email address is not valid.";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "Email/password accounts are not enabled.";
        break;
      case 'auth/weak-password':
        errorMessage = "The password is too weak. Please choose a stronger password.";
        break;
      default:
        errorMessage = error.message; 
    }
    console.error("AuthService SignUp Error: ", error.code, error.message);
    throw new Error(errorMessage);
  }
};


export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    let errorMessage = "An unknown error occurred during sign in.";
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "The email address is not valid.";
        break;
      case 'auth/user-disabled':
        errorMessage = "This user account has been disabled.";
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password': 
      case 'auth/invalid-credential':
        errorMessage = "Invalid email or password. Please try again.";
        break;
      default:
        errorMessage = error.message;
    }
    console.error("AuthService SignIn Error: ", error.code, error.message);
    throw new Error(errorMessage);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("AuthService SignOut Error: ", error.code, error.message);
    throw new Error(error.message || "Failed to sign out.");
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
