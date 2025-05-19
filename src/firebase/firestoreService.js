// File: src/firebase/firestoreService.js
// Role: Contains functions for interacting with the Firestore database.

import {
  collection,
  doc,
  setDoc, // Import setDoc
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './config';
import { Alert } from 'react-native';

// --- User Profile Functions ---
export const addUserProfile = async (userId, userData) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot add user profile.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const userDocRef = doc(firestore, 'users', userId);
    // Use setDoc here to ensure creation, even if called multiple times (though ideally called once)
    await setDoc(userDocRef, {
      ...userData,
      uid: userId,
      createdAt: userData.createdAt || serverTimestamp(),
    });
    console.log("[FirestoreService] User profile created/ensured for UID: ", userId);
  } catch (error) {
    console.error("[FirestoreService] Error adding user profile: ", error);
    throw new Error("Could not create user profile.");
  }
};

export const getUserProfile = async (userId) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot get user profile.");
    return null;
  }
  try {
    const userDocRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("[FirestoreService] No such user profile for UID:", userId);
      return null;
    }
  } catch (error) {
    console.error("[FirestoreService] Error fetching user profile: ", error);
    throw new Error("Could not fetch user profile.");
  }
};

/**
 * Updates an existing user's profile in the 'users' collection.
 * If the profile document doesn't exist, it will be created.
 * @param {string} userId - The UID of the user.
 * @param {object} updatedData - Object containing data to update (e.g., { name }).
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updatedData) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot update user profile.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const userDocRef = doc(firestore, 'users', userId);
    // Use setDoc with merge:true to create the document if it doesn't exist,
    // or update it if it does.
    await setDoc(userDocRef, {
      ...updatedData,
      uid: userId, // Ensure UID is present, especially if creating
      updatedAt: serverTimestamp(),
    }, { merge: true }); // This is the key change
    console.log("[FirestoreService] User profile updated/created for UID: ", userId);
  } catch (error) {
    console.error("[FirestoreService] Error updating user profile: ", error);
    throw new Error("Could not update user profile.");
  }
};

// --- Gym Functions ---
export const getGyms = async () => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot get gyms.");
    throw new Error("Firestore service is not available.");
  }
  console.log("[FirestoreService] Attempting to fetch gyms from 'gyms' collection...");
  try {
    const gymsCollectionRef = collection(firestore, 'gyms');
    const querySnapshot = await getDocs(gymsCollectionRef);
    console.log(`[FirestoreService] getGyms querySnapshot size: ${querySnapshot.size}`);
    if (querySnapshot.empty) {
        console.log("[FirestoreService] No documents found in 'gyms' collection.");
    }
    const gyms = [];
    querySnapshot.forEach((doc) => {
      console.log(`[FirestoreService] Gym doc found: ID = ${doc.id}, Data =`, JSON.stringify(doc.data()));
      gyms.push({ id: doc.id, ...doc.data() });
    });
    return gyms;
  } catch (error) {
    console.error("[FirestoreService] Error fetching gyms: ", error.code, error.message, error);
    if (error.code === 'permission-denied') {
        console.error("[FirestoreService] PERMISSION DENIED while fetching gyms. Check Firestore rules.");
        Alert.alert("Permissions Error", "Could not fetch gym data due to database permissions. Please contact support or try again later.");
    }
    throw new Error(`Could not fetch gyms. ${error.message}`);
  }
};

export const getGymById = async (gymId) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot get gym by ID.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const gymDocRef = doc(firestore, 'gyms', gymId);
    const docSnap = await getDoc(gymDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("[FirestoreService] No such gym found with ID: ", gymId);
      return null;
    }
  } catch (error) {
    console.error("[FirestoreService] Error fetching gym by ID: ", error);
    throw new Error("Could not fetch gym details.");
  }
};

// --- Review Functions ---
export const addReview = async (gymId, reviewData) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot add review.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const reviewsSubCollectionRef = collection(firestore, 'gyms', gymId, 'reviews');
    const newReviewRef = doc(reviewsSubCollectionRef);
    await setDoc(newReviewRef, {
      ...reviewData,
      gymId: gymId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("[FirestoreService] Review added with ID: ", newReviewRef.id, "for gym: ", gymId);
    return newReviewRef.id;
  } catch (error) {
    console.error("[FirestoreService] Error adding review: ", error);
    throw new Error("Could not submit your review.");
  }
};

export const getReviewsForGym = async (gymId) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot get reviews.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const reviewsSubCollectionRef = collection(firestore, 'gyms', gymId, 'reviews');
    const q = query(reviewsSubCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const reviews = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews;
  } catch (error) {
    console.error("[FirestoreService] Error fetching reviews for gym: ", error);
    throw new Error("Could not fetch reviews.");
  }
};

export const updateReview = async (gymId, reviewId, updatedData) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot update review.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const reviewDocRef = doc(firestore, 'gyms', gymId, 'reviews', reviewId);
    await updateDoc(reviewDocRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
    console.log("[FirestoreService] Review updated: ", reviewId);
  } catch (error) {
    console.error("[FirestoreService] Error updating review: ", error);
    throw new Error("Could not update your review.");
  }
};

export const deleteReview = async (gymId, reviewId) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot delete review.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const reviewDocRef = doc(firestore, 'gyms', gymId, 'reviews', reviewId);
    await deleteDoc(reviewDocRef);
    console.log("[FirestoreService] Review deleted: ", reviewId);
  } catch (error) {
    console.error("[FirestoreService] Error deleting review: ", error);
    throw new Error("Could not delete your review.");
  }
};

// --- Booking Functions ---
export const addBooking = async (bookingData) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot add booking.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const bookingsCollectionRef = collection(firestore, 'bookings');
    const newBookingRef = doc(bookingsCollectionRef);
    await setDoc(newBookingRef, {
      ...bookingData,
      bookingDateTime: bookingData.bookingDateTime instanceof Date ? Timestamp.fromDate(bookingData.bookingDateTime) : bookingData.bookingDateTime,
      createdAt: serverTimestamp(),
      status: bookingData.status || 'confirmed',
    });
    console.log("[FirestoreService] Booking added with ID: ", newBookingRef.id);
    return newBookingRef.id;
  } catch (error) {
    console.error("[FirestoreService] Error adding booking: ", error);
    throw new Error("Could not create your booking.");
  }
};

export const getUserBookings = async (userId) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot get user bookings.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const bookingsCollectionRef = collection(firestore, 'bookings');
    const q = query(
      bookingsCollectionRef,
      where('userId', '==', userId),
      orderBy('bookingDateTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  } catch (error) {
    console.error("[FirestoreService] Error fetching user bookings: ", error);
    throw new Error("Could not fetch your bookings.");
  }
};

export const cancelBooking = async (bookingId) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot cancel booking.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const bookingDocRef = doc(firestore, 'bookings', bookingId);
    await updateDoc(bookingDocRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    console.log("[FirestoreService] Booking cancelled: ", bookingId);
  } catch (error) {
    console.error("[FirestoreService] Error cancelling booking: ", error);
    throw new Error("Could not cancel your booking.");
  }
};

export const updateBookingDateTime = async (bookingId, newBookingDateTime) => {
  if (!firestore) {
    console.error("[FirestoreService] Firestore is not initialized. Cannot update booking date/time.");
    throw new Error("Firestore service is not available.");
  }
  try {
    const bookingDocRef = doc(firestore, 'bookings', bookingId);
    await updateDoc(bookingDocRef, {
      bookingDateTime: Timestamp.fromDate(newBookingDateTime),
      status: 'confirmed',
      updatedAt: serverTimestamp(),
    });
    console.log("[FirestoreService] Booking date/time updated for booking ID: ", bookingId);
  } catch (error) {
    console.error("[FirestoreService] Error updating booking date/time: ", error);
    throw new Error("Could not update your booking time.");
  }
};
