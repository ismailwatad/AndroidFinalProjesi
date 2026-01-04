import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SimplePieChart from '../../components/SimplePieChart';
import { AuthContext } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import SummaryCard from '../../components/SummaryCard';
import { colors, spacing, typography } from '../../constants/theme';
import { format, subMonths, addMonths } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Ionicons } from '@expo/vector-icons';

const ReportsScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryExpenses: {},
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Kategorileri yükle
      const categoriesResult = await categoryService.getUserCategories(user.id);
      if (categoriesResult.success) {
        setCategories(categoriesResult.categories);
      }

      // İşlemleri yükle
      const transactionsResult = await transactionService.getMonthlyTransactions(
        user.id,
        selectedDate
      );
      if (transactionsResult.success) {
        setTransactions(transactionsResult.transactions);
        
        // Özeti hesapla
        const monthlySummary = transactionService.calculateMonthlySummary(
          transactionsResult.transactions
        );
        setSummary(monthlySummary);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedDate, loadData]);

  // Ekran odaklandığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user, loadData])
  );

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      setSelectedDate(subMonths(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  const prepareChartData = () => {
    const categoryExpenses = summary.categoryExpenses || {};
    const chartData = [];

    Object.keys(categoryExpenses).forEach((categoryId) => {
      const category = categoryService.getCategoryById(categoryId, categories);
      if (category && categoryExpenses[categoryId] > 0) {
        chartData.push({
          name: category.name,
          amount: categoryExpenses[categoryId],
          color: category.color,
          legendFontColor: colors.text,
          legendFontSize: 12,
        });
      }
    });

    return chartData;
  };

  const chartData = prepareChartData();
  const hasExpenses = summary.totalExpense > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Ay Seçici */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(selectedDate, 'MMMM yyyy', { locale: tr })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Özet Kartları */}
      <View style={styles.summarySection}>
        <SummaryCard
          title="Toplam Gelir"
          amount={summary.totalIncome}
          icon="arrow-down-circle"
          color={colors.success}
        />
        <SummaryCard
          title="Toplam Gider"
          amount={summary.totalExpense}
          icon="arrow-up-circle"
          color={colors.error}
        />
        <SummaryCard
          title="Kalan Bakiye"
          amount={summary.balance}
          icon="wallet"
          color={summary.balance >= 0 ? colors.primary : colors.warning}
        />
      </View>

      {/* Grafik Bölümü */}
      {hasExpenses && chartData.length > 0 ? (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Kategoriye Göre Gider Dağılımı</Text>
          <View style={styles.chartContainer}>
            <SimplePieChart data={chartData} />
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Bu ay için gider verisi bulunmuyor</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  monthButton: {
    padding: spacing.sm,
  },
  monthText: {
    ...typography.h3,
    color: colors.text,
  },
  summarySection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chartSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.text,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  },
});

export default ReportsScreen;
