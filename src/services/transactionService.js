import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

const TRANSACTIONS_KEY = '@transactions';

// Tüm işlemleri getiren yardımcı fonksiyon
const getAllTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('İşlemler alınırken hata:', error);
    return [];
  }
};

// Tüm işlemleri kaydeden yardımcı fonksiyon
const saveAllTransactions = async (transactions) => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('İşlemler kaydedilirken hata:', error);
    return false;
  }
};

export const transactionService = {
  // Yeni işlem ekle
  addTransaction: async (userId, transactionData) => {
    try {
      const transactions = await getAllTransactions();
      const newTransaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...transactionData,
        userId,
        date: transactionData.date instanceof Date 
          ? transactionData.date.toISOString() 
          : transactionData.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      transactions.push(newTransaction);
      const saved = await saveAllTransactions(transactions);
      
      if (saved) {
        return { success: true, id: newTransaction.id };
      } else {
        return { success: false, error: 'İşlem kaydedilemedi' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // İşlem güncelle
  updateTransaction: async (transactionId, transactionData) => {
    try {
      const transactions = await getAllTransactions();
      const index = transactions.findIndex(t => t.id === transactionId);
      
      if (index === -1) {
        return { success: false, error: 'Transaction not found' };
      }
      
      transactions[index] = {
        ...transactions[index],
        ...transactionData,
        date: transactionData.date instanceof Date 
          ? transactionData.date.toISOString() 
          : transactionData.date || transactions[index].date,
        updatedAt: new Date().toISOString(),
      };
      
      const saved = await saveAllTransactions(transactions);
      return saved ? { success: true } : { success: false, error: 'İşlem güncellenemedi' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // İşlem sil
  deleteTransaction: async (transactionId) => {
    try {
      const transactions = await getAllTransactions();
      const filtered = transactions.filter(t => t.id !== transactionId);
      const saved = await saveAllTransactions(filtered);
      return saved ? { success: true } : { success: false, error: 'İşlem silinemedi' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcının tüm işlemlerini getir
  getUserTransactions: async (userId) => {
    try {
      const transactions = await getAllTransactions();
      const userTransactions = transactions
        .filter(t => t.userId === userId)
        .map(t => ({
          ...t,
          date: t.date ? (typeof t.date === 'string' ? parseISO(t.date) : t.date) : new Date(),
        }))
        .sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : parseISO(a.date);
          const dateB = b.date instanceof Date ? b.date : parseISO(b.date);
          return dateB - dateA; // Azalan sıra
        });
      
      return { success: true, transactions: userTransactions };
    } catch (error) {
      return { success: false, error: error.message, transactions: [] };
    }
  },

  // Belirli bir ayın işlemlerini getir
  getMonthlyTransactions: async (userId, monthDate) => {
    try {
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);
      
      const transactions = await getAllTransactions();
      const userTransactions = transactions
        .filter(t => {
          if (t.userId !== userId) return false;
          
          const transactionDate = t.date 
            ? (typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date))
            : new Date();
          
          return isWithinInterval(transactionDate, { start: startDate, end: endDate });
        })
        .map(t => ({
          ...t,
          date: t.date ? (typeof t.date === 'string' ? parseISO(t.date) : t.date) : new Date(),
        }))
        .sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : parseISO(a.date);
          const dateB = b.date instanceof Date ? b.date : parseISO(b.date);
          return dateB - dateA; // Azalan sıra
        });
      
      return { success: true, transactions: userTransactions };
    } catch (error) {
      return { success: false, error: error.message, transactions: [] };
    }
  },

  // Aylık özet hesapla
  calculateMonthlySummary: (transactions) => {
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenses = {};

    transactions.forEach((transaction) => {
      // Tutarın sayı olduğundan emin ol
      const amount = typeof transaction.amount === 'number' 
        ? transaction.amount 
        : parseFloat(transaction.amount) || 0;

      if (transaction.type === 'income') {
        totalIncome += amount;
      } else if (transaction.type === 'expense') {
        totalExpense += amount;
        
        if (transaction.category) {
          categoryExpenses[transaction.category] = 
            (categoryExpenses[transaction.category] || 0) + amount;
        }
      }
    });

    const balance = totalIncome - totalExpense;

    return {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      categoryExpenses,
    };
  }
};
