// File: src/screens/Main/GymDetails.js
// Role: Displays details for a specific gym, including reviews, and options to book or review.

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { getGymById, getReviewsForGym, deleteReview } from '../../firebase/firestoreService';
import { auth } from '../../firebase/config';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import ReviewItem from '../../components/ReviewItem'; // Assuming you have this component
import { useFocusEffect } from '@react-navigation/native';

export default function GymDetails({ route, navigation }) { // Changed from GymDetailsScreen to GymDetails
  const { gymId } = route.params;
  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser;

  const fetchGymAndReviewData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gymData = await getGymById(gymId);
      if (gymData) {
        setGym(gymData);
        navigation.setOptions({ title: gymData.name || 'Gym Details' });
        const gymReviews = await getReviewsForGym(gymId);
        setReviews(gymReviews);
      } else {
        setError('Gym not found. It might have been removed.');
        setGym(null);
        setReviews([]);
      }
    } catch (err) {
      console.error("[GymDetails] Error fetching gym details or reviews: ", err);
      setError('Failed to load gym details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [gymId, navigation]);

  useEffect(() => {
    fetchGymAndReviewData();
  }, [fetchGymAndReviewData]);

  useFocusEffect(
    useCallback(() => {
      fetchGymAndReviewData();
    }, [fetchGymAndReviewData])
  );

  const handleEditReview = (reviewToEdit) => {
    if (!gym) return;
    navigation.navigate('Review', { // Ensure 'Review' screen is in AppNavigator
      gymId: gym.id,
      gymName: gym.name,
      existingReview: reviewToEdit,
    });
  };

  const handleDeleteReview = async (reviewIdToDelete) => {
    if (!gym) return;
    Alert.alert(
      "Delete Review",
      "Are you sure you want to permanently delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteReview(gym.id, reviewIdToDelete);
              setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewIdToDelete));
              Alert.alert("Success", "Review deleted successfully.");
            } catch (e) {
              Alert.alert("Deletion Failed", e.message || "Could not delete the review.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !gym) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading gym details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton title="Go Back" onPress={() => navigation.goBack()} style={{marginTop: 15}} />
      </View>
    );
  }

  if (!gym) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Text style={styles.errorText}>Gym data could not be loaded or gym does not exist.</Text>
        <CustomButton title="Go Back" onPress={() => navigation.goBack()} style={{marginTop: 15}} />
      </View>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      {gym.imageUrl ? (
        <Image source={{ uri: gym.imageUrl }} style={styles.gymImage} resizeMode="cover" />
      ) : (
        <View style={[styles.gymImage, styles.placeholderImage]}>
            <Text style={styles.placeholderImageText}>No Image Available</Text>
        </View>
      )}
      <View style={styles.detailsContainer}>
        <Text style={styles.gymName}>{gym.name}</Text>
        {averageRating !== null && (
            <View style={styles.ratingSummary}>
                <Text style={styles.starSummary}>
                    {[...Array(5)].map((_, i) => (i < Math.round(averageRating) ? '★' : '☆')).join('')}
                </Text>
                <Text style={styles.ratingText}>
                    {averageRating.toFixed(1)}/5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </Text>
            </View>
        )}
        <Text style={styles.gymInfoLabel}>Address:</Text>
        <Text style={styles.gymInfoValue}>{gym.address || 'Not specified'}</Text>
        <Text style={styles.gymInfoLabel}>Description:</Text>
        <Text style={styles.gymInfoValue}>{gym.description || 'No description available.'}</Text>
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Book Appointment"
            onPress={() => navigation.navigate('Booking', { gymId: gym.id, gymName: gym.name })} // Ensure 'Booking' screen is in AppNavigator
            style={styles.actionButton}
          />
          <CustomButton
            title="Write/Edit Your Review"
            onPress={() => {
                const existingUserReview = reviews.find(r => r.userId === currentUser?.uid);
                navigation.navigate('Review', { // Ensure 'Review' screen is in AppNavigator
                    gymId: gym.id,
                    gymName: gym.name,
                    existingReview: existingUserReview || null
                });
            }}
            style={[styles.actionButton, styles.reviewButton]}
            outline
          />
        </View>
      </View>
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>User Reviews</Text>
        {loading && reviews.length === 0 && <ActivityIndicator color={theme.colors.primary} />}
        {!loading && reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUserId={currentUser?.uid}
              onEdit={() => handleEditReview(review)}
              onDelete={() => handleDeleteReview(review.id)}
            />
          ))
        ) : (
          !loading && <Text style={styles.noReviewsText}>No reviews yet. Be the first to share!</Text>
        )}
      </View>
    </ScrollView>
  );
}

// Styles are the same as GymDetailsScreen.js provided previously
// (Ensure theme, CustomButton, ReviewItem are correctly imported and styled)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContentContainer: { paddingBottom: theme.spacing.large },
  centeredMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.large, backgroundColor: theme.colors.background },
  loadingText: { marginTop: theme.spacing.small, fontSize: theme.fonts.size.small, color: theme.colors.secondaryText },
  errorText: { color: theme.colors.danger, fontSize: theme.fonts.size.medium, textAlign: 'center', marginBottom: theme.spacing.small },
  gymImage: { width: '100%', height: 250, backgroundColor: theme.colors.lightGray },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  placeholderImageText: { color: theme.colors.secondaryText, fontSize: theme.fonts.size.medium },
  detailsContainer: { padding: theme.spacing.medium },
  gymName: { fontSize: theme.fonts.size.xlarge, fontWeight: theme.fonts.weights.bold, color: theme.colors.textHeader, marginBottom: theme.spacing.xsmall },
  ratingSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.medium },
  starSummary: { fontSize: theme.fonts.size.medium, color: theme.colors.accent, marginRight: theme.spacing.xsmall },
  ratingText: { fontSize: theme.fonts.size.small, color: theme.colors.secondaryText },
  gymInfoLabel: { fontSize: theme.fonts.size.small, color: theme.colors.secondaryText, fontWeight: theme.fonts.weights.semibold, marginTop: theme.spacing.small, marginBottom: theme.spacing.xxsmall },
  gymInfoValue: { fontSize: theme.fonts.size.medium, color: theme.colors.text, lineHeight: theme.fonts.size.medium * 1.4 },
  buttonGroup: { marginTop: theme.spacing.large, marginBottom: theme.spacing.medium },
  actionButton: { marginBottom: theme.spacing.small },
  reviewButton: {},
  reviewsSection: { paddingHorizontal: theme.spacing.medium, marginTop: theme.spacing.small },
  reviewsTitle: { fontSize: theme.fonts.size.large, fontWeight: theme.fonts.weights.bold, color: theme.colors.textHeader, marginBottom: theme.spacing.medium, paddingBottom: theme.spacing.xsmall, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  noReviewsText: { textAlign: 'center', paddingVertical: theme.spacing.large, fontSize: theme.fonts.size.small, color: theme.colors.secondaryText },
});
