import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView, Alert, Linking, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';

import { savePortfolio } from '../storage/portfolioStorage';
import { saveWatchlistSymbols } from '../storage/watchlistStorage';
import { clearSearchHistory } from '../storage/searchHistoryStorage';
// 👇 請確認你的 userStorage 在這裡 (services 或 storage 資料夾)
import { loadUserProfile, saveUserProfile, removeUserProfile } from '../storage/userStorage'; 
import EditProfileModal from '../components/EditProfileModal';

export default function ProfileScreen({ navigation }) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { openDrawer } = useDrawer();
  const [userProfile, setUserProfile] = useState({ name: 'User Investor', email: 'user@example.com', bio: 'PRO 會員', avatarInitials: 'U' });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const profile = await loadUserProfile();
    setUserProfile(profile);
  };

  const handleSaveProfile = async (newProfile) => {
    await saveUserProfile(newProfile);
    setUserProfile(newProfile);
    Alert.alert('成功', '個人檔案已更新');
  };

  // 👇👇👇 這裡修改了：按下 OK 才跳轉 👇👇👇
  const handleLogout = () => {
    Alert.alert(
      '登出',               // 標題
      '您已安全登出',       // 內容
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              // 1. 清除帳號資料
              await removeUserProfile();
              
              // 2. 跳轉回 Welcome 頁面
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error("登出錯誤:", error);
              // 萬一出錯也強制跳轉
              navigation.navigate('Welcome');
            }
          }
        }
      ]
    );
  };

  const handleClearHistory = async () => {
    Alert.alert('清除搜尋紀錄', '確定要刪除所有搜尋歷史嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive', onPress: async () => { await clearSearchHistory(); Alert.alert('成功', '搜尋紀錄已清除'); } },
    ]);
  };

  const handleResetPortfolio = async () => {
    Alert.alert('重置投資組合', '這將會刪除您所有的持倉與交易紀錄，此動作無法復原！', [
      { text: '取消', style: 'cancel' },
      { text: '重置', style: 'destructive', onPress: async () => { await savePortfolio([]); Alert.alert('已重置', '您的投資組合已清空'); } },
    ]);
  };

  const handleResetWatchlist = async () => {
    Alert.alert('清空自選股', '確定要移除所有關注的股票嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: async () => { await saveWatchlistSymbols([]); Alert.alert('已清空', '自選股清單已重置'); } },
    ]);
  };

  const SettingItem = ({ icon, label, value, onPress, isDestructive, hasSwitch, switchValue, onSwitchChange }) => (
    <Pressable
      style={({ pressed }) => [styles.itemRow, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }, pressed && !hasSwitch && { backgroundColor: theme.colors.border + '40' }]}
      onPress={hasSwitch ? null : onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name={icon} size={20} color={isDestructive ? theme.colors.error : theme.colors.text} />
        </View>
        <Text style={[styles.itemLabel, { color: isDestructive ? theme.colors.error : theme.colors.text }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {hasSwitch ? (
          <Switch value={switchValue} onValueChange={onSwitchChange} trackColor={{ false: '#767577', true: theme.colors.primary }} />
        ) : (
          <>
            {value && <Text style={[styles.itemValue, { color: theme.colors.textSecondary }]}>{value}</Text>}
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.headerRow}>
           <Pressable onPress={openDrawer} style={{ marginRight: 12 }}>
             <Ionicons name="menu" size={28} color={theme.colors.text} />
           </Pressable>
           <Text style={[styles.pageTitle, { color: theme.colors.text }]}>設定</Text>
        </View>

        <View style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userProfile.avatarInitials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{userProfile.name}</Text>
            <View style={styles.badgeRow}>
              {userProfile.bio ? <View style={[styles.proBadge, { backgroundColor: theme.colors.primary }]}><Text style={styles.proBadgeText}>{userProfile.bio}</Text></View> : null}
              <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>{userProfile.email}</Text>
            </View>
          </View>
          <Pressable onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>外觀</Text>
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.themeSelectorRow, { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }]}>
            <Text style={[styles.itemLabel, { color: theme.colors.text, marginLeft: 16 }]}>主題模式</Text>
            <View style={styles.themeOptions}>
              {['light', 'dark', 'auto'].map((mode) => (
                <Pressable key={mode} onPress={() => setThemeMode(mode)} style={[styles.themeBtn, themeMode === mode && { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.themeBtnText, { color: themeMode === mode ? '#FFF' : theme.colors.textSecondary }]}>{mode === 'light' ? '淺色' : mode === 'dark' ? '深色' : '自動'}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <SettingItem icon="notifications-outline" label="價格提醒通知" hasSwitch switchValue={true} onSwitchChange={() => Alert.alert('提示', '通知設定功能開發中')} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>數據管理</Text>
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.card }]}>
          <SettingItem icon="search-outline" label="清除搜尋紀錄" onPress={handleClearHistory} />
          <SettingItem icon="star-outline" label="清空自選股" onPress={handleResetWatchlist} />
          <SettingItem icon="trash-outline" label="重置投資組合" isDestructive onPress={handleResetPortfolio} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>關於</Text>
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.card }]}>
          <SettingItem icon="information-circle-outline" label="版本資訊" value="v2.1.0" onPress={() => {}} />
          <SettingItem icon="document-text-outline" label="隱私權條款" onPress={() => Alert.alert('隱私權', '開啟瀏覽器顯示條款...')} />
          <SettingItem icon="mail-outline" label="聯絡客服" onPress={() => Linking.openURL('mailto:support@stockapp.com')} />
        </View>

        <Pressable 
          style={({pressed}) => [
            styles.logoutButton, 
            { borderColor: theme.colors.border, opacity: pressed ? 0.7 : 1 }
          ]} 
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>登出帳號</Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
      <EditProfileModal visible={showEditModal} onClose={() => setShowEditModal(false)} initialData={userProfile} onSave={handleSaveProfile} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 8, paddingHorizontal: 4 },
  pageTitle: { fontSize: 24, fontWeight: '800' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 24 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#3730A3' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  proBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  proBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  emailText: { fontSize: 13 },
  sectionHeader: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  sectionContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 16 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 14 },
  themeSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingRight: 16 },
  themeOptions: { flexDirection: 'row', backgroundColor: 'rgba(150, 150, 150, 0.1)', borderRadius: 8, padding: 2 },
  themeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  themeBtnText: { fontSize: 13, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 8, marginBottom: 20 },
  logoutText: { fontSize: 16, fontWeight: '600' },
});