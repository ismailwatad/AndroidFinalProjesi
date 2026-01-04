import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users';
const CURRENT_USER_KEY = '@currentUser';

// Tüm kullanıcıları getiren yardımcı fonksiyon
const getAllUsers = async () => {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Kullanıcılar alınırken hata:', error);
    return [];
  }
};

// Tüm kullanıcıları kaydeden yardımcı fonksiyon
const saveAllUsers = async (users) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Kullanıcılar kaydedilirken hata:', error);
    return false;
  }
};

// Mevcut kullanıcıyı getiren yardımcı fonksiyon
const getCurrentUser = async () => {
  try {
    const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Mevcut kullanıcı alınırken hata:', error);
    return null;
  }
};

// Mevcut kullanıcıyı kaydeden yardımcı fonksiyon
const saveCurrentUser = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
    return true;
  } catch (error) {
    console.error('Mevcut kullanıcı kaydedilirken hata:', error);
    return false;
  }
};

export const authService = {
  // Kullanıcı kaydı
  register: async (email, password, displayName) => {
    try {
      const users = await getAllUsers();
      
      // Kullanıcının zaten var olup olmadığını kontrol et
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' };
      }
      
      // Yeni kullanıcı oluştur
      const newUser = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        email,
        password, // Üretimde şifrelenmeli
        displayName,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      const saved = await saveAllUsers(users);
      
      if (saved) {
        // Mevcut kullanıcı olarak ayarla
        await saveCurrentUser(newUser);
        return { success: true, user: newUser };
      } else {
        return { success: false, error: 'Kullanıcı kaydedilemedi' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı girişi
  login: async (email, password) => {
    try {
      const users = await getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'E-posta veya şifre hatalı' };
      }
      
      // Mevcut kullanıcı olarak ayarla
      await saveCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı çıkışı
  logout: async () => {
    try {
      await saveCurrentUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Auth state listener (simüle edilmiş)
  onAuthStateChange: (callback) => {
    // Mevcut kullanıcıyı hemen kontrol et
    getCurrentUser().then(user => {
      callback(user);
    });
    
    // Abone olmayı iptal eden fonksiyon döndür (yerel depolama için no-op)
    return () => {};
  },

  // Mevcut kullanıcıyı al
  getCurrentUser: async () => {
    return await getCurrentUser();
  },

  // Mevcut kullanıcıyı senkron olarak al (anında erişim için)
  getCurrentUserSync: () => {
    // Bu AuthContext tarafından yönetilecek
    return null;
  },

  // Profil bilgilerini güncelle
  updateProfile: async (userId, updates) => {
    try {
      const users = await getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }
      
      // Kullanıcı verilerini güncelle
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      const saved = await saveAllUsers(users);
      
      if (saved) {
        // Aynı kullanıcıysa mevcut kullanıcıyı güncelle
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          await saveCurrentUser(users[userIndex]);
        }
        return { success: true, user: users[userIndex] };
      } else {
        return { success: false, error: 'Profil güncellenemedi' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Şifre değiştir
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const users = await getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }
      
      const user = users[userIndex];
      
      // Mevcut şifreyi kontrol et
      if (user.password !== currentPassword) {
        return { success: false, error: 'Mevcut şifre hatalı' };
      }
      
      // Yeni şifreyi doğrula
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'Yeni şifre en az 6 karakter olmalıdır' };
      }
      
      // Şifreyi güncelle
      users[userIndex] = {
        ...users[userIndex],
        password: newPassword,
        updatedAt: new Date().toISOString(),
      };
      
      const saved = await saveAllUsers(users);
      
      if (saved) {
        // Aynı kullanıcıysa mevcut kullanıcıyı güncelle
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          await saveCurrentUser(users[userIndex]);
        }
        return { success: true };
      } else {
        return { success: false, error: 'Şifre güncellenemedi' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
