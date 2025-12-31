import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView, Alert, Linking, SafeAreaView, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';
import { loadUserProfile, saveUserProfile, removeUserProfile } from '../storage/userStorage'; 
import EditProfileModal from '../components/EditProfileModal';

export default function ProfileScreen({ navigation }) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { openDrawer } = useDrawer();
  const [userProfile, setUserProfile] = useState({ name: 'Investor', email: 'user@example.com', bio: 'PRO', avatarInitials: 'U' });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const profile = await loadUserProfile(); setUserProfile(profile); };
  const handleSaveProfile = async (newProfile) => { await saveUserProfile(newProfile); setUserProfile(newProfile); Alert.alert('成功', '個人檔案已更新'); };
  const handleLogout = () => { Alert.alert('登出', '您已安全登出', [{ text: 'OK', onPress: async () => { await removeUserProfile(); navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] }); } }]); };

  const SettingItem = ({ icon, label, value, onPress, isDestructive, hasSwitch, switchValue, onSwitchChange }) => (
    <Pressable style={({ pressed }) => [styles.itemRow, { backgroundColor: theme.colors.card }, pressed && { opacity: 0.7 }]} onPress={hasSwitch ? null : onPress}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : theme.colors.surface }]}>
          <MaterialCommunityIcons name={icon} size={20} color={isDestructive ? theme.colors.error : theme.colors.text} />
        </View>
        <Text style={[styles.itemLabel, { color: isDestructive ? theme.colors.error : theme.colors.text }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {hasSwitch ? <Switch value={switchValue} onValueChange={onSwitchChange} trackColor={{ false: '#767577', true: theme.colors.primary }} /> : (
          <><Text style={[styles.itemValue, { color: theme.colors.textSecondary }]}>{value}</Text><MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textTertiary} /></>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
         <View style={styles.headerLeftRow}>
             <Pressable onPress={openDrawer} style={styles.menuButton}>
                <Ionicons name="menu" size={28} color={theme.colors.text} />
             </Pressable>
             <Text style={[styles.pageTitle, { color: theme.colors.text }]}>設定</Text>
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 個人資料卡 */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{userProfile.avatarInitials}</Text></View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{userProfile.name}</Text>
            <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>{userProfile.email}</Text>
            <View style={[styles.proTag, { backgroundColor: theme.colors.primary }]}><Text style={styles.proTagText}>{userProfile.bio || 'Free'}</Text></View>
          </View>
          <Pressable onPress={() => setShowEditModal(true)} style={[styles.editBtn, { backgroundColor: theme.colors.surface }]}><MaterialCommunityIcons name="pencil" size={20} color={theme.colors.text} /></Pressable>
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>一般</Text>
        <View style={[styles.group, { borderColor: theme.colors.border }]}>
          <View style={[styles.themeRow, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.itemLeft}><View style={[styles.iconBox, { backgroundColor: theme.colors.surface }]}><MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.colors.text} /></View><Text style={[styles.itemLabel, { color: theme.colors.text }]}>外觀主題</Text></View>
            <View style={styles.themeOptions}>
              {['light', 'dark', 'auto'].map((mode) => (
                <Pressable key={mode} onPress={() => setThemeMode(mode)} style={[styles.themeBtn, themeMode === mode && { backgroundColor: theme.colors.primary }]}><Text style={[styles.themeBtnText, { color: themeMode === mode ? '#FFF' : theme.colors.textSecondary }]}>{mode === 'light' ? '淺色' : mode === 'dark' ? '深色' : '自動'}</Text></Pressable>
              ))}
            </View>
          </View>
          <SettingItem icon="bell-outline" label="價格提醒" hasSwitch switchValue={true} onSwitchChange={() => {}} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>數據與隱私</Text>
        <View style={[styles.group, { borderColor: theme.colors.border }]}>
          <SettingItem icon="database-remove-outline" label="清除快取" onPress={() => Alert.alert('清除', '搜尋紀錄已清除')} />
          <SettingItem icon="logout-variant" label="登出帳號" isDestructive onPress={handleLogout} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <EditProfileModal visible={showEditModal} onClose={() => setShowEditModal(false)} initialData={userProfile} onSave={handleSaveProfile} />
    </SafeAreaView>
  );
}

const getFontFamily = (weight = 'normal') => Platform.OS === 'ios' ? 'PingFang TC' : (weight === 'bold' ? 'sans-serif-medium' : 'sans-serif');

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: { paddingHorizontal: 16, paddingVertical: 12, marginTop: 5, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.1)' },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 4, marginRight: 12 },
  pageTitle: { fontSize: 22, fontWeight: '700', fontFamily: getFontFamily('bold') },
  
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#3730A3' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', fontFamily: getFontFamily('bold') },
  profileEmail: { fontSize: 13, marginTop: 2, fontFamily: getFontFamily() },
  proTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  proTagText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  editBtn: { padding: 8, borderRadius: 20 },

  sectionHeader: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', fontFamily: getFontFamily() },
  group: { borderRadius: 12, overflow: 'hidden', marginBottom: 24, borderWidth: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 15, fontFamily: getFontFamily() },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 14, fontFamily: getFontFamily() },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  themeOptions: { flexDirection: 'row', backgroundColor: 'rgba(150,150,150,0.1)', borderRadius: 8, padding: 2 },
  themeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  themeBtnText: { fontSize: 12, fontWeight: '600', fontFamily: getFontFamily() },
});