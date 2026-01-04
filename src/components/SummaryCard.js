import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SummaryCard = ({ title, amount, icon, color, type = 'default' }) => {
  const formatAmount = (value) => {
    // Değerin sayı olduğundan emin ol
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  return (
    <View style={[styles.card, shadows.medium, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.amount, { color }]}>
        {formatAmount(amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
    color: colors.textLight,
  },
  amount: {
    ...typography.h2,
    fontWeight: 'bold',
  },
});

export default SummaryCard;
