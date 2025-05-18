import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';


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
      return theme.colors.grey;
    }
    if (outline) {
      return 'transparent';
    }
    return buttonColor || theme.colors.primary; 
  };

  const getButtonTextColor = () => {
    if (disabled) {
      return theme.colors.lightText;
    }
    if (outline) {
      return buttonColor || theme.colors.primary;
    }
    return textColor || theme.colors.white;
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
    style,
  ];

  const buttonTextStyles = [
    styles.text,
    { color: getButtonTextColor() },
    small && styles.smallText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled || loading ? 1 : 0.7}
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
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    
  },
  smallButton: {
    paddingVertical: theme.spacing.xsmall,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
  },
  outlineButton: {
    borderWidth: 1.5, 
  },
  disabledButton: {

  },
  text: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weights.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.fonts.size.small,
  },
  iconWrapper: {
    marginHorizontal: theme.spacing.xsmall,
  },
});

export default CustomButton;
