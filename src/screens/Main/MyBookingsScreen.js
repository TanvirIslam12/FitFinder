import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { getUserBookings, cancelBooking } from '../../firebase/firestoreService';
import { auth } from '../../firebase/config';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton'; // Assuming you will create this
import { useFocusEffect } from '@react-navigation/native'; // To refresh data when screen is focused

export default function MyBookingsScreen({ navigation }) {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
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

      allBookings.forEach(booking => {
        // Ensure bookingDateTime is a Date object
        const bookingDate = booking.bookingDateTime.toDate ? booking.bookingDateTime.toDate() : new Date(booking.bookingDateTime);
        if (bookingDate >= now) {
          upcoming.push({ ...booking, bookingDateTime: bookingDate });
        } else {
          past.push({ ...booking, bookingDateTime: bookingDate });
        }
      });

      // Sort upcoming bookings by date (earliest first)
      upcoming.sort((a, b) => a.bookingDateTime - b.bookingDateTime);
      // Sort past bookings by date (latest first)
      past.sort((a, b) => b.bookingDateTime - a.bookingDateTime);

      setUpcomingBookings(upcoming);
      setPastBookings(past);
    } catch (err) {
      console.error("Error fetching bookings: ", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      if (!isRefresh) setLoading(false); else setRefreshing(false);
    }
  }, [currentUser]); // currentUser is a stable dependency here

  // Initial fetch
  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    } else {
      // Handle case where user is not logged in (e.g., direct navigation attempt or logout)
      setLoading(false);
      setError("Please log in to view your bookings.");
      // Optionally navigate to login screen
      // navigation.navigate('Login');
    }
  }, [currentUser, fetchBookings]); // fetchBookings is stable due to useCallback

  // Refetch bookings when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        fetchBookings(); // Call fetchBookings without isRefresh argument
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
            setLoading(true); // Show activity indicator for cancellation
            try {
              await cancelBooking(bookingId); // Implement this in firestoreService
              Alert.alert("Booking Cancelled", "Your booking has been successfully cancelled.");
              fetchBookings(true); // Refresh the list after cancellation
            } catch (e) {
              Alert.alert("Cancellation Failed", e.message || "Could not cancel the booking. Please try again.");
              console.error("Cancellation error: ", e);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    if (currentUser) {
      fetchBookings(true);
    }
  };

  const renderBookingItem = ({ item }) => {
    const isUpcoming = item.bookingDateTime >= new Date();
    return (
      <View style={styles.bookingItem}>
        <Text style={styles.gymName}>{item.gymName}</Text>
        <Text style={styles.bookingDate}>
          Date: {item.bookingDateTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
        <Text style={styles.bookingTime}>
          Time: {item.bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
        <Text style={styles.bookingStatus}>Status: {item.status || 'Confirmed'}</Text>
        {isUpcoming && item.status !== 'cancelled' && ( // Only show cancel for upcoming, non-cancelled bookings
          <CustomButton
            title="Cancel Booking"
            onPress={() => handleCancelBooking(item.id, item.gymName, item.bookingDateTime)}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            small // Assuming CustomButton can take a 'small' prop for styling
          />
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  if (error && !currentUser) { // Special handling if user is not logged in
     return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton title="Login" onPress={() => navigation.navigate('Login')} style={{marginTop: 15}} />
      </View>
    );
  }


  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton title="Try Again" onPress={() => fetchBookings()} />
      </View>
    );
  }

  const combinedBookings = [
    ...(upcomingBookings.length > 0 ? [{ type: 'header', title: 'Upcoming Bookings' }] : []),
    ...upcomingBookings,
    ...(pastBookings.length > 0 ? [{ type: 'header', title: 'Past Bookings' }] : []),
    ...pastBookings,
  ];

  if (!loading && upcomingBookings.length === 0 && pastBookings.length === 0 && !error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noBookingsText}>You have no bookings yet.</Text>
        <CustomButton
          title="Find a Gym"
          onPress={() => navigation.navigate('Home')}
          style={styles.findGymButton}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={combinedBookings}
      keyExtractor={(item, index) => item.id || `header-${index}`}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return <Text style={styles.sectionHeader}>{item.title}</Text>;
        }
        return renderBookingItem({ item });
      }}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
      ListEmptyComponent={ // This might not be hit due to the explicit check above, but good for robustness
        !loading && !error && (
          <View style={styles.centered}>
            <Text style={styles.noBookingsText}>No bookings found.</Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fonts.size.medium,
    textAlign: 'center',
    marginBottom: 15,
  },
  noBookingsText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  findGymButton: {
    marginTop: 20,
    paddingHorizontal: 30,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.background,
    flexGrow: 1, // Ensure ScrollView/FlatList takes up space for RefreshControl
  },
  sectionHeader: {
    fontSize: theme.fonts.size.large,
    fontWeight: 'bold',
    color: theme.colors.textHeader,
    marginTop: 15,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bookingItem: {
    backgroundColor: theme.colors.white,
    padding: 15,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gymName: {
    fontSize: theme.fonts.size.medium,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  bookingDate: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    marginBottom: 3,
  },
  bookingTime: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    marginBottom: 5,
  },
  bookingStatus: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: theme.colors.danger, // Red for cancel
    paddingVertical: 8, // Smaller padding for small button
    marginTop: 5,
  },
  cancelButtonText: {
    color: theme.colors.white,
    fontSize: theme.fonts.size.xsmall, // Smaller font for small button
  },
});
