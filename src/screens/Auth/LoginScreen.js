// File: src/screens/Auth/LoginScreen.js
// Role: User login screen with app logo and UI polish.

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
  Platform,
  Image
} from 'react-native';
import { signInUser } from '../../firebase/authService';
import { theme } from '../../styles/theme';
import CustomButton from '../../components/CustomButton';
import { isValidEmail, isEmpty } from '../../utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

// Assume your logo is named 'logo.png' and is in 'assets/images/'
const appLogo = require('../../../assets/images/logo.png'); // Adjust path if needed

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // State for input focus
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (isEmpty(email)) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (isEmpty(password)) {
      setPasswordError('Password is required.');
      isValid = false;
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      await signInUser(email, password);
      // Successful login will trigger onAuthStateChanged in App.js, leading to navigation
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred. Please try again.');
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

            <Image source={appLogo} style={styles.logo} resizeMode="contain" />

            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to find your next gym session.</Text>

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
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry
                    placeholderTextColor={theme.colors.placeholder}
                    textContentType="password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
            ) : (
                <CustomButton
                    title="Login"
                    onPress={handleLogin}
                    style={styles.button}
                />
            )}

            <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
            </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    paddingVertical: theme.spacing.xlarge, // Added more vertical padding
  },
  logo: {
    width: 120, // Adjusted size
    height: 120, // Adjusted size
    marginBottom: theme.spacing.large,
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
    marginBottom: theme.spacing.xlarge + theme.spacing.small, // Increased space
    textAlign: 'center',
  },
  inputOuterContainer: { // Container for icon and text input
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52, // Slightly taller to accommodate icon and border
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small, // Space for error text below
    paddingHorizontal: theme.spacing.small, // Padding for icon
  },
  inputIcon: {
    marginRight: theme.spacing.small,
  },
  input: {
    flex: 1, // Take remaining space
    height: '100%', // Fill height of outer container
    // Removed individual border/background here as it's on inputOuterContainer
    paddingHorizontal: theme.spacing.xsmall, // Horizontal padding within the text input part
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
  },
  inputFocused: { // Style for focused inputOuterContainer
    borderColor: theme.colors.primary, // Highlight border on focus
    borderWidth: 1.5, // Slightly thicker border
    // You could add shadow on focus too: ...theme.shadows.small,
  },
  inputError: { // Style for inputOuterContainer when there's an error
    borderColor: theme.colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    width: '100%', // Ensure error text aligns with input container
    color: theme.colors.danger,
    fontSize: theme.fonts.size.xsmall,
    marginBottom: theme.spacing.medium, // Space after error text
    paddingLeft: theme.spacing.xsmall, // Align with input text
  },
  button: {
    marginTop: theme.spacing.medium,
    width: '100%',
  },
  loader: {
    marginVertical: theme.spacing.large + 10, // Ensure enough space when button is replaced by loader
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xlarge, // More space before "Sign Up" link
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
