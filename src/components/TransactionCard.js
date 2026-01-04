import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../constants/theme';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Ionicons } from '@expo/vector-icons';

const TransactionCard = ({ transaction, category, onPress, onDelete }) => {
  const formatAmount = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const isIncome = transaction.type === 'income';
  const categoryInfo = category || { name: 'Diğer', icon: '📦', color: colors.textSecondary };

  return (
    <TouchableOpacity
      style={[styles.card, shadows.small]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color + '20' }]}>
          <Text style={styles.icon}>{categoryInfo.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>{categoryInfo.name}</Text>
          <Text style={styles.date}>
            {format(transaction.date, 'dd MMMM yyyy', { locale: tr })}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? colors.success : colors.error },
          ]}
        >
          {isIncome ? '+' : '-'} {formatAmount(transaction.amount)}
        </Text>
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(transaction.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  category: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.h3,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});

export default TransactionCard;
