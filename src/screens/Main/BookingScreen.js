// File: src/screens/Main/BookingScreen.js
// Role: Allows users to book a new appointment or edit an existing one.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { addBooking, getUserProfile, updateBookingDateTime } from '../../firebase/firestoreService'; // Added updateBookingDateTime
import { auth } from '../../firebase/config';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BookingScreen({ route, navigation }) {
  // Check for existingBooking passed from MyBookingsScreen
  const { gymId, gymName, existingBooking } = route.params;
  const isEditMode = !!existingBooking; // True if existingBooking is provided

  // Initialize date and time
  // If editing, use existing booking's date/time, otherwise default to next hour
  const initialDateFromBooking = existingBooking?.bookingDateTime?.toDate ? existingBooking.bookingDateTime.toDate() : new Date();
  let initialTimeToUse;
  if (existingBooking?.bookingDateTime?.toDate) {
    initialTimeToUse = existingBooking.bookingDateTime.toDate();
  } else {
    initialTimeToUse = new Date();
    initialTimeToUse.setHours(initialTimeToUse.getHours() + 1, 0, 0, 0); // Default to next hour for new bookings
  }

  const [date, setDate] = useState(initialDateFromBooking);
  const [time, setTime] = useState(initialTimeToUse); // This will hold the time part
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const screenTitle = isEditMode ? `Reschedule: ${gymName}` : `Book at: ${gymName}`;
    navigation.setOptions({ title: screenTitle });

    // If in edit mode, set date and time from existingBooking
    if (isEditMode && existingBooking.bookingDateTime) {
        const bookingDT = existingBooking.bookingDateTime.toDate(); // Convert Firestore Timestamp to JS Date
        setDate(bookingDT);
        setTime(bookingDT); // Set time picker to the booking's time
    }
  }, [navigation, gymName, isEditMode, existingBooking]);

  const onChangeDate = (event, selectedDateValue) => {
    const newDate = selectedDateValue || date;
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDateValue) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        Alert.alert("Invalid Date", "Cannot select a past date.");
        return;
      }
      setDate(newDate);
    }
  };

  const onChangeTime = (event, selectedTimeValue) => {
    const newTime = selectedTimeValue || time;
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTimeValue) {
        const proposedBookingDateTime = new Date(date); // Use currently selected date
        proposedBookingDateTime.setHours(newTime.getHours());
        proposedBookingDateTime.setMinutes(newTime.getMinutes());
        proposedBookingDateTime.setSeconds(0);
        proposedBookingDateTime.setMilliseconds(0);

        const now = new Date();
        // Allow selecting current time if it's for today and not strictly in the past
        // (e.g., if now is 10:00, allow booking for 10:00, but not 09:59)
        if (proposedBookingDateTime < new Date(now.getTime() - 60000)) { // Allow a minute of grace for selection
             Alert.alert("Invalid Time", "Cannot select a past time. Please choose a future time slot.");
             return;
        }
        setTime(newTime);
    }
  };

  const handleBookingAction = async () => {
    if (!currentUser) {
      Alert.alert("Authentication Error", "You must be logged in.", [
        { text: "OK", onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    const bookingDateTime = new Date(date);
    bookingDateTime.setHours(time.getHours());
    bookingDateTime.setMinutes(time.getMinutes());
    bookingDateTime.setSeconds(0);
    bookingDateTime.setMilliseconds(0);

    if (bookingDateTime < new Date()) {
      Alert.alert("Invalid Selection", "The selected date and time is in the past.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && existingBooking?.id) {
        // --- UPDATE EXISTING BOOKING ---
        await updateBookingDateTime(existingBooking.id, bookingDateTime);
        Alert.alert(
          "Booking Updated!",
          `Your appointment at ${gymName} has been rescheduled to ${bookingDateTime.toLocaleDateString()} at ${bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          [{ text: "OK", onPress: () => navigation.navigate('MyBookings') }]
        );
      } else {
        // --- ADD NEW BOOKING ---
        const userProfile = await getUserProfile(currentUser.uid);
        const bookingData = {
          userId: currentUser.uid,
          userName: userProfile?.name || currentUser.displayName || 'Anonymous User',
          gymId: gymId,
          gymName: gymName,
          bookingDateTime: bookingDateTime,
          status: 'confirmed',
        };
        await addBooking(bookingData);
        Alert.alert(
          "Booking Confirmed!",
          `Your appointment at ${gymName} on ${bookingDateTime.toLocaleDateString()} at ${bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} is confirmed.`,
          [{ text: "OK", onPress: () => navigation.navigate('MyBookings') }]
        );
      }
    } catch (error) {
      Alert.alert(isEditMode ? "Update Failed" : "Booking Failed", error.message || "Could not complete the action. Please try again.");
      console.error(isEditMode ? "Booking Update error: " : "Booking error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditMode ? 'Reschedule Your Slot' : 'Book Your Slot'}</Text>
      <Text style={styles.gymNameText}>Gym: {gymName}</Text>

      <View style={styles.pickerSection}>
        <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>{formattedDate}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.label}>Select Time:</Text>
         <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>{formattedTime}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={time}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Your selected slot:</Text>
        <Text style={styles.summaryDateTime}>{formattedDate}</Text>
        <Text style={styles.summaryDateTime}>at {formattedTime}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <CustomButton
          title={isEditMode ? "Update Booking" : "Confirm Booking"}
          onPress={handleBookingAction}
          style={styles.submitButton}
          buttonColor={isEditMode ? theme.colors.accent : theme.colors.primary} // Different color for update
        />
      )}
    </ScrollView>
  );
}

// Styles are mostly the same as before, ensure theme is imported
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContentContainer: { padding: theme.spacing.large, paddingBottom: theme.spacing.xlarge },
  title: { fontSize: theme.fonts.size.xlarge, fontWeight: theme.fonts.weights.bold, color: theme.colors.textHeader, marginBottom: theme.spacing.xsmall, textAlign: 'center' },
  gymNameText: { fontSize: theme.fonts.size.medium, color: theme.colors.secondaryText, textAlign: 'center', marginBottom: theme.spacing.large },
  pickerSection: { marginBottom: theme.spacing.large },
  label: { fontSize: theme.fonts.size.medium, color: theme.colors.text, marginBottom: theme.spacing.small, fontWeight: theme.fonts.weights.semibold },
  pickerButton: { backgroundColor: theme.colors.inputBackground, paddingVertical: theme.spacing.medium, paddingHorizontal: theme.spacing.medium, borderRadius: theme.borderRadius.medium, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  pickerButtonText: { fontSize: theme.fonts.size.medium, color: theme.colors.primary, fontWeight: theme.fonts.weights.medium },
  summaryContainer: { marginTop: theme.spacing.medium, padding: theme.spacing.medium, backgroundColor: theme.colors.lightGray, borderRadius: theme.borderRadius.medium, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderLight },
  summaryTitle: { fontSize: theme.fonts.size.small, color: theme.colors.secondaryText, marginBottom: theme.spacing.xsmall, fontWeight: theme.fonts.weights.semibold },
  summaryDateTime: { fontSize: theme.fonts.size.medium, color: theme.colors.textHeader, fontWeight: theme.fonts.weights.bold },
  loader: { marginVertical: theme.spacing.large },
  submitButton: { marginTop: theme.spacing.large },
});
