// File: src/screens/Main/ReviewScreen.js
// Role: Allows users to add or edit a review for a gym.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { addReview, updateReview, getUserProfile } from '../../firebase/firestoreService'; // Adjust path
import { auth } from '../../firebase/config'; // Adjust path
import { theme } from '../../styles/theme'; // Adjust path
import CustomButton from '../../components/CustomButton'; // Adjust path
import { isEmpty, isValidRating } from '../../utils/validation'; // Adjust path

export default function ReviewScreen({ route, navigation }) {
  const { gymId, gymName, existingReview } = route.params;
  const [rating, setRating] = useState(0); // 0 means no rating selected yet
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  // State for input errors
  const [ratingError, setRatingError] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    // Set the screen title and prefill form if editing an existing review
    const screenTitle = existingReview ? `Edit Review: ${gymName}` : `Review: ${gymName}`;
    navigation.setOptions({ title: screenTitle });

    if (existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || '');
    } else {
      // Reset for new review form if navigating back and forth or no existing review
      setRating(0);
      setComment('');
    }
  }, [navigation, gymName, existingReview]);

  const handleStarRatingPress = (newRating) => {
    setRating(newRating);
    if (ratingError) setRatingError(''); // Clear error when user interacts
  };

  const validateForm = () => {
    let isValid = true;
    setRatingError('');
    setCommentError('');

    if (!isValidRating(rating, 1, 5)) { // Assuming rating is 1-5
      setRatingError('Please select a rating between 1 and 5 stars.');
      isValid = false;
    }

    if (isEmpty(comment)) {
      setCommentError('Please share your experience in the comments.');
      isValid = false;
    } else if (comment.trim().length < 10) { // Example: minimum comment length
        setCommentError('Comment should be at least 10 characters long.');
        isValid = false;
    }
    // Add more comment validation if needed (e.g., max length)

    return isValid;
  };


  const handleSubmitReview = async () => {
    if (!currentUser) {
      Alert.alert("Authentication Error", "You must be logged in to submit a review.", [
        { text: "OK", onPress: () => navigation.navigate('Login') } // Optionally navigate to login
      ]);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userProfile = await getUserProfile(currentUser.uid);
      const reviewData = {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || 'Anonymous User',
        rating: rating,
        comment: comment.trim(),
        // `createdAt` and `updatedAt` will be handled by serverTimestamp in firestoreService
      };

      if (existingReview && existingReview.id) {
        // Update existing review
        await updateReview(gymId, existingReview.id, reviewData);
        Alert.alert("Review Updated", "Your review has been successfully updated!");
      } else {
        // Add new review
        await addReview(gymId, reviewData);
        Alert.alert("Review Submitted", "Thank you for sharing your feedback!");
      }
      navigation.goBack(); // Go back to GymDetailsScreen after submission
    } catch (error) {
      Alert.alert("Submission Failed", error.message || "Could not submit your review at this time. Please try again.");
      console.error("Review submission error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Simple star rating component for selection
  const StarRatingInput = ({ maxStars = 5, currentRating, onRate }) => {
    return (
      <View style={styles.starRatingContainer}>
        {[...Array(maxStars)].map((_, index) => {
          const starNumber = index + 1;
          return (
            <TouchableOpacity
              key={starNumber}
              onPress={() => onRate(starNumber)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.starText, starNumber <= currentRating ? styles.starFilled : styles.starEmpty]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Text style={styles.title}>{existingReview ? 'Edit Your Review' : 'Write a Review'}</Text>
                <Text style={styles.gymNameText}>For: {gymName}</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Your Rating:</Text>
                    <StarRatingInput currentRating={rating} onRate={handleStarRatingPress} />
                    {ratingError ? <Text style={styles.errorTextValidation}>{ratingError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Your Comments:</Text>
                    <TextInput
                        style={[styles.textInput, commentError ? styles.inputError : null]}
                        placeholder="Share details of your own experience at this gym..."
                        value={comment}
                        onChangeText={(text) => {
                            setComment(text);
                            if (commentError) setCommentError('');
                        }}
                        multiline={true}
                        numberOfLines={6}
                        placeholderTextColor={theme.colors.placeholder}
                        textAlignVertical="top" // For Android multiline placeholder alignment
                    />
                    {commentError ? <Text style={styles.errorTextValidation}>{commentError}</Text> : null}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                ) : (
                    <CustomButton
                    title={existingReview ? "Update Review" : "Submit Review"}
                    onPress={handleSubmitReview}
                    style={styles.submitButton}
                    />
                )}
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content if it's less than screen height
  },
  container: {
    padding: theme.spacing.large,
  },
  title: {
    fontSize: theme.fonts.size.xlarge, // Slightly smaller than auth screens
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textHeader,
    marginBottom: theme.spacing.xsmall,
    textAlign: 'center',
  },
  gymNameText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  inputGroup: {
    marginBottom: theme.spacing.medium,
  },
  label: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontWeight: theme.fonts.weights.semibold,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Or 'center' or 'space-between'
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall, // Space before error message if any
  },
  starButton: {
    padding: theme.spacing.xsmall, // Make stars easier to tap
  },
  starText: {
    fontSize: 36, // Large, easily tappable stars
  },
  starFilled: {
    color: theme.colors.accent,
  },
  starEmpty: {
    color: theme.colors.border,
  },
  textInput: {
    minHeight: 120, // Good height for multiline comments
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small, // Vertical padding for multiline
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorTextValidation: { // Specific style for validation errors under inputs
    color: theme.colors.danger,
    fontSize: theme.fonts.size.xsmall,
    marginTop: theme.spacing.xxsmall,
    // textAlign: 'left', // Default
  },
  loader: {
    marginVertical: theme.spacing.large,
  },
  submitButton: {
    marginTop: theme.spacing.medium,
  },
});
