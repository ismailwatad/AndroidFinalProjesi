/**
 * Kategori Servisi
 * Kategori yönetimi işlemlerini yöneten servis
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage anahtarı
const KATEGORILER_ANAHTARI = '@categories';

// Varsayılan kategoriler
export const VARSAYILAN_KATEGORILER = [
  { id: 'food', name: 'Gıda', icon: '🍔', color: '#FF6B6B' },
  { id: 'transport', name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
  { id: 'entertainment', name: 'Eğlence', icon: '🎬', color: '#95E1D3' },
  { id: 'bills', name: 'Faturalar', icon: '💡', color: '#F38181' },
  { id: 'shopping', name: 'Alışveriş', icon: '🛍️', color: '#AA96DA' },
  { id: 'health', name: 'Sağlık', icon: '🏥', color: '#FCBAD3' },
  { id: 'education', name: 'Eğitim', icon: '📚', color: '#A8E6CF' },
  { id: 'other', name: 'Diğer', icon: '📦', color: '#D3D3D3' },
];

/**
 * Tüm kategorileri AsyncStorage'dan getiren yardımcı fonksiyon
 * @returns {Promise<Array>} Kategori listesi
 */
const tumKategorileriGetir = async () => {
  try {
    const veri = await AsyncStorage.getItem(KATEGORILER_ANAHTARI);
    return veri ? JSON.parse(veri) : [];
  } catch (hata) {
    console.error('Kategoriler alınırken hata:', hata);
    return [];
  }
};

/**
 * Tüm kategorileri AsyncStorage'a kaydeden yardımcı fonksiyon
 * @param {Array} kategoriler - Kaydedilecek kategori listesi
 * @returns {Promise<boolean>} İşlem başarılı mı?
 */
const tumKategorileriKaydet = async (kategoriler) => {
  try {
    await AsyncStorage.setItem(KATEGORILER_ANAHTARI, JSON.stringify(kategoriler));
    return true;
  } catch (hata) {
    console.error('Kategoriler kaydedilirken hata:', hata);
    return false;
  }
};

/**
 * Kategori Servisi Objesi
 * Tüm kategori işlemlerini içeren servis
 */
export const kategoriServisi = {
  /**
   * Kullanıcının kategorilerini getirir
   * @param {string} kullaniciId - Kullanıcı ID'si
   * @returns {Promise<Object>} İşlem sonucu ve kategori listesi
   */
  kullanicininKategorileriniGetir: async (kullaniciId) => {
    try {
      const ozelKategoriler = await tumKategorileriGetir();
      const kullaniciKategorileri = ozelKategoriler.filter(k => k.userId === kullaniciId);
      
      // Varsayılan kategoriler + kullanıcının özel kategorileri
      const tumKategoriler = [...VARSAYILAN_KATEGORILER, ...kullaniciKategorileri];
      
      return { success: true, categories: tumKategoriler };
    } catch (hata) {
      // Hata durumunda varsayılan kategorileri döndür
      return { success: true, categories: VARSAYILAN_KATEGORILER };
    }
  },

  /**
   * Yeni kategori ekler
   * @param {string} kullaniciId - Kategoriyi ekleyen kullanıcı ID'si
   * @param {Object} kategoriVerisi - Kategori bilgileri
   * @returns {Promise<Object>} İşlem sonucu ve kategori ID'si
   */
  kategoriEkle: async (kullaniciId, kategoriVerisi) => {
    try {
      const kategoriler = await tumKategorileriGetir();
      const yeniKategori = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...kategoriVerisi,
        userId: kullaniciId,
        createdAt: new Date().toISOString(),
      };
      
      kategoriler.push(yeniKategori);
      const kaydedildi = await tumKategorileriKaydet(kategoriler);
      
      if (kaydedildi) {
        return { success: true, id: yeniKategori.id };
      } else {
        return { success: false, error: 'Kategori kaydedilemedi' };
      }
    } catch (hata) {
      return { success: false, error: hata.message };
    }
  },

  /**
   * Mevcut kategoriyi günceller
   * @param {string} kategoriId - Güncellenecek kategori ID'si
   * @param {Object} kategoriVerisi - Güncellenecek kategori bilgileri
   * @returns {Promise<Object>} İşlem sonucu
   */
  kategoriGuncelle: async (kategoriId, kategoriVerisi) => {
    try {
      const kategoriler = await tumKategorileriGetir();
      const indeks = kategoriler.findIndex(k => k.id === kategoriId);
      
      if (indeks === -1) {
        return { success: false, error: 'Kategori bulunamadı' };
      }
      
      kategoriler[indeks] = {
        ...kategoriler[indeks],
        ...kategoriVerisi,
      };
      
      const kaydedildi = await tumKategorileriKaydet(kategoriler);
      return kaydedildi ? { success: true } : { success: false, error: 'Kategori güncellenemedi' };
    } catch (hata) {
      return { success: false, error: hata.message };
    }
  },

  /**
   * Kategoriyi siler
   * @param {string} kategoriId - Silinecek kategori ID'si
   * @returns {Promise<Object>} İşlem sonucu
   */
  kategoriSil: async (kategoriId) => {
    try {
      const kategoriler = await tumKategorileriGetir();
      const filtrelenmisKategoriler = kategoriler.filter(k => k.id !== kategoriId);
      const kaydedildi = await tumKategorileriKaydet(filtrelenmisKategoriler);
      return kaydedildi ? { success: true } : { success: false, error: 'Kategori silinemedi' };
    } catch (hata) {
      return { success: false, error: hata.message };
    }
  },

  /**
   * Kategori ID'sine göre kategori bilgisini getirir
   * @param {string} kategoriId - Aranacak kategori ID'si
   * @param {Array} kategoriler - Kategori listesi
   * @returns {Object} Kategori bilgisi veya varsayılan "Diğer" kategorisi
   */
  kategoriIdyeGoreGetir: (kategoriId, kategoriler) => {
    return kategoriler.find(k => k.id === kategoriId) || VARSAYILAN_KATEGORILER.find(k => k.id === 'other');
  }
};
