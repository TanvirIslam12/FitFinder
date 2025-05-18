import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      console.log('Location permission granted.');
      return true;
    } else {
      console.log('Location permission denied.');
      Alert.alert(
        'Location Permission Required',
        'FitFinder needs access to your location to show nearby gyms and your position on the map. Please enable location services for this app in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    Alert.alert('Permission Error', 'Could not request location permission. Please check your device settings.');
    return false;
  }
};


export const checkLocationPermissionStatus = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error checking location permission status:', error);
    return null;
  }
};
