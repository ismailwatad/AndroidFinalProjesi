import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../constants/theme';

const CategoryCard = ({ category, selected, onPress, amount }) => {
  const formatAmount = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        shadows.small,
        selected && styles.selectedCard,
        { borderColor: category.color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <Text style={styles.name}>{category.name}</Text>
      {amount !== undefined && (
        <Text style={styles.amount}>{formatAmount(amount)}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    marginRight: spacing.md,
    minWidth: 100,
    borderWidth: 2,
  },
  selectedCard: {
    backgroundColor: colors.primary + '10',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CategoryCard;
