// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@stock_app_theme';

export const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#E0E0E0',
    divider: '#F0F0F0',
    primary: '#2196F3',
    primaryLight: '#64B5F6',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    up: '#EF4444',          // 漲紅
    down: '#10B981',        // 跌綠
    upBackground: '#FEF2F2',
    downBackground: '#F0FDF4',
    chartLine: '#2196F3',
    chartGrid: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#0A0A0A',      // 更深的背景
    surface: '#1A1A1A',         // 卡片背景
    card: '#252525',            // 次級卡片
    cardElevated: '#2A2A2A',    // 提升的卡片
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',   // 更亮的次要文字
    textTertiary: '#808080',    // 三級文字
    border: '#2A2A2A',          // 更柔和的邊框
    divider: '#1F1F1F',
    primary: '#3B82F6',         // 更鮮豔的藍色
    primaryLight: '#60A5FA',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    up: '#EF4444',              // 漲紅
    down: '#10B981',            // 跌綠
    upBackground: '#2D1515',    // 漲的背景
    downBackground: '#152D1F',  // 跌的背景
    chartLine: '#3B82F6',
    chartGrid: '#2A2A2A',
    shadow: 'rgba(0, 0, 0, 0.8)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    accent: '#8B5CF6',          // 強調色
    accentLight: '#A78BFA',
  },
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', 'auto'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // 載入儲存的主題設定
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
          setThemeMode(saved);
          if (saved === 'light') setIsDark(false);
          else if (saved === 'dark') setIsDark(true);
          else setIsDark(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      }
    };
    loadTheme();
  }, []);

  // 當系統主題改變時，如果是 auto 模式則跟隨
  useEffect(() => {
    if (themeMode === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    setIsDark(!isDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  };

  const setThemeModeValue = async (mode) => {
    setThemeMode(mode);
    if (mode === 'light') setIsDark(false);
    else if (mode === 'dark') setIsDark(true);
    else setIsDark(systemColorScheme === 'dark');
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeMode,
        toggleTheme,
        setThemeMode: setThemeModeValue,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
