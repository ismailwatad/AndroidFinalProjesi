import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import CategoryCard from '../../components/CategoryCard';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { parseISO } from 'date-fns';

const AddTransactionScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const editingTransaction = route?.params?.transaction;

  // Tarih nesnesini doğru şekilde parse et
  const getInitialDate = () => {
    if (editingTransaction?.date) {
      if (editingTransaction.date instanceof Date) {
        return editingTransaction.date;
      } else if (typeof editingTransaction.date === 'string') {
        return parseISO(editingTransaction.date);
      }
    }
    return new Date();
  };

  const [type, setType] = useState(editingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || '');
  const [date, setDate] = useState(getInitialDate());
  const [category, setCategory] = useState(editingTransaction?.category || null);
  const [categories, setCategories] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Boş değerlere izin vermek için tarih giriş state'leri
  const [dayInput, setDayInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  const [yearInput, setYearInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  // Tarih seçici açıldığında tarih girişlerini başlat
  useEffect(() => {
    if (showDatePicker) {
      setDayInput(date.getDate().toString());
      setMonthInput((date.getMonth() + 1).toString());
      setYearInput(date.getFullYear().toString());
    }
  }, [showDatePicker, date]);

  const loadCategories = async () => {
    if (!user) return;
    const result = await categoryService.getUserCategories(user.id);
    if (result.success) {
      setCategories(result.categories);
      if (!category && result.categories.length > 0 && type === 'expense') {
        setCategory(result.categories[0].id);
      }
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
      return;
    }

    if (type === 'expense' && !category) {
      Alert.alert('Hata', 'Lütfen bir kategori seçin');
      return;
    }

    setLoading(true);

    const transactionData = {
      type,
      amount: parseFloat(amount),
      date: date,
      category: type === 'expense' ? category : null,
    };

    let result;
    if (editingTransaction) {
      result = await transactionService.updateTransaction(
        editingTransaction.id,
        transactionData
      );
    } else {
      result = await transactionService.addTransaction(user.id, transactionData);
    }

    setLoading(false);

    if (result.success) {
      Alert.alert('Başarılı', editingTransaction ? 'İşlem güncellendi' : 'İşlem eklendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Hata', result.error || 'İşlem kaydedilemedi');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* İşlem Tipi Seçimi */}
        <View style={styles.section}>
          <Text style={styles.label}>İşlem Tipi</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActive,
                { backgroundColor: type === 'income' ? colors.success : colors.surface },
              ]}
              onPress={() => {
                setType('income');
                setCategory(null);
              }}
            >
              <Ionicons
                name="arrow-down-circle"
                size={24}
                color={type === 'income' ? colors.surface : colors.success}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  { color: type === 'income' ? colors.surface : colors.success },
                ]}
              >
                Gelir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActive,
                { backgroundColor: type === 'expense' ? colors.error : colors.surface },
              ]}
              onPress={() => setType('expense')}
            >
              <Ionicons
                name="arrow-up-circle"
                size={24}
                color={type === 'expense' ? colors.surface : colors.error}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  { color: type === 'expense' ? colors.surface : colors.error },
                ]}
              >
                Gider
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tutar Girişi */}
        <View style={styles.section}>
          <Text style={styles.label}>Tutar (₺)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Tarih Seçimi */}
        <View style={styles.section}>
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kategori Seçimi (Sadece Gider için) */}
        {type === 'expense' && (
          <View style={styles.section}>
            <Text style={styles.label}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    selected={category === cat.id}
                    onPress={() => setCategory(cat.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Kaydet Butonu */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.saveButtonText}>
              {editingTransaction ? 'Güncelle' : 'Kaydet'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowDatePicker(false);
                    }}
                    style={styles.modalButton}
                  >
                    <Text style={styles.modalButtonText}>İptal</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Tarih Seç</Text>
                  <TouchableOpacity
                    onPress={() => {
                      // Kapatmadan önce tarihi doğrula ve güncelle
                      const day = dayInput ? parseInt(dayInput) : date.getDate();
                      const month = monthInput ? parseInt(monthInput) : date.getMonth() + 1;
                      const year = yearInput ? parseInt(yearInput) : date.getFullYear();
                      
                      if (!isNaN(day) && day >= 1 && day <= 31 &&
                          !isNaN(month) && month >= 1 && month <= 12 &&
                          !isNaN(year) && year >= 1900 && year <= 2100) {
                        const newDate = new Date(year, month - 1, day);
                        setDate(newDate);
                      }
                      
                      Keyboard.dismiss();
                      setShowDatePicker(false);
                    }}
                    style={styles.modalButton}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.primary, fontWeight: '600' }]}>
                      Tamam
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.datePickerContainer}>
                  <View style={styles.dateFieldGroup}>
                    <Text style={styles.dateInputLabel}>Gün</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={dayInput}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="Gün"
                      placeholderTextColor={colors.textSecondary}
                      onChangeText={(text) => {
                        setDayInput(text);
                        if (text !== '') {
                          const day = parseInt(text);
                          if (!isNaN(day) && day >= 1 && day <= 31) {
                            const newDate = new Date(date);
                            newDate.setDate(day);
                            setDate(newDate);
                          }
                        }
                      }}
                    />
                  </View>
                  <View style={styles.dateFieldGroup}>
                    <Text style={styles.dateInputLabel}>Ay</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={monthInput}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="Ay"
                      placeholderTextColor={colors.textSecondary}
                      onChangeText={(text) => {
                        setMonthInput(text);
                        if (text !== '') {
                          const month = parseInt(text);
                          if (!isNaN(month) && month >= 1 && month <= 12) {
                            const newDate = new Date(date);
                            newDate.setMonth(month - 1);
                            setDate(newDate);
                          }
                        }
                      }}
                    />
                  </View>
                  <View style={styles.dateFieldGroup}>
                    <Text style={styles.dateInputLabel}>Yıl</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={yearInput}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder="Yıl"
                      placeholderTextColor={colors.textSecondary}
                      onChangeText={(text) => {
                        setYearInput(text);
                        if (text !== '') {
                          const year = parseInt(text);
                          if (!isNaN(year) && year >= 1900 && year <= 2100) {
                            const newDate = new Date(date);
                            newDate.setFullYear(year);
                            setDate(newDate);
                          }
                        }
                      }}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  typeButtonActive: {
    borderWidth: 0,
  },
  typeButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  dateText: {
    ...typography.body,
    color: colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.surface,
    ...typography.body,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalButton: {
    padding: spacing.sm,
    minWidth: 60,
  },
  modalButtonText: {
    ...typography.body,
    color: colors.text,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateFieldGroup: {
    flex: 1,
    alignItems: 'center',
  },
  dateInputLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  dateInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AddTransactionScreen;
