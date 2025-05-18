import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '../styles/theme'; 

const GymListItem = ({ gym, onPress }) => {
  if (!gym) {
    return null;
  }

  const displayRating = gym.averageRating ? `${gym.averageRating.toFixed(1)}/5` : (gym.rating ? `${gym.rating.toFixed(1)}/5` : 'N/A');
  const reviewCount = gym.reviewCount || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Optional: Gym Image */}
      {gym.imageUrl ? (
        <Image source={{ uri: gym.imageUrl }} style={styles.gymImage} />
      ) : (
        <View style={[styles.gymImage, styles.placeholderImage]}>
          {/* <Icon name="image" size={40} color={theme.colors.secondaryText} /> */}
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.gymName}>{gym.name || 'Unnamed Gym'}</Text>
        <Text style={styles.gymAddress} numberOfLines={2}>
          {gym.address || 'Address not available'}
        </Text>

        <View style={styles.ratingContainer}>
          {/* <Icon name="star" size={16} color={theme.colors.accent} style={styles.starIcon} /> */}
          <Text style={styles.ratingText}>{displayRating}</Text>
          <Text style={styles.reviewCountText}>({reviewCount} reviews)</Text>
        </View>

        {/* You can add more info like distance, open status, etc. */}
        {/* <Text style={styles.gymDistance}>Distance: {gym.distance || 'N/A'}</Text> */}
      </View>

      {/* Optional: Chevron or indicator for pressable item */}
      {/* <Icon name="chevron-right" size={24} color={theme.colors.secondaryText} style={styles.chevron} /> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small, 
    alignItems: 'center', 
  },
  gymImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.medium,
  },
  placeholderImage: {
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.secondaryText,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  gymName: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.textHeader,
    marginBottom: theme.spacing.xxsmall,
  },
  gymAddress: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.xsmall,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxsmall,
  },
  starIcon: {
    marginRight: theme.spacing.xxsmall,
  },
  ratingText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    marginRight: theme.spacing.xxsmall,
  },
  reviewCountText: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.lightText,
  },
  gymDistance: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.xxsmall,
  },
  chevron: {
    marginLeft: theme.spacing.small,
  }
});

export default GymListItem;
