import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../../firebase/config';
import { signOutUser } from '../../firebase/authService';
import { getUserProfile, updateUserProfile } from '../../firebase/firestoreService';
// import { uploadProfileImage, getProfileImageUrl } from '../../firebase/storageService'; // For profile picture
// import * as ImagePicker from 'expo-image-picker'; // For picking an image
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser;

  // States for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState('');
  // const [profileImageUri, setProfileImageUri] = useState(null); // For displaying profile image
  // const [imageUploading, setImageUploading] = useState(false);


  const fetchUserProfile = useCallback(async () => {
    if (!currentUser) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
        setEditableName(profile.name || '');
        // if (profile.profileImageUrl) { // If you implement profile images
        //   setProfileImageUri(profile.profileImageUrl);
        // }
      } else {
        // Fallback if profile doc doesn't exist but user is authenticated
        setUserProfile({ email: currentUser.email, name: currentUser.displayName || 'N/A' });
        setEditableName(currentUser.displayName || '');
      }
    } catch (err) {
      console.error("Error fetching user profile: ", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Refetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const handleLogout = async () => {
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
              // Navigation to AuthStack is handled by AppNavigator due to auth state change
            } catch (e) {
              Alert.alert("Logout Failed", e.message || "Could not log out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleSaveChanges = async () => {
    if (!currentUser) return;
    if (editableName.trim() === '') {
        Alert.alert("Input Error", "Name cannot be empty.");
        return;
    }
    setLoading(true);
    try {
        await updateUserProfile(currentUser.uid, { name: editableName.trim() });
        setUserProfile(prev => ({ ...prev, name: editableName.trim() })); // Update local state immediately
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
        Alert.alert("Update Failed", e.message || "Could not update profile.");
    } finally {
        setLoading(false);
    }
  };

  // Placeholder for image picking logic - Sprint 3
  // const handlePickImage = async () => {
  //   if (!currentUser) return;
  //   let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (permissionResult.granted === false) {
  //     Alert.alert("Permission Required", "You need to allow access to your photos to upload a profile picture.");
  //     return;
  //   }
  //   let pickerResult = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1], // Square aspect ratio
  //     quality: 0.5, // Compress image
  //   });

  //   if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
  //     const uri = pickerResult.assets[0].uri;
  //     setProfileImageUri(uri); // Show preview
  //     setImageUploading(true);
  //     try {
  //       const downloadURL = await uploadProfileImage(currentUser.uid, uri);
  //       await updateUserProfile(currentUser.uid, { profileImageUrl: downloadURL });
  //       setUserProfile(prev => ({ ...prev, profileImageUrl: downloadURL }));
  //       Alert.alert("Success", "Profile picture updated!");
  //     } catch (e) {
  //       Alert.alert("Upload Failed", e.message || "Could not upload image.");
  //       setProfileImageUri(userProfile?.profileImageUrl || null); // Revert to old image on failure
  //     } finally {
  //       setImageUploading(false);
  //     }
  //   }
  // };


  if (loading && !userProfile) { // Show loader only on initial full load
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        {currentUser && <CustomButton title="Try Again" onPress={fetchUserProfile} />}
        {!currentUser && <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />}
      </View>
    );
  }

  if (!currentUser || !userProfile) { // Should be caught by error or loading, but as a fallback
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>User data not available. Please log in.</Text>
        <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.profileHeader}>
        {/* Profile Image Placeholder - Sprint 3
        <TouchableOpacity onPress={handlePickImage} disabled={imageUploading}>
          <Image
            source={profileImageUri ? { uri: profileImageUri } : require('../../assets/images/default-profile.png')} // Add a default image to assets
            style={styles.profileImage}
          />
          {imageUploading && <ActivityIndicator size="small" color={theme.colors.white} style={styles.imageUploadIndicator} />}
        </TouchableOpacity>
        */}
         <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?')}
            </Text>
        </View>

        {!isEditing ? (
          <Text style={styles.userName}>{userProfile.name || 'No Name Set'}</Text>
        ) : (
          <TextInput
            style={[styles.input, styles.nameInput]}
            value={editableName}
            onChangeText={setEditableName}
            placeholder="Your Name"
            autoCapitalize="words"
          />
        )}
        <Text style={styles.userEmail}>{userProfile.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name:</Text>
          {!isEditing ? (
            <Text style={styles.infoValue}>{userProfile.name || 'Not set'}</Text>
          ) : (
            <Text style={styles.infoValue}>{editableName || 'Not set'}</Text> // Show current editable name
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{userProfile.email}</Text>
        </View>
        {/* Add more profile fields here if needed, e.g., join date */}
        {userProfile.createdAt && (
             <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Joined:</Text>
                <Text style={styles.infoValue}>
                    {userProfile.createdAt.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : new Date(userProfile.createdAt).toLocaleDateString()}
                </Text>
            </View>
        )}
      </View>

        {isEditing ? (
            <View style={styles.editActions}>
                <CustomButton title={loading ? "Saving..." : "Save Changes"} onPress={handleSaveChanges} disabled={loading} style={styles.actionButton} />
                <CustomButton title="Cancel" onPress={() => { setIsEditing(false); setEditableName(userProfile.name || ''); }} buttonColor={theme.colors.grey} style={styles.actionButton} />
            </View>
        ) : (
            <CustomButton title="Edit Profile" onPress={() => setIsEditing(true)} style={styles.actionButton} />
        )}

      {/* Add other sections like 'Settings', 'Help', etc. as needed */}
      {/* <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingsItem} onPress={() => Alert.alert("Notifications", "Notification settings coming soon!")}>
            <Text style={styles.settingsItemText}>Notification Preferences</Text>
        </TouchableOpacity>
         <TouchableOpacity style={styles.settingsItem} onPress={() => Alert.alert("Change Password", "Password change feature coming soon!")}>
            <Text style={styles.settingsItemText}>Change Password</Text>
        </TouchableOpacity>
      </View> */}


      <CustomButton
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={theme.colors.danger} // Use a distinct color for logout
        textStyle={styles.logoutButtonText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContentContainer: {
    paddingBottom: 30, // Space at the bottom
  },
  centered: {
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
    paddingVertical: 20,
    backgroundColor: theme.colors.primary, // Or a gradient
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accent, // A contrasting color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  // profileImage: { // For actual image
  //   width: 100,
  //   height: 100,
  //   borderRadius: 50,
  //   marginBottom: 10,
  //   borderWidth: 3,
  //   borderColor: theme.colors.white,
  // },
  // imageUploadIndicator: {
  //   position: 'absolute',
  //   top: '50%',
  //   left: '50%',
  //   transform: [{ translateX: -10 }, { translateY: -10 }], // Adjust based on indicator size
  // },
  userName: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.lightText, // Lighter text on primary background
  },
  nameInput: { // Style for TextInput when editing name
    fontSize: theme.fonts.size.xlarge,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white,
    paddingVertical: 5,
    marginBottom: 2,
    minWidth: 200, // Ensure it's wide enough
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: '600', // Semi-bold
    color: theme.colors.textHeader,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    fontWeight: '500',
  },
  input: { // General input style for editing mode
    width: '100%', // Or adjust as needed within its container
    height: 45,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.inputBackground,
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
  },
  editActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 10, // Space between edit/save/cancel buttons
  },
  settingsSection: { // For future settings
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingsItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  settingsItemText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20, // Add some space before logout
  },
  logoutButtonText: {
    color: theme.colors.white, // Assuming danger button color is dark
  },
});
