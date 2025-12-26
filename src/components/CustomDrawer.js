// src/components/CustomDrawer.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85; // 選單佔螢幕寬度的 85%

export default function CustomDrawer({ visible, onClose, onNavigate }) {
  const { theme } = useTheme();
  
  // 動畫數值
  // initial value設為 -DRAWER_WIDTH (藏在螢幕左邊外面)
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 監聽 visible 變化來觸發進場動畫
  useEffect(() => {
    if (visible) {
      // 開啟：平行執行「滑入」與「背景變黑」
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0, // 回到原位
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.poly(4)), // 緩出效果，更有質感
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, // 背景顯現
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // 封裝一個帶有「退場動畫」的關閉函式
  const closeWithAnimation = (callback) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH, // 滑回左邊
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.poly(4)),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // 背景消失
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 動畫結束後，才真正執行關閉或導航
      if (callback) callback();
      else onClose();
    });
  };

  const handleNavigate = (screen) => {
    closeWithAnimation(() => onNavigate(screen));
  };

  const menuItems = [
    { label: '首頁', icon: 'home-outline', screen: 'Home' },
    { label: '股票', icon: 'trending-up-outline', screen: 'Stocks' },
    { label: '持倉管理', icon: 'briefcase-outline', screen: 'Portfolio' },
    { label: '策略回測', icon: 'analytics-outline', screen: 'Backtest' },
    { label: '設定', icon: 'settings-outline', screen: 'Profile' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // 關閉原生動畫，由我們自己控制
      onRequestClose={() => closeWithAnimation()} // 處理 Android 返回鍵
    >
      <View style={styles.overlayContainer}>
        {/* 背景遮罩 (點擊關閉) */}
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: fadeAnim } // 綁定透明度動畫
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={() => closeWithAnimation()} />
        </Animated.View>

        {/* 側邊欄本體 (滑動) */}
        <Animated.View
          style={[
            styles.drawer,
            { 
              backgroundColor: theme.colors.surface,
              transform: [{ translateX: slideAnim }] // 綁定位移動畫
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                功能選單
              </Text>
              <Pressable onPress={() => closeWithAnimation()} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {/* Menu Items */}
            <ScrollView contentContainerStyle={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: theme.colors.border + '40' },
                  ]}
                  onPress={() => handleNavigate(item.screen)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}>
                    <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.textTertiary}
                    style={{ marginLeft: 'auto' }}
                  />
                </Pressable>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                股票 App v2.1
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-start', // 靠左對齊 (雖然 animated 會控制位置，但這確保佈局正確)
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject, // 填滿全螢幕
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 16, // Android 陰影
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // 避開狀態列
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});