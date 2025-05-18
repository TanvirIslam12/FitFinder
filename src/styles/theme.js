import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');


const colors = {
  primary: '#1E90FF', 
  secondary: '#4CAF50', 
  accent: '#FFC107',
  danger: '#F44336', 
  success: '#4CAF50', 

  background: '#F5F5F5', 
  surface: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',

  text: '#333333', 
  textHeader: '#1A202C', 
  secondaryText: '#718096', 
  lightText: '#A0AEC0', 
  placeholder: '#A0AEC0', 

  border: '#CBD5E0',
  borderLight: '#E2E8F0', 
  inputBackground: '#FFFFFF', 
  lightGray: '#EDF2F7', 
  grey: '#808080', 
};


const fonts = {
  size: {
    xsmall: 12,
    small: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
  },
  weights: { 
    light: '300',
    normal: '400',
    medium: '500', 
    semibold: '600',
    bold: '700',
  }
};


const spacing = {
  xxsmall: 4,
  xsmall: 8,
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
};

const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
  xlarge: 24,
  round: 50, 
};


const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, 
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const theme = {
  colors,
  fonts,
  spacing,
  borderRadius,
  shadows,
  deviceWidth: width,
  deviceHeight: height,
};
