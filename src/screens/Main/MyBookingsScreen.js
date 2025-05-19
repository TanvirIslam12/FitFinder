// File: src/screens/Main/MyBookingsScreen.js
// Role: Displays the current user's gym bookings with Edit option, passing serializable date.

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { getUserBookings, cancelBooking } from '../../firebase/firestoreService';
import { auth } from '../../firebase/config';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import { useFocusEffect } from '@react-navigation/native';

export default function MyBookingsScreen({ navigation }) {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser;

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (!currentUser) {
      setError("You need to be logged in to see your bookings.");
      setLoading(false);
      if (isRefresh) setRefreshing(false);
      return;
    }

    if (!isRefresh) setLoading(true); else setRefreshing(true);
    setError(null);

    try {
      const allBookings = await getUserBookings(currentUser.uid);
      const now = new Date();
      const upcoming = [];
      const past = [];
      const cancelled = [];

      allBookings.forEach(booking => {
        // Ensure bookingDateTime is a JS Date object after fetching
        const bookingDate = booking.bookingDateTime?.toDate ? booking.bookingDateTime.toDate() : new Date(booking.bookingDateTime);
        const bookingWithDateObject = { ...booking, bookingDateTime: bookingDate };

        if (booking.status === 'cancelled') {
          cancelled.push(bookingWithDateObject);
        } else if (bookingDate >= now) {
          upcoming.push(bookingWithDateObject);
        } else {
          past.push(bookingWithDateObject);
        }
      });

      upcoming.sort((a, b) => a.bookingDateTime - b.bookingDateTime);
      past.sort((a, b) => b.bookingDateTime - a.bookingDateTime);
      cancelled.sort((a, b) => b.bookingDateTime - a.bookingDateTime);

      setUpcomingBookings(upcoming);
      setPastBookings(past);
      setCancelledBookings(cancelled);

    } catch (err) {
      console.error("[MyBookingsScreen] Error fetching bookings: ", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      if (!isRefresh) setLoading(false); else setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    } else {
      setLoading(false);
      setError("Please log in to view your bookings.");
    }
  }, [currentUser, fetchBookings]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        console.log("[MyBookingsScreen] Screen focused, fetching bookings.");
        fetchBookings();
      }
    }, [currentUser, fetchBookings])
  );

  const handleCancelBooking = async (bookingId, gymName, bookingDateTime) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking at ${gymName} on ${bookingDateTime.toLocaleDateString()} at ${bookingDateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}?`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await cancelBooking(bookingId);
              Alert.alert("Booking Cancelled", "Your booking has been successfully cancelled.");
              fetchBookings(true);
            } catch (e) {
              Alert.alert("Cancellation Failed", e.message || "Could not cancel the booking.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditBooking = (booking) => {
    // Convert JS Date to ISO string for navigation to make it serializable
    const serializableBooking = {
        ...booking,
        bookingDateTimeISO: booking.bookingDateTime.toISOString(), // Pass ISO string
    };
    // Remove the original Date object to avoid serialization warning if it's still there
    delete serializableBooking.bookingDateTime;


    navigation.navigate('Booking', {
      gymId: serializableBooking.gymId,
      gymName: serializableBooking.gymName,
      existingBooking: serializableBooking, // Pass the modified booking object
    });
  };

  const onRefresh = () => {
    if (currentUser) {
      fetchBookings(true);
    }
  };

  const renderBookingItem = ({ item }) => {
    const isValidDate = item.bookingDateTime instanceof Date && !isNaN(item.bookingDateTime);
    const dateString = isValidDate ? item.bookingDateTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Invalid Date';
    const timeString = isValidDate ? item.bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Invalid Time';
    const isUpcomingAndNotCancelled = item.status !== 'cancelled' && item.bookingDateTime >= new Date();

    return (
      <View style={styles.bookingItem}>
        <Text style={styles.gymName}>{item.gymName}</Text>
        <Text style={styles.bookingDate}>Date: {dateString}</Text>
        <Text style={styles.bookingTime}>Time: {timeString}</Text>
        <Text style={[
            styles.bookingStatus,
            item.status === 'cancelled' && styles.statusCancelled,
            item.status === 'confirmed' && styles.statusConfirmed
        ]}>
            Status: {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
        </Text>
        {isUpcomingAndNotCancelled && (
          <View style={styles.actionButtonsContainer}>
            <CustomButton
              title="Reschedule"
              onPress={() => handleEditBooking(item)}
              style={[styles.actionButton, styles.editButton]}
              textStyle={styles.actionButtonText}
              small
            />
            <CustomButton
              title="Cancel"
              onPress={() => handleCancelBooking(item.id, item.gymName, item.bookingDateTime)}
              style={[styles.actionButton, styles.cancelButton]}
              textStyle={styles.actionButtonText}
              small
            />
          </View>
        )}
      </View>
    );
  };

  // ... (rest of the component: loading, error, FlatList rendering logic remains the same) ...
  if (loading && !refreshing) { /* ... */ }
  if (error && !currentUser) { /* ... */ }
  if (error) { /* ... */ }
  const combinedBookings = [];
  if (upcomingBookings.length > 0) { combinedBookings.push({ type: 'header', title: 'Upcoming Bookings', id: 'header-upcoming' }); upcomingBookings.forEach(booking => combinedBookings.push({ ...booking, type: 'item' }));}
  if (pastBookings.length > 0) { combinedBookings.push({ type: 'header', title: 'Past Bookings', id: 'header-past' }); pastBookings.forEach(booking => combinedBookings.push({ ...booking, type: 'item' }));}
  if (cancelledBookings.length > 0) { combinedBookings.push({ type: 'header', title: 'Cancelled Bookings', id: 'header-cancelled' }); cancelledBookings.forEach(booking => combinedBookings.push({ ...booking, type: 'item' }));}
  if (!loading && combinedBookings.length === 0 && !error) { /* ... */ }
  return (<FlatList data={combinedBookings} keyExtractor={(item) => item.id} renderItem={({ item }) => { if (item.type === 'header') { return <Text style={styles.sectionHeader}>{item.title}</Text>; } return renderBookingItem({ item }); }} contentContainerStyle={styles.listContainer} refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} /> } ListEmptyComponent={ !loading && !error && ( <View style={styles.centeredMessageContainer}><Text style={styles.noBookingsText}>No bookings found.</Text></View> ) } />);
}

const styles = StyleSheet.create({
  centeredMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.colors.background },
  loadingText: { marginTop: 10, fontSize: theme.fonts.size.small, color: theme.colors.secondaryText },
  errorText: { color: theme.colors.danger, fontSize: theme.fonts.size.medium, textAlign: 'center', marginBottom: 15 },
  noBookingsText: { fontSize: theme.fonts.size.medium, color: theme.colors.secondaryText, textAlign: 'center' },
  findGymButton: { marginTop: 20, paddingHorizontal: 30 },
  listContainer: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: theme.colors.background, flexGrow: 1 },
  sectionHeader: { fontSize: theme.fonts.size.large, fontWeight: theme.fonts.weights.bold, color: theme.colors.textHeader, marginTop: 20, marginBottom: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  bookingItem: { backgroundColor: theme.colors.white, padding: 15, borderRadius: theme.borderRadius.medium, marginBottom: 12, ...theme.shadows.small },
  gymName: { fontSize: theme.fonts.size.medium, fontWeight: theme.fonts.weights.bold, color: theme.colors.primary, marginBottom: 5 },
  bookingDate: { fontSize: theme.fonts.size.small, color: theme.colors.text, marginBottom: 3 },
  bookingTime: { fontSize: theme.fonts.size.small, color: theme.colors.text, marginBottom: 5 },
  bookingStatus: { fontSize: theme.fonts.size.xsmall, fontWeight: theme.fonts.weights.medium, fontStyle: 'italic', marginBottom: 10 },
  statusCancelled: { color: theme.colors.danger },
  statusConfirmed: { color: theme.colors.success },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, },
  actionButton: { paddingVertical: 8, paddingHorizontal: 12, flex: 1, marginHorizontal: 5, },
  actionButtonText: { color: theme.colors.white, fontSize: theme.fonts.size.xsmall, textAlign: 'center', },
  editButton: { backgroundColor: theme.colors.accent, },
  cancelButton: { backgroundColor: theme.colors.danger, },
});
