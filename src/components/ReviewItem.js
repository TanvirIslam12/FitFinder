import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme'; 

const ReviewItem = ({ review, onEdit, onDelete, currentUserId }) => {
  if (!review) {
    return null;
  }

  const reviewDate = review.createdAt?.toDate ? review.createdAt.toDate() : (review.createdAt ? new Date(review.createdAt) : null);
  const formattedDate = reviewDate ? reviewDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date unknown';

  const isAuthor = currentUserId && review.userId === currentUserId;

  const renderStars = (rating) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{review.userName || 'Anonymous User'}</Text>
        <View style={styles.ratingContainer}>
          {/* <Icon name="star" size={16} color={theme.colors.accent} style={styles.starIcon} />
          <Text style={styles.ratingText}>{review.rating ? review.rating.toFixed(1) : 'N/A'}/5</Text> */}
          <Text style={styles.starDisplay}>{renderStars(review.rating || 0)}</Text>
          <Text style={styles.ratingValue}> ({review.rating ? review.rating.toFixed(1) : 'N/A'})</Text>
        </View>
      </View>

      <Text style={styles.commentText}>{review.comment || 'No comment provided.'}</Text>

      <View style={styles.footer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        {isAuthor && (onEdit || onDelete) && ( 
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={[styles.actionButton, styles.deleteButton]}>
                <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  userName: {
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.textHeader,
    flexShrink: 1, 
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: { 
    marginRight: theme.spacing.xxsmall,
  },
  starDisplay: {
    color: theme.colors.accent,
    fontSize: theme.fonts.size.medium,
    marginRight: theme.spacing.xxsmall,
  },
  ratingValue: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.secondaryText,
    fontWeight: theme.fonts.weights.medium,
  },
  commentText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    lineHeight: theme.fonts.size.small * 1.5,
    marginBottom: theme.spacing.small,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.xsmall,
    marginTop: theme.spacing.xsmall,
  },
  dateText: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.lightText,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: theme.spacing.small,
    paddingVertical: theme.spacing.xxsmall,
    paddingHorizontal: theme.spacing.xsmall,
  },
  actionText: {
    fontSize: theme.fonts.size.xsmall,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.medium,
  },
  deleteButton: {
    
  },
  deleteActionText: {
    color: theme.colors.danger,
  }
});

export default ReviewItem;
