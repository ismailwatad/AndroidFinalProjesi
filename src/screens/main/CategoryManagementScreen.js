import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { categoryService, DEFAULT_CATEGORIES } from '../../services/categoryService';
import CategoryCard from '../../components/CategoryCard';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const CategoryManagementScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: colors.primary,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (!user) return;

    setLoading(true);
    const result = await categoryService.getUserCategories(user.id);
    if (result.success) {
      const defaultCats = result.categories.filter((cat) =>
        DEFAULT_CATEGORIES.some((dc) => dc.id === cat.id)
      );
      const customCats = result.categories.filter(
        (cat) => !DEFAULT_CATEGORIES.some((dc) => dc.id === cat.id)
      );
      setCategories(defaultCats);
      setUserCategories(customCats);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: '📦', color: colors.primary });
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Lütfen kategori adı girin');
      return;
    }

    if (editingCategory) {
      // Güncelle
      const result = await categoryService.updateCategory(editingCategory.id, formData);
      if (result.success) {
        Alert.alert('Başarılı', 'Kategori güncellendi');
        setModalVisible(false);
        loadCategories();
      } else {
        Alert.alert('Hata', result.error);
      }
    } else {
      // Yeni ekle
      const result = await categoryService.addCategory(user.id, formData);
      if (result.success) {
        Alert.alert('Başarılı', 'Kategori eklendi');
        setModalVisible(false);
        loadCategories();
      } else {
        Alert.alert('Hata', result.error);
      }
    }
  };

  const handleDelete = (category) => {
    if (DEFAULT_CATEGORIES.some((dc) => dc.id === category.id)) {
      Alert.alert('Bilgi', 'Varsayılan kategoriler silinemez');
      return;
    }

    Alert.alert(
      'Kategoriyi Sil',
      `${category.name} kategorisini silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const result = await categoryService.deleteCategory(category.id);
            if (result.success) {
              Alert.alert('Başarılı', 'Kategori silindi');
              loadCategories();
            } else {
              Alert.alert('Hata', result.error);
            }
          },
        },
      ]
    );
  };

  const colorOptions = [
    '#FF6B6B',
    '#4ECDC4',
    '#95E1D3',
    '#F38181',
    '#AA96DA',
    '#FCBAD3',
    '#A8E6CF',
    '#FFD93D',
    '#6BCB77',
    '#4D96FF',
  ];

  const iconOptions = ['📦', '🍔', '🚗', '🎬', '💡', '🛍️', '🏥', '📚', '✈️', '🏠', '🎮', '💻'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Varsayılan Kategoriler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Varsayılan Kategoriler</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryWrapper}>
                <CategoryCard category={category} />
              </View>
            ))}
          </View>
        </View>

        {/* Kullanıcı Kategorileri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Özel Kategoriler</Text>
            <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {userCategories.length === 0 ? (
            <Text style={styles.emptyText}>Henüz özel kategori eklenmemiş</Text>
          ) : (
            <View style={styles.categoriesGrid}>
              {userCategories.map((category) => (
                <View key={category.id} style={styles.categoryWrapper}>
                  <CategoryCard category={category} />
                  <View style={styles.categoryActions}>
                    <TouchableOpacity
                      onPress={() => openEditModal(category)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(category)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Kategori Ekleme/Düzenleme Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Kategori Adı"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.label}>İkon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconContainer}>
                {iconOptions.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      formData.icon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, icon })}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Renk</Text>
            <View style={styles.colorContainer}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.color === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, color })}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
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
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryWrapper: {
    position: 'relative',
  },
  categoryActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  addButton: {
    padding: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: colors.primary,
  },
  iconText: {
    fontSize: 24,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    color: colors.surface,
    ...typography.body,
    fontWeight: '600',
  },
});

export default CategoryManagementScreen;
