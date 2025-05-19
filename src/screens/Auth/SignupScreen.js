// File: src/screens/Auth/SignupScreen.js
// Role: User registration screen with UI polish.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { signUpUser } from '../../firebase/authService';
import { addUserProfile } from '../../firebase/firestoreService';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import { isValidEmail, isEmpty, isValidPassword, doValuesMatch, isValidText } from '../../utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // State for input errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // State for input focus
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);


  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const nameValidation = isValidText(name, 'Full Name', 2);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.message);
      isValid = false;
    }

    if (isEmpty(email)) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    const passwordValidation = isValidPassword(password, 6);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      isValid = false;
    }

    if (isEmpty(confirmPassword)) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (!doValuesMatch(password, confirmPassword)) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signUpUser(email, password);
      if (userCredential && userCredential.user) {
        await addUserProfile(userCredential.user.uid, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          createdAt: new Date(),
        });
        // Navigation to HomeScreen is automatically handled by AppNavigator
      }
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join FitFinder to start your fitness journey!</Text>

            {/* Full Name Input */}
            <View style={styles.inputOuterContainer}>
                <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={nameFocused ? theme.colors.primary : theme.colors.grey}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[
                        styles.input,
                        nameFocused && styles.inputFocused,
                        nameError ? styles.inputError : null
                    ]}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        if (nameError) setNameError('');
                    }}
                    autoCapitalize="words"
                    placeholderTextColor={theme.colors.placeholder}
                    textContentType="name"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            {/* Email Input */}
            <View style={styles.inputOuterContainer}>
                <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={emailFocused ? theme.colors.primary : theme.colors.grey}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[
                        styles.input,
                        emailFocused && styles.inputFocused,
                        emailError ? styles.inputError : null
                    ]}
                    placeholder="Email Address"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={theme.colors.placeholder}
                    textContentType="emailAddress"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password Input */}
            <View style={styles.inputOuterContainer}>
                <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={passwordFocused ? theme.colors.primary : theme.colors.grey}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[
                        styles.input,
                        passwordFocused && styles.inputFocused,
                        passwordError ? styles.inputError : null
                    ]}
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry
                    placeholderTextColor={theme.colors.placeholder}
                    textContentType="newPassword"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Confirm Password Input */}
            <View style={styles.inputOuterContainer}>
                <MaterialCommunityIcons
                    name="lock-check-outline" // Different icon for confirm password
                    size={20}
                    color={confirmPasswordFocused ? theme.colors.primary : theme.colors.grey}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[
                        styles.input,
                        confirmPasswordFocused && styles.inputFocused,
                        confirmPasswordError ? styles.inputError : null
                    ]}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    secureTextEntry
                    placeholderTextColor={theme.colors.placeholder}
                    textContentType="newPassword"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                />
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}


            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <CustomButton
                    title="Sign Up"
                    onPress={handleSignup}
                    style={styles.button}
                />
            )}

            <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
            </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles are very similar to LoginScreen, with minor adjustments if needed
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.xlarge,
  },
  title: {
    fontSize: theme.fonts.size.xxlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textHeader,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.large, // Slightly less than login for more compact form
    textAlign: 'center',
  },
  inputOuterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.small,
  },
  inputIcon: {
    marginRight: theme.spacing.small,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: theme.spacing.xsmall,
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5, // This applies to the inputOuterContainer, not the TextInput itself
  },
  inputError: { // This style will be applied to inputOuterContainer
    borderColor: theme.colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    width: '100%',
    color: theme.colors.danger,
    fontSize: theme.fonts.size.xsmall,
    marginBottom: theme.spacing.medium,
    paddingLeft: theme.spacing.xsmall,
  },
  button: {
    marginTop: theme.spacing.medium,
    width: '100%',
  },
  loader: {
    marginVertical: theme.spacing.large + 10,
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.large,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.secondaryText,
    fontSize: theme.fonts.size.small,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold,
    fontSize: theme.fonts.size.small,
    marginLeft: theme.spacing.xxsmall,
  },
});
