import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES_KEY = '@categories';

// Varsayılan kategoriler
export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Gıda', icon: '🍔', color: '#FF6B6B' },
  { id: 'transport', name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
  { id: 'entertainment', name: 'Eğlence', icon: '🎬', color: '#95E1D3' },
  { id: 'bills', name: 'Faturalar', icon: '💡', color: '#F38181' },
  { id: 'shopping', name: 'Alışveriş', icon: '🛍️', color: '#AA96DA' },
  { id: 'health', name: 'Sağlık', icon: '🏥', color: '#FCBAD3' },
  { id: 'education', name: 'Eğitim', icon: '📚', color: '#A8E6CF' },
  { id: 'other', name: 'Diğer', icon: '📦', color: '#D3D3D3' },
];

// Tüm kategorileri getiren yardımcı fonksiyon
const getAllCategories = async () => {
  try {
    const data = await AsyncStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Kategoriler alınırken hata:', error);
    return [];
  }
};

// Tüm kategorileri kaydeden yardımcı fonksiyon
const saveAllCategories = async (categories) => {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Kategoriler kaydedilirken hata:', error);
    return false;
  }
};

export const categoryService = {
  // Kullanıcının kategorilerini getir
  getUserCategories: async (userId) => {
    try {
      const customCategories = await getAllCategories();
      const userCategories = customCategories.filter(cat => cat.userId === userId);
      
      // Varsayılan kategoriler + kullanıcının özel kategorileri
      const allCategories = [...DEFAULT_CATEGORIES, ...userCategories];
      
      return { success: true, categories: allCategories };
    } catch (error) {
      // Hata durumunda varsayılan kategorileri döndür
      return { success: true, categories: DEFAULT_CATEGORIES };
    }
  },

  // Yeni kategori ekle
  addCategory: async (userId, categoryData) => {
    try {
      const categories = await getAllCategories();
      const newCategory = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...categoryData,
        userId,
        createdAt: new Date().toISOString(),
      };
      
      categories.push(newCategory);
      const saved = await saveAllCategories(categories);
      
      if (saved) {
        return { success: true, id: newCategory.id };
      } else {
        return { success: false, error: 'Kategori kaydedilemedi' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kategori güncelle
  updateCategory: async (categoryId, categoryData) => {
    try {
      const categories = await getAllCategories();
      const index = categories.findIndex(cat => cat.id === categoryId);
      
      if (index === -1) {
        return { success: false, error: 'Category not found' };
      }
      
      categories[index] = {
        ...categories[index],
        ...categoryData,
      };
      
      const saved = await saveAllCategories(categories);
      return saved ? { success: true } : { success: false, error: 'Kategori güncellenemedi' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kategori sil
  deleteCategory: async (categoryId) => {
    try {
      const categories = await getAllCategories();
      const filtered = categories.filter(cat => cat.id !== categoryId);
      const saved = await saveAllCategories(filtered);
      return saved ? { success: true } : { success: false, error: 'Kategori silinemedi' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kategori ID'sine göre kategori bilgisini getir
  getCategoryById: (categoryId, categories) => {
    return categories.find(cat => cat.id === categoryId) || DEFAULT_CATEGORIES.find(cat => cat.id === 'other');
  }
};
