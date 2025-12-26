import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@stock_app_theme';

// 專業金融配色：亮色模式
export const lightTheme = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#F7F9FC',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    primary: '#2563EB',
    primaryLight: '#60A5FA',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    up: '#DC2626',              // 台股紅
    down: '#059669',            // 台股綠
    upBackground: '#FEF2F2',    // 淺紅底
    downBackground: '#ECFDF5',  // 淺綠底
    chartLine: '#2563EB',
    chartGrid: '#F3F4F6',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
};

// 專業金融配色：深色模式 (Dark Mode)
export const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#121212',      // 深灰底 (不傷眼)
    surface: '#1E1E1E',         // 卡片深灰
    card: '#1E1E1E',
    text: '#E5E7EB',            // 淺灰白字
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    border: '#2A2A2A',          // 深色分隔線
    divider: '#2A2A2A',
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    up: '#FF5252',              // 深色底用的亮紅
    down: '#4ADE80',            // 深色底用的亮綠
    upBackground: 'rgba(239, 68, 68, 0.15)',
    downBackground: 'rgba(74, 222, 128, 0.15)',
    chartLine: '#3B82F6',
    chartGrid: '#2A2A2A',
    shadow: 'rgba(0, 0, 0, 0.5)',
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
  const [themeMode, setThemeMode] = useState('auto');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

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