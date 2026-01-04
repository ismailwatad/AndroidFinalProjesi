import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      id: 'categories',
      title: 'Kategori Yönetimi',
      icon: 'folder-outline',
      onPress: () => navigation.navigate('CategoryManagement'),
    },
    {
      id: 'profile',
      title: 'Profil Bilgileri',
      icon: 'person-outline',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 'about',
      title: 'Hakkında',
      icon: 'information-circle-outline',
      onPress: () =>
        Alert.alert(
          'Kişisel Harcama Takip',
          'Versiyon: 1.0.0\n\nGelir ve giderlerinizi kolayca takip edin.'
        ),
    },
    {
      id: 'logout',
      title: 'Çıkış Yap',
      icon: 'log-out-outline',
      onPress: handleLogout,
      color: colors.error,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Kullanıcı Bilgisi */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.displayName || 'Kullanıcı'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Ayarlar Listesi */}
      <View style={styles.settingsList}>
        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name={item.icon}
                size={24}
                color={item.color || colors.text}
              />
              <Text
                style={[styles.settingText, item.color && { color: item.color }]}
              >
                {item.title}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  userSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  settingsList: {
    backgroundColor: colors.surface,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    ...typography.body,
    marginLeft: spacing.md,
    color: colors.text,
  },
});

export default SettingsScreen;
