// File: src/screens/Main/ProfileScreen.js
// Role: Displays user profile information with UI polish.
// DEBUGGING: Commenting out sections to find render error.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform
} from 'react-native';
import { auth } from '../../firebase/config';
import { signOutUser } from '../../firebase/authService';
import { getUserProfile, updateUserProfile } from '../../firebase/firestoreService';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');

  const fetchUserProfile = useCallback(async () => {
    console.log("[ProfileScreen] fetchUserProfile called.");
    if (!currentUser) {
      console.log("[ProfileScreen] No current user found in auth.");
      setError("User not logged in.");
      setLoading(false);
      setUserProfile(null);
      return;
    }
    console.log("[ProfileScreen] Current auth user UID:", currentUser.uid, "Auth Email:", currentUser.email);
    setError(null); // Reset error before fetch
    // setLoading(true); // Already set by initial state or focus effect
    try {
      const firestoreProfileData = await getUserProfile(currentUser.uid);
      let finalProfileData;

      if (firestoreProfileData) {
        console.log("[ProfileScreen] Firestore profile found:", JSON.stringify(firestoreProfileData));
        finalProfileData = {
          ...firestoreProfileData,
          email: currentUser.email,
          uid: currentUser.uid,
          name: firestoreProfileData.name || currentUser.displayName || 'Set Your Name',
        };
        setEditableName(finalProfileData.name === 'Set Your Name' ? '' : finalProfileData.name);
      } else {
        console.log("[ProfileScreen] No Firestore profile found. Falling back to auth details.");
        finalProfileData = {
          email: currentUser.email,
          name: currentUser.displayName || 'Set Your Name',
          uid: currentUser.uid,
        };
        setEditableName(finalProfileData.name === 'Set Your Name' ? '' : finalProfileData.name);
      }
      console.log("[ProfileScreen] Final profile data being set to state:", JSON.stringify(finalProfileData));
      setUserProfile(finalProfileData);

    } catch (err) {
      // This catch block might be catching render errors if fetch itself is fine
      console.error("[ProfileScreen] Error during fetchUserProfile (could be render error post-fetch): ", err);
      setError(err.message || "Failed to load profile. Please try again.");
      setUserProfile(null); // Ensure profile is null on error
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    setLoading(true); // Set loading true when component mounts
    fetchUserProfile();
  }, [fetchUserProfile]);

  useFocusEffect(
    useCallback(() => {
      console.log("[ProfileScreen] Screen focused, re-fetching profile.");
      setLoading(true); // Set loading true on focus
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const handleLogout = async () => { /* ... (same as before) ... */
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOutUser();
            } catch (e) {
              Alert.alert("Logout Failed", e.message || "Could not log out.");
            }
          },
        },
      ]
    );
  };

  const handleSaveChanges = async () => { /* ... (same as before) ... */
    if (!currentUser || !userProfile) {
      Alert.alert("Error", "User data not available.");
      return;
    }
    if (editableName.trim() === '') {
        Alert.alert("Input Error", "Name cannot be empty.");
        return;
    }
    setLoading(true);
    try {
        const updatedData = { name: editableName.trim() };
        if (userProfile.email && (!userProfile.id || !firestoreProfileData?.email)) { // Ensure email is saved if missing from Firestore
            updatedData.email = userProfile.email;
        }
        await updateUserProfile(currentUser.uid, updatedData);
        setUserProfile(prev => ({ ...prev, name: editableName.trim() }));
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
        Alert.alert("Update Failed", e.message || "Could not update profile.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // If there's an error string and we're not in an edit-save loading state
  if (error && !(loading && isEditing)) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {currentUser && <CustomButton title="Try Again" onPress={() => { setLoading(true); fetchUserProfile();}} />}
        {!currentUser && <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />}
      </View>
    );
  }

  if (!currentUser || !userProfile) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Text style={styles.errorText}>User data not available. Please log in.</Text>
        <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.profileHeader}>
         <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
                {(userProfile.name ? userProfile.name.charAt(0) : (userProfile.email ? userProfile.email.charAt(0) : '?')).toUpperCase()}
            </Text>
        </View>
        {!isEditing ? (
          <Text style={styles.userName}>{userProfile.name || 'Set Your Name'}</Text>
        ) : (
          <TextInput
            style={styles.nameInput}
            value={editableName}
            onChangeText={setEditableName}
            placeholder="Your Name"
            placeholderTextColor={theme.colors.lightText + 'AA'}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
        )}
        <Text style={styles.userEmail}>{userProfile.email || 'Email not available'}</Text>
      </View>

      {/* My Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Account</Text>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <MaterialCommunityIcons name="calendar-check-outline" size={24} color={theme.colors.primary} style={styles.actionItemIcon} />
          <Text style={styles.actionItemText}>My Bookings</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.grey} />
        </TouchableOpacity>
      </View>

      {/* Account Details Section - Temporarily Commented Out for Debugging */}
      {/*
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{isEditing ? editableName : (userProfile.name || 'Not set')}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{userProfile.email || 'Not available'}</Text>
        </View>
        {userProfile.createdAt && (
             <View style={[styles.infoItem, styles.lastInfoItem]}>
                <Text style={styles.infoLabel}>Joined:</Text>
                <Text style={styles.infoValue}>
                    {userProfile.createdAt.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : (userProfile.createdAt instanceof Date ? userProfile.createdAt.toLocaleDateString() : 'N/A')}
                </Text>
            </View>
        )}
      </View>
      */}

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        {isEditing ? (
            <>
                <CustomButton
                    title={loading && isEditing ? "Saving..." : "Save Changes"}
                    onPress={handleSaveChanges}
                    disabled={loading && isEditing}
                    style={styles.formButton}
                    iconLeft={<MaterialCommunityIcons name="content-save-outline" size={20} color={theme.colors.white} />}
                />
                <CustomButton
                    title="Cancel Edit"
                    onPress={() => { setIsEditing(false); setEditableName(userProfile.name || ''); }}
                    buttonColor={theme.colors.grey}
                    style={styles.formButton}
                    outline
                    textColor={theme.colors.grey}
                />
            </>
        ) : (
            <CustomButton
                title="Edit Profile"
                onPress={() => setIsEditing(true)}
                style={styles.formButton}
                iconLeft={<MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.white} />}
            />
        )}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          style={styles.formButton}
          buttonColor={theme.colors.danger}
          textStyle={{ color: theme.colors.white }}
          iconLeft={<MaterialCommunityIcons name="logout" size={20} color={theme.colors.white} />}
        />
      </View>
    </ScrollView>
  );
}

// Styles remain the same as the "UI Polish" version
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContentContainer: {
    paddingBottom: theme.spacing.xlarge,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.large,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.large,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 48,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xxsmall,
  },
  userEmail: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.white + 'CC',
    marginTop: theme.spacing.xxsmall,
  },
  nameInput: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.white + 'AA',
    paddingVertical: theme.spacing.small,
    marginBottom: theme.spacing.xxsmall,
    minWidth: 280,
    marginHorizontal: theme.spacing.medium,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    ...theme.shadows.small,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.secondaryText,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.xsmall,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionItemIcon: {
    marginRight: theme.spacing.medium,
  },
  actionItemText: {
    flex: 1,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
  },
  actionItemChevron: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.grey,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  lastInfoItem: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
  },
  infoValue: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
  formButton: {
    marginBottom: theme.spacing.medium,
  },
});
