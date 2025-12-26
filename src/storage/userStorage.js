import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PROFILE_KEY = '@user_profile';

const DEFAULT_PROFILE = {
  name: 'User Investor',
  email: 'user@example.com',
  bio: 'PRO 會員',
  avatarInitials: 'U',
};

// 讀取個人檔案
export async function loadUserProfile() {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_PROFILE;
  } catch (e) {
    console.warn('Load user profile error:', e);
    return DEFAULT_PROFILE;
  }
}

// 儲存個人檔案
export async function saveUserProfile(profile) {
  try {
    const jsonValue = JSON.stringify(profile);
    await AsyncStorage.setItem(USER_PROFILE_KEY, jsonValue);
    return true;
  } catch (e) {
    console.warn('Save user profile error:', e);
    return false;
  }
}

// 👇 [新增] 清除個人檔案 (登出用)
export async function removeUserProfile() {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
    return true;
  } catch (e) {
    console.warn('Remove user profile error:', e);
    return false;
  }
}