import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import SummaryCard from '../../components/SummaryCard';
import TransactionCard from '../../components/TransactionCard';
import { colors, spacing, typography } from '../../constants/theme';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: tr });

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      
      // Kategorileri yükle
      const categoriesResult = await categoryService.getUserCategories(user.id);
      if (categoriesResult.success) {
        setCategories(categoriesResult.categories);
      }

      // İşlemleri yükle
      const transactionsResult = await transactionService.getMonthlyTransactions(
        user.id,
        today
      );
      if (transactionsResult.success) {
        setTransactions(transactionsResult.transactions);
        
        // Özeti hesapla
        const monthlySummary = transactionService.calculateMonthlySummary(
          transactionsResult.transactions
        );
        
        // Özet state'ini açık değerlerle güncelle
        setSummary({
          totalIncome: monthlySummary.totalIncome || 0,
          totalExpense: monthlySummary.totalExpense || 0,
          balance: monthlySummary.balance || 0,
        });
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Ekran odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user, loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteTransaction = async (transactionId) => {
    const result = await transactionService.deleteTransaction(transactionId);
    if (result.success) {
      await loadData();
    }
  };

  const getCategoryById = (categoryId) => {
    return categoryService.getCategoryById(categoryId, categories);
  };

  const recentTransactions = transactions.slice(0, 10);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.monthText}>{currentMonth}</Text>
      </View>

      <View style={styles.summarySection}>
        <SummaryCard
          key={`income-${summary.totalIncome}`}
          title="Toplam Gelir"
          amount={summary.totalIncome}
          icon="arrow-down-circle"
          color={colors.success}
        />
        <SummaryCard
          key={`expense-${summary.totalExpense}`}
          title="Toplam Gider"
          amount={summary.totalExpense}
          icon="arrow-up-circle"
          color={colors.error}
        />
        <SummaryCard
          key={`balance-${summary.balance}`}
          title="Kalan Bakiye"
          amount={summary.balance}
          icon="wallet"
          color={summary.balance >= 0 ? colors.primary : colors.warning}
        />
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransaction')}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Henüz işlem bulunmuyor</Text>
            <Text style={styles.emptySubtext}>Yeni işlem eklemek için + butonuna tıklayın</Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              category={getCategoryById(transaction.category)}
              onPress={() => navigation.navigate('AddTransaction', { transaction })}
              onDelete={handleDeleteTransaction}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  monthText: {
    ...typography.h2,
    color: colors.text,
  },
  summarySection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  transactionsSection: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  addButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
