// File: src/screens/Main/HomeScreen.js
// Role: Main screen showing map with gyms, search bar, and user location.
// Updated to use a text-based CustomButton for "Suggest a Gym".

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  AppState,
  Platform,
  TouchableOpacity,
  Keyboard
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getGyms } from '../../firebase/firestoreService';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton'; // Using CustomButton again
import { requestLocationPermission, checkLocationPermissionStatus } from '../../utils/permissions';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// Default region (Melbourne CBD as a fallback)
const MELBOURNE_REGION = {
  latitude: -37.8136,
  longitude: 144.9631,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function HomeScreen({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(MELBOURNE_REGION);
  const [mapReady, setMapReady] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGyms, setFilteredGyms] = useState([]);
  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const locateUserAndCenterMap = useCallback(async (shouldAnimate = true) => {
    console.log('[HomeScreen] locateUserAndCenterMap called');
    const status = await checkLocationPermissionStatus();
    setPermissionStatus(status);

    if (status !== 'granted') {
      const granted = await requestLocationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      if (!granted) {
        setPermissionError('Location permission is needed to show your position and nearby gyms. Please enable it in settings.');
        setMapRegion(MELBOURNE_REGION);
        return;
      }
    }
    setPermissionError(null);

    try {
      console.log('[HomeScreen] Fetching current position...');
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      console.log('[HomeScreen] User location fetched:', userCoords);
      setCurrentLocation(userCoords);
      const newRegion = { ...userCoords, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
      setMapRegion(newRegion);

      if (mapRef.current && mapReady && shouldAnimate) {
        console.log('[HomeScreen] Animating map to user location.');
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('[HomeScreen] Error fetching current location:', error);
      setPermissionError('Could not fetch your current location. Showing default map area.');
      setMapRegion(MELBOURNE_REGION);
    }
  }, [mapReady]);

  const fetchGymsData = useCallback(async () => {
    console.log('[HomeScreen] Attempting to fetch gyms data...');
    setLoadingGyms(true);
    try {
      const fetchedGyms = await getGyms();
      console.log('[HomeScreen] Gyms fetched successfully:', fetchedGyms.length, "gyms");
      setGyms(fetchedGyms);
    } catch (dbError) {
      console.error("[HomeScreen] Error fetching gyms: ", dbError.message);
      Alert.alert('Error Loading Gyms', `Could not fetch gym data. ${dbError.message}`);
    } finally {
      setLoadingGyms(false);
    }
  }, []);

  useEffect(() => {
    locateUserAndCenterMap(false);
    fetchGymsData();
  }, [locateUserAndCenterMap, fetchGymsData]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[HomeScreen] App has come to the foreground!');
        checkLocationPermissionStatus().then(status => {
          if (status === 'granted' && permissionStatus !== 'granted') {
            console.log('[HomeScreen] Location permission newly granted in settings.');
            setPermissionStatus('granted');
            setPermissionError(null);
            locateUserAndCenterMap();
          }
        });
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [permissionStatus, locateUserAndCenterMap]);

  useFocusEffect(
    useCallback(() => {
      console.log('[HomeScreen] Screen focused. Re-fetching gyms data.');
      fetchGymsData();
      if (!currentLocation && permissionStatus === 'granted') {
        locateUserAndCenterMap();
      }
    }, [fetchGymsData, currentLocation, permissionStatus, locateUserAndCenterMap])
  );

  useEffect(() => {
    if (!gyms) {
        setFilteredGyms([]);
        return;
    }
    if (searchQuery.trim() === '') {
      setFilteredGyms(gyms);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = gyms.filter(gym =>
        (gym.name && gym.name.toLowerCase().includes(lowercasedQuery)) ||
        (gym.address && gym.address.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredGyms(filtered);
    }
  }, [searchQuery, gyms]);

  const handleMapReady = () => {
    console.log('[HomeScreen] Map is ready.');
    setMapReady(true);
  };

  const handleSuggestGym = () => {
    Alert.alert(
        "Suggest a Gym",
        "This feature allows you to suggest new gyms to be added to FitFinder. Coming soon!",
        [{ text: "OK" }]
    );
  };

  if (loadingGyms && gyms.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Finding gyms near you...</Text>
        {permissionError && <Text style={[styles.errorText, {marginTop: 10}]}>{permissionError}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search gyms by name or address..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.placeholder}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <MaterialIcons name="clear" size={20} color={theme.colors.secondaryText} />
            </TouchableOpacity>
        )}
      </View>

      {permissionError && !currentLocation && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{permissionError}</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        initialRegion={MELBOURNE_REGION}
        showsUserLocation={permissionStatus === 'granted'}
        showsMyLocationButton={permissionStatus === 'granted'}
        onMapReady={handleMapReady}
        onRegionChangeComplete={(region) => setMapRegion(region)}
        moveOnMarkerPress={false}
      >
        {filteredGyms.map(gym => {
          if (gym.location && typeof gym.location.latitude === 'number' && typeof gym.location.longitude === 'number') {
            return (
              <Marker
                key={gym.id}
                coordinate={{
                  latitude: gym.location.latitude,
                  longitude: gym.location.longitude,
                }}
                pinColor={theme.colors.accent}
              >
                <Callout
                  tooltip={false}
                  onPress={() => navigation.navigate('GymDetails', { gymId: gym.id, gymName: gym.name })}
                >
                  <View style={styles.calloutView}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>{gym.name}</Text>
                    <Text style={styles.calloutDescription} numberOfLines={1}>
                      {gym.address || 'Tap for details'}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>

      {/* Button for Suggesting a Gym - Text-based CustomButton */}
      <View style={styles.suggestGymContainer}>
        <CustomButton
          title="Suggest a New Gym"
          onPress={handleSuggestGym}
          style={styles.suggestGymButton} // Use a new style for this button
          buttonColor={theme.colors.secondary}
          // You can add textStyle prop if needed for CustomButton
        />
      </View>


      {searchQuery.length > 0 && filteredGyms.length === 0 && !loadingGyms && (
        <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No gyms found matching "{searchQuery}".</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: theme.spacing.small,
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.large : theme.spacing.medium,
    paddingBottom: theme.spacing.small,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.inputBackground,
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
  },
  clearSearchButton: {
    padding: theme.spacing.small,
    marginLeft: theme.spacing.xsmall,
  },
  errorBanner: {
    backgroundColor: theme.colors.danger + '20',
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    alignItems: 'center',
  },
  errorBannerText: {
    color: theme.colors.danger,
    textAlign: 'center',
    fontSize: theme.fonts.size.xsmall,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    fontSize: theme.fonts.size.xsmall,
  },
  map: {
    flex: 1,
  },
  calloutView: {
    padding: theme.spacing.small,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    minWidth: 160,
    maxWidth: 250,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  calloutTitle: {
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textHeader,
    marginBottom: 2,
  },
  calloutDescription: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.secondaryText,
  },
  // Removed suggestGymFAB style
  suggestGymContainer: { // Container for the suggest gym button
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.surface, // Optional: give it a background
    borderTopWidth: 1, // Optional: separator line
    borderTopColor: theme.colors.borderLight, // Optional: separator line color
  },
  suggestGymButton: { // Style for the CustomButton
    // CustomButton already has default padding, borderRadius, etc.
    // You can override or add specific styles here if needed, e.g.,
    // width: '100%', // If you want it full width
  },
  noResultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 100,
    left: 0,
    right: 0,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.surface + 'E6',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
  }
});
