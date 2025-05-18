import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme'; 


const LoadingIndicator = ({
  size = 'large',
  color = theme.colors.primary,
  text,
  style,
  textStyle,
  fullScreen = false,
}) => {
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreenContainer,
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.medium,
  },
  fullScreenContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    zIndex: 1000,
  },
  text: {
    marginTop: theme.spacing.small,
    fontSize: theme.fonts.size.small,
    color: theme.colors.secondaryText,
  },
});

export default LoadingIndicator;
