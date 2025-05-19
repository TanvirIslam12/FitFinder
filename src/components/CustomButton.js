// File: src/components/CustomButton.js
// Role: A reusable custom button component for consistent styling.

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View // Added View import
} from 'react-native';
import { theme } from '../styles/theme'; // Adjust path as needed

/**
 * A customizable button component.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The text to display on the button.
 * @param {function} props.onPress - Function to call when the button is pressed.
 * @param {object} [props.style] - Custom styles to apply to the button container (TouchableOpacity).
 * @param {object} [props.textStyle] - Custom styles to apply to the button text.
 * @param {string} [props.buttonColor] - Custom background color for the button. Overrides theme.colors.primary.
 * @param {string} [props.textColor] - Custom text color. Overrides theme.colors.white.
 * @param {boolean} [props.disabled=false] - If true, the button is disabled and onPress is not called.
 * @param {boolean} [props.loading=false] - If true, shows an ActivityIndicator instead of the title.
 * @param {boolean} [props.small=false] - If true, applies smaller padding and font size.
 * @param {boolean} [props.outline=false] - If true, applies an outline style.
 * @param {React.ReactNode} [props.iconLeft] - Optional icon component to display to the left of the title.
 * @param {React.ReactNode} [props.iconRight] - Optional icon component to display to the right of the title.
 */
const CustomButton = ({
  title,
  onPress,
  style,
  textStyle,
  buttonColor,
  textColor,
  disabled = false,
  loading = false,
  small = false,
  outline = false,
  iconLeft,
  iconRight,
}) => {
  const getButtonBackgroundColor = () => {
    if (disabled) {
      return theme.colors.grey; // Disabled color
    }
    if (outline) {
      return 'transparent'; // Transparent for outline
    }
    return buttonColor || theme.colors.primary; // Custom or primary
  };

  const getButtonTextColor = () => {
    if (disabled) {
      return theme.colors.lightText;
    }
    if (outline) {
      return buttonColor || theme.colors.primary; // Text color matches border for outline
    }
    return textColor || theme.colors.white; // Custom or default white
  };

  const getBorderColor = () => {
    if (disabled) {
        return theme.colors.grey;
    }
    return buttonColor || theme.colors.primary;
  };


  const buttonStyles = [
    styles.button,
    { backgroundColor: getButtonBackgroundColor() },
    small && styles.smallButton,
    outline && styles.outlineButton,
    outline && { borderColor: getBorderColor() },
    disabled && styles.disabledButton,
    style, // Allow custom styles to override
  ];

  const buttonTextStyles = [
    styles.text,
    { color: getButtonTextColor() },
    small && styles.smallText,
    textStyle, // Allow custom text styles
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled || loading ? 1 : 0.7} // No visual feedback if disabled/loading
    >
      {loading ? (
        <ActivityIndicator size={small ? "small" : "large"} color={getButtonTextColor()} />
      ) : (
        <React.Fragment>
          {iconLeft && <View style={styles.iconWrapper}>{iconLeft}</View>}
          <Text style={buttonTextStyles}>{title}</Text>
          {iconRight && <View style={styles.iconWrapper}>{iconRight}</View>}
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row', // For icon support
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    // ...theme.shadows.small, // Optional: Add default shadow
  },
  smallButton: {
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
  },
  outlineButton: {
    borderWidth: 1.5, // Thicker border for outline
  },
  disabledButton: {
    // backgroundColor is handled by getButtonBackgroundColor
    // elevation: 0, // Remove shadow if disabled
    // shadowOpacity: 0,
  },
  text: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weights.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.fonts.size.small,
  },
  iconWrapper: { // This style uses View implicitly
    marginHorizontal: theme.spacing.xsmall,
  },
});

export default CustomButton;
