import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { addBooking, getUserProfile } from '../../firebase/firestoreService';
import { auth } from '../../firebase/config';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton'; // Assuming you will create this
import DateTimePicker from '@react-native-community/datetimepicker'; // For date and time selection

export default function BookingScreen({ route, navigation }) {
  const { gymId, gymName } = route.params;
  const [date, setDate] = useState(new Date()); // Default to today
  const [time, setTime] = useState(new Date()); // Default to current time, user will adjust
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    navigation.setOptions({ title: `Book at ${gymName}` });
    // Set initial time to a reasonable default, e.g., next hour
    const initialTime = new Date();
    initialTime.setHours(initialTime.getHours() + 1, 0, 0, 0); // Next hour, 0 minutes
    setTime(initialTime);
  }, [navigation, gymName]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // On iOS, the picker is a modal
    if (selectedDate) {
      // Ensure selected date is not in the past
      const currentDate = new Date();
      currentDate.setHours(0,0,0,0); // Compare dates only, not time
      if (selectedDate < currentDate) {
        Alert.alert("Invalid Date", "Please select a future date.");
        return;
      }
      setDate(selectedDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
        // Combine selected date with selected time
        const newBookingDateTime = new Date(date); // Start with the selected date
        newBookingDateTime.setHours(selectedTime.getHours());
        newBookingDateTime.setMinutes(selectedTime.getMinutes());

        // Check if the selected date and time is in the past
        if (newBookingDateTime < new Date()) {
            Alert.alert("Invalid Time", "Please select a future time.");
            return;
        }
        setTime(selectedTime); // Store the time part, date part is from `date` state
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      Alert.alert("Authentication Error", "You must be logged in to make a booking.");
      navigation.navigate('Login');
      return;
    }

    // Combine date and time into a single Date object for Firestore
    const bookingDateTime = new Date(date); // Start with the selected date
    bookingDateTime.setHours(time.getHours()); // Set hours from time state
    bookingDateTime.setMinutes(time.getMinutes()); // Set minutes from time state
    bookingDateTime.setSeconds(0); // Optional: zero out seconds
    bookingDateTime.setMilliseconds(0); // Optional: zero out milliseconds


    if (bookingDateTime < new Date()) {
      Alert.alert("Invalid Selection", "Cannot book appointments in the past. Please check the date and time.");
      return;
    }

    setLoading(true);
    try {
      const userProfile = await getUserProfile(currentUser.uid);
      const bookingData = {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || 'Anonymous User',
        gymId: gymId,
        gymName: gymName,
        bookingDateTime: bookingDateTime, // This is a JavaScript Date object
        status: 'confirmed', // Or 'pending', 'requested'
        // `createdAt` will be set by serverTimestamp in firestoreService
      };

      await addBooking(bookingData);
      Alert.alert("Booking Confirmed!", `Your appointment at ${gymName} on ${bookingDateTime.toLocaleDateString()} at ${bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} is confirmed.`);
      navigation.navigate('MyBookings'); // Navigate to a list of user's bookings
    } catch (error) {
      Alert.alert("Booking Failed", error.message || "Could not complete your booking. Please try again.");
      console.error("Booking error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date and time for display
  const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Book Your Slot</Text>
      <Text style={styles.gymNameText}>Gym: {gymName}</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>{formattedDate}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={date}
            mode="date"
            is24Hour={false} // Does not apply to 'date' mode but good to be aware of
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' for iOS, 'default' (calendar/clock) for Android
            onChange={onChangeDate}
            minimumDate={new Date()} // Prevent selecting past dates
          />
        )}
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Time:</Text>
         <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>{formattedTime}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={time} // Use a separate state for time picker's initial value if needed
            mode="time"
            is24Hour={false} // Use 12-hour format with AM/PM
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
            // minuteInterval={15} // Optional: specify minute intervals
          />
        )}
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Your selected slot:</Text>
        <Text style={styles.summaryDateTime}>{formattedDate} at {formattedTime}</Text>
      </View>


      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <CustomButton
          title="Confirm Booking"
          onPress={handleBooking}
          style={styles.submitButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    color: theme.colors.textHeader,
    marginBottom: 5,
    textAlign: 'center',
  },
  gymNameText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: 25,
  },
  pickerContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    marginBottom: 10,
    fontWeight: '600',
  },
  pickerButton: {
    backgroundColor: theme.colors.inputBackground,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center', // Center text
  },
  pickerButtonText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: theme.colors.lightGray, // A slightly different background for summary
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
    marginBottom: 5,
  },
  summaryDateTime: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary, // Highlight the selected date/time
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  submitButton: {
    marginTop: 30, // More space before submit button
  },
});
