import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import StocksScreen from '../screens/StocksScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import BacktestScreen from '../screens/BacktestScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import StockScreenerScreen from '../screens/StockScreenerScreen';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// 彈跳 Icon 組件
const AnimatedIcon = ({ name, color, size, focused }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleValue, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

// 股票頁面堆疊 (包含選單按鈕)
function StocksStack() {
  const { theme } = useTheme();
  const { openDrawer } = useDrawer(); 

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        animation: 'slide_from_right', 
      }}
    >
      <Stack.Screen
        name="StocksMain"
        component={StocksScreen}
        options={{ 
          title: '股票市場',
          headerLeft: () => (
            <Pressable onPress={openDrawer} style={{ marginRight: 16 }}>
              <Ionicons name="menu" size={24} color={theme.colors.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.symbol || '個股詳情',
          animation: 'default',
        })}
      />
      <Stack.Screen
        name="StockScreener"
        component={StockScreenerScreen}
        options={{ title: '選股看板' }}
      />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  const { theme } = useTheme();
  const { openDrawer, drawerVisible, closeDrawer } = useDrawer();
  const navigation = useNavigation();

  // 🔴 修復導航錯誤的關鍵邏輯
  const handleDrawerNavigate = (screen) => {
    const tabScreens = ['Home', 'Stocks', 'Portfolio', 'Backtest', 'Profile'];
    
    if (tabScreens.includes(screen)) {
      // 如果是 Tab 頁面，要告訴 Root 導航去 MainApp 裡面的 screen
      navigation.navigate('MainApp', { screen: screen });
    } else {
      navigation.navigate(screen);
    }
    closeDrawer();
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '首頁',
            tabBarIcon: (props) => <AnimatedIcon name={props.focused ? 'home' : 'home-outline'} {...props} />,
          }}
        />
        <Tab.Screen
          name="Stocks"
          component={StocksStack}
          options={{
            title: '股票',
            tabBarIcon: (props) => <AnimatedIcon name={props.focused ? 'trending-up' : 'trending-up-outline'} {...props} />,
          }}
        />
        <Tab.Screen
          name="Portfolio"
          component={PortfolioScreen}
          options={{
            title: '持倉',
            headerShown: true,
            headerTitle: '資產管理',
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.text,
            headerLeft: () => (
              <Pressable onPress={openDrawer} style={{ marginLeft: 16 }}>
                <Ionicons name="menu" size={24} color={theme.colors.text} />
              </Pressable>
            ),
            tabBarIcon: (props) => <AnimatedIcon name={props.focused ? 'briefcase' : 'briefcase-outline'} {...props} />,
          }}
        />
        <Tab.Screen
          name="Backtest"
          component={BacktestScreen}
          options={{
            title: '回測',
            headerShown: true,
            headerTitle: '策略回測',
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.text,
            headerLeft: () => (
              <Pressable onPress={openDrawer} style={{ marginLeft: 16 }}>
                <Ionicons name="menu" size={24} color={theme.colors.text} />
              </Pressable>
            ),
            tabBarIcon: (props) => <AnimatedIcon name={props.focused ? 'analytics' : 'analytics-outline'} {...props} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: '設定',
            tabBarIcon: (props) => <AnimatedIcon name={props.focused ? 'settings' : 'settings-outline'} {...props} />,
          }}
        />
      </Tab.Navigator>
      
      <CustomDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        onNavigate={handleDrawerNavigate}
      />
    </>
  );
}

export default function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // 全局滑動效果
      }}
    >
      <RootStack.Screen name="Welcome" component={WelcomeScreen} />
      <RootStack.Screen 
        name="MainApp" 
        component={MainTabNavigator} 
        options={{ animation: 'fade' }}
      />
    </RootStack.Navigator>
  );
}