// src/navigation/RootNavigator.js
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import StocksScreen from '../screens/StocksScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import BacktestScreen from '../screens/BacktestScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// 股票：列表 + 詳細
function StocksStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="StocksMain"
        component={StocksScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={{ 
          title: '股票詳細',
          headerBackTitle: '返回',
        }}
      />
    </Stack.Navigator>
  );
}

// 主應用的 Tab Navigator
function MainTabNavigator() {
  const { theme } = useTheme();
  const { drawerVisible, openDrawer, closeDrawer } = useDrawer();
  const navigationRef = useRef(null);

  // 漢堡選單按鈕
  const renderMenuButton = () => (
    <Pressable
      onPress={openDrawer}
      style={{ marginLeft: 16 }}
      hitSlop={8}
    >
      <Ionicons name="menu" size={28} color={theme.colors.text} />
    </Pressable>
  );

  // 處理導航
  const handleNavigate = (screenName) => {
    if (navigationRef.current) {
      // 對於 Stocks，重置其 Stack 狀態以回到首頁
      if (screenName === 'Stocks') {
        navigationRef.current.navigate(screenName, {
          screen: 'StocksMain'
        });
      } else {
        navigationRef.current.navigate(screenName);
      }
      closeDrawer();
    }
  };

  return (
    <>
      <Tab.Navigator
      screenOptions={({ navigation }) => {
        // 保存 navigation reference
        if (!navigationRef.current) {
          navigationRef.current = navigation;
        }
        return {
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        };
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '首頁',
          headerLeft: renderMenuButton,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stocks"
        component={StocksStack}
        options={{
          title: '股票',
          headerLeft: renderMenuButton,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'trending-up' : 'trending-up-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          title: '持倉',
          headerLeft: renderMenuButton,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'briefcase' : 'briefcase-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Backtest"
        component={BacktestScreen}
        options={{
          title: '回測',
          headerLeft: renderMenuButton,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'analytics' : 'analytics-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '設定',
          headerShown: true,
          headerLeft: renderMenuButton,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
    
    <CustomDrawer
      visible={drawerVisible}
      onClose={closeDrawer}
      onNavigate={handleNavigate}
    />
    </>
  );
}

// 根導航器：歡迎頁 -> 主應用
export default function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <RootStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
      />
      <RootStack.Screen 
        name="MainApp" 
        component={MainTabNavigator}
      />
    </RootStack.Navigator>
  );
}