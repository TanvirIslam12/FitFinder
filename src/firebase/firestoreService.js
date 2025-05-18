import {
  collection,
  doc,
  setDoc,
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

// --- User Profile Functions ---

export const addUserProfile = async (userId, userData) => {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await setDoc(userDocRef, {
      ...userData,
      uid: userId, 
      createdAt: userData.createdAt || serverTimestamp(),
    });
    console.log("User profile created for UID: ", userId);
  } catch (error) {
    console.error("Error adding user profile: ", error);
    throw new Error("Could not create user profile.");
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such user profile!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw new Error("Could not fetch user profile.");
  }
};

export const updateUserProfile = async (userId, updatedData) => {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await updateDoc(userDocRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
    console.log("User profile updated for UID: ", userId);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw new Error("Could not update user profile.");
  }
};

export const getGyms = async () => {
  try {
    const gymsCollectionRef = collection(firestore, 'gyms');
    const querySnapshot = await getDocs(gymsCollectionRef); 
    const gyms = [];
    querySnapshot.forEach((doc) => {
      gyms.push({ id: doc.id, ...doc.data() });
    });
    return gyms;
  } catch (error) {
    console.error("Error fetching gyms: ", error);
    throw new Error("Could not fetch gyms.");
  }
};

export const getGymById = async (gymId) => {
  try {
    const gymDocRef = doc(firestore, 'gyms', gymId);
    const docSnap = await getDoc(gymDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such gym found with ID: ", gymId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching gym by ID: ", error);
    throw new Error("Could not fetch gym details.");
  }
};

// --- Review Functions ---

export const addReview = async (gymId, reviewData) => {
  try {
    
    const reviewsSubCollectionRef = collection(firestore, 'gyms', gymId, 'reviews');
    const newReviewRef = doc(reviewsSubCollectionRef); // Creates a ref with a new ID

    await setDoc(newReviewRef, {
      ...reviewData,
      gymId: gymId, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Review added with ID: ", newReviewRef.id, "for gym: ", gymId);
    return newReviewRef.id;
  } catch (error) {
    console.error("Error adding review: ", error);
    throw new Error("Could not submit your review.");
  }
};

export const getReviewsForGym = async (gymId) => {
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
    console.error("Error fetching reviews for gym: ", error);
    throw new Error("Could not fetch reviews.");
  }
};


export const updateReview = async (gymId, reviewId, updatedData) => {
  try {
    const reviewDocRef = doc(firestore, 'gyms', gymId, 'reviews', reviewId);
    await updateDoc(reviewDocRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
    console.log("Review updated: ", reviewId);
  } catch (error) {
    console.error("Error updating review: ", error);
    throw new Error("Could not update your review.");
  }
};


export const deleteReview = async (gymId, reviewId) => {
  try {
    const reviewDocRef = doc(firestore, 'gyms', gymId, 'reviews', reviewId);
    await deleteDoc(reviewDocRef);
    console.log("Review deleted: ", reviewId);
  } catch (error) {
    console.error("Error deleting review: ", error);
    throw new Error("Could not delete your review.");
  }
};

// --- Booking Functions ---

export const addBooking = async (bookingData) => {
  try {
    const bookingsCollectionRef = collection(firestore, 'bookings');
    const newBookingRef = doc(bookingsCollectionRef); 

    await setDoc(newBookingRef, {
      ...bookingData,
      bookingDateTime: bookingData.bookingDateTime instanceof Date ? Timestamp.fromDate(bookingData.bookingDateTime) : bookingData.bookingDateTime,
      createdAt: serverTimestamp(),
      status: bookingData.status || 'confirmed', 
    });
    console.log("Booking added with ID: ", newBookingRef.id);
    return newBookingRef.id;
  } catch (error) {
    console.error("Error adding booking: ", error);
    throw new Error("Could not create your booking.");
  }
};

export const getUserBookings = async (userId) => {
  try {
    const bookingsCollectionRef = collection(firestore, 'bookings');
    const q = query(
      bookingsCollectionRef,
      where('userId', '==', userId),
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings: ", error);
    throw new Error("Could not fetch your bookings.");
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const bookingDocRef = doc(firestore, 'bookings', bookingId);
    await updateDoc(bookingDocRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    console.log("Booking cancelled: ", bookingId);
  } catch (error) {
    console.error("Error cancelling booking: ", error);
    throw new Error("Could not cancel your booking.");
  }
};
