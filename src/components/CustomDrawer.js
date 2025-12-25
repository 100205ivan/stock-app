// src/components/CustomDrawer.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function CustomDrawer({ visible, onClose, onNavigate }) {
  const { theme } = useTheme();

  const menuItems = [
    {
      label: '首頁',
      icon: 'home-outline',
      screen: 'Home',
    },
    {
      label: '股票',
      icon: 'trending-up-outline',
      screen: 'Stocks',
    },
    {
      label: '持倉管理',
      icon: 'briefcase-outline',
      screen: 'Portfolio',
    },
    {
      label: '策略回測',
      icon: 'analytics-outline',
      screen: 'Backtest',
    },
    {
      label: '設定',
      icon: 'settings-outline',
      screen: 'Profile',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.drawer, { backgroundColor: theme.colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                選單
              </Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.menuItem,
                    { borderBottomColor: theme.colors.border },
                  ]}
                  onPress={() => onNavigate(item.screen)}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={theme.colors.primary}
                    style={styles.menuIcon}
                  />
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              ))}
            </ScrollView>

            <View
              style={[styles.footer, { borderTopColor: theme.colors.border }]}
            >
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                股票 App v2.0
              </Text>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '85%',
    height: '100%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
