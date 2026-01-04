# Kişisel Harcama Takip Uygulaması

React Native ile geliştirilmiş profesyonel bir kişisel finans yönetim uygulaması. Kullanıcıların gelir ve giderlerini kolayca takip etmelerini, kategorilere göre analiz yapmalarını ve aylık özetler görmelerini sağlar.

## Özellikler

### Temel Özellikler
- **Kullanıcı Kimlik Doğrulama**: AsyncStorage ile yerel kullanıcı yönetimi
- **Gelir/Gider Yönetimi**: Kolay işlem ekleme, düzenleme ve silme
- **Kategori Yönetimi**: Varsayılan kategoriler ve özel kategori oluşturma
- **Aylık Raporlar**: Detaylı finansal özetler ve grafikler
- **Modern UI/UX**: Kullanıcı dostu ve profesyonel arayüz
- **Yerel Veri Saklama**: Tüm veriler AsyncStorage ile cihazda saklanır

### Raporlama
- Toplam gelir, gider ve bakiye hesaplama
- Kategoriye göre gider dağılımı grafikleri
- Aylık karşılaştırma ve analiz

### Kullanıcı Arayüzü
- Bottom Tab Navigation ile kolay gezinme
- Özet kartları ile hızlı bilgi erişimi
- Renkli kategori ikonları
- Responsive tasarım

## Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo CLI
- **Firebase gerekmez!** - Uygulama AsyncStorage kullanarak yerel olarak çalışır

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Uygulamayı Başlatın

```bash
npm start
```

Expo Go uygulaması ile QR kodu tarayarak veya emülatör/simülatör üzerinde çalıştırabilirsiniz.

**Not**: Firebase yapılandırması gerekmez! Uygulama tüm verileri AsyncStorage ile cihazda saklar.

## Kullanım

### İlk Kullanım
1. Uygulamayı açın
2. "Kayıt Ol" butonuna tıklayın
3. Ad, e-posta ve şifre bilgilerinizi girin
4. Giriş yapın

### İşlem Ekleme
1. Ana ekranda veya "İşlem Ekle" sekmesinde "+" butonuna tıklayın
2. İşlem tipini seçin (Gelir/Gider)
3. Tutarı girin
4. Tarihi seçin
5. Gider ise kategori seçin
6. "Kaydet" butonuna tıklayın

### Raporları Görüntüleme
1. "Raporlar" sekmesine gidin
2. Ay seçici ile farklı ayları görüntüleyin
3. Kategoriye göre gider dağılımını grafiklerde inceleyin

### Kategori Yönetimi
1. "Ayarlar" sekmesine gidin
2. "Kategori Yönetimi" seçeneğine tıklayın
3. Yeni kategori ekleyin veya mevcut kategorileri düzenleyin/silin

## Proje Yapısı

```
expense-tracker/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   ├── SummaryCard.js
│   │   ├── TransactionCard.js
│   │   ├── CategoryCard.js
│   │   └── SimplePieChart.js
│   ├── constants/           # Sabitler ve tema
│   │   └── theme.js
│   ├── context/             # React Context API
│   │   └── AuthContext.js
│   ├── navigation/          # Navigasyon yapısı
│   │   └── AppNavigator.js
│   ├── screens/             # Ekranlar
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   └── main/
│   │       ├── DashboardScreen.js
│   │       ├── AddTransactionScreen.js
│   │       ├── ReportsScreen.js
│   │       ├── SettingsScreen.js
│   │       ├── CategoryManagementScreen.js
│   │       └── ProfileScreen.js
│   └── services/            # İş mantığı servisleri
│       ├── authService.js
│       ├── transactionService.js
│       └── categoryService.js
├── App.js                   # Ana uygulama dosyası
├── app.json                 # Expo yapılandırması
├── package.json             # Bağımlılıklar
└── README.md
```

## Tema ve Stil

Uygulama modern ve tutarlı bir tasarım sistemine sahiptir:
- **Renkler**: Primary (#4ECDC4), Secondary (#FF6B6B), Success, Error, Warning
- **Tipografi**: H1, H2, H3, Body, Caption stilleri
- **Spacing**: XS (4px), SM (8px), MD (16px), LG (24px), XL (32px)
- **Shadows**: Küçük, orta ve büyük gölge efektleri

## Kullanılan Kütüphaneler

- **React Native**: Mobil uygulama framework'ü
- **Expo**: Geliştirme ve build araçları
- **React Navigation**: Navigasyon yönetimi (Bottom Tabs ve Native Stack)
- **AsyncStorage**: Yerel veri saklama (@react-native-async-storage/async-storage)
- **react-native-svg**: SVG grafikleri için (SimplePieChart bileşeni)
- **date-fns**: Tarih işlemleri ve formatlama
- **@expo/vector-icons**: İkon kütüphanesi

## Güvenlik ve Veri Saklama

- **Yerel Veri Saklama**: Tüm veriler AsyncStorage ile cihazda saklanır
- **Kullanıcı Yönetimi**: Basit yerel kimlik doğrulama sistemi
- **Her Kullanıcının Verileri Ayrı**: Her kullanıcının verileri userId ile ayrılır
- **Önemli**: Şu anda şifreler şifrelenmemiş olarak saklanıyor (test amaçlı)

## Gelecek Geliştirmeler

- [ ] Veri dışa aktarma (CSV, PDF)
- [ ] Bütçe belirleme ve takip
- [ ] Tekrarlayan işlemler
- [ ] Fotoğraf ekleme özelliği
- [ ] Karanlık mod desteği
- [ ] Çoklu para birimi desteği
- [ ] Widget desteği

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## Geliştirici

Android Final Projesi - React Native Uygulaması

## Katkıda Bulunma

Proje geliştirme aşamasındadır. Önerileriniz ve geri bildirimleriniz için issue açabilirsiniz.
