// File: src/navigation/AppNavigator.js
// Role: Adding all main screens to MainAppStack and fixing Text import.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native'; // Import Text and StyleSheet
// import Icon from 'react-native-vector-icons/MaterialIcons'; // Example if using vector icons

// Import Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// Import Main App Screens
import HomeScreen from '../screens/Main/HomeScreen';
import GymDetails from '../screens/Main/GymDetails';
import BookingScreen from '../screens/Main/BookingScreen';
import MyBookingsScreen from '../screens/Main/MyBookingsScreen';
import ReviewScreen from '../screens/Main/ReviewScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';


import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator();

// Authentication stack
function AuthStack() {
  console.log("[AppNavigator] Rendering AuthStack");
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Common screen options for the MainAppStack
const mainAppStackScreenOptions = (navigation) => ({
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTintColor: theme.colors.white,
  headerTitleStyle: { fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.size.medium },
  headerBackTitleVisible: false,
  headerTitleAlign: 'center',
  headerRight: () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Profile')}
      style={{ marginRight: 15, padding: 5 }} // Added padding for easier touch
    >
      {/* Using the imported Text component */}
      <Text style={{ color: theme.colors.white, fontSize: theme.fonts.size.small }}>Profile</Text>
      {/* Example Icon:
      <Icon name="account-circle" size={28} color={theme.colors.white} />
      To use this, you would need to install and link react-native-vector-icons
      and uncomment the import at the top.
      */}
    </TouchableOpacity>
  ),
});

// Main application stack - now with all main screens
function MainAppStack() {
  console.log("[AppNavigator] Rendering MainAppStack with all screens");
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => mainAppStackScreenOptions(navigation)}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "FitFinder Home" }}
      />
      <Stack.Screen
        name="GymDetails"
        component={GymDetails}
        options={{ title: "Gym Details" }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: "Book Appointment" }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: "My Bookings" }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: "Write/Edit Review" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "My Profile",
          headerRight: null, // Remove the profile button from the Profile screen itself
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ user }) {
  console.log("[AppNavigator] User object:", user ? "Exists" : "Null");
  return user ? <MainAppStack /> : <AuthStack />;
}

// StyleSheet is needed if you have styles defined in this file,
// otherwise it can be removed if not used.
// For now, it's not strictly needed by the current AppNavigator code itself.
// const styles = StyleSheet.create({});
