// WelcomeScreen.js
// 風格：深空藍科技風 + [已放大 Icon 容器]
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Easing,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { login, register } from '../services/authApi';
import { saveUserProfile } from '../storage/userStorage';

const { width } = Dimensions.get('window');

// 🎨 配色表 (Color Palette)
const COLORS = {
  bgStart: '#0f172a',   // 深藍黑
  bgMid:   '#1e293b',   // 深藍灰
  bgEnd:   '#334155',   // 稍微亮一點的藍灰
  accent:  '#38bdf8',   // 亮青藍 (強調色)
  textMain:'#f8fafc',   // 幾乎全白
  textSub: '#94a3b8',   // 淺灰
  cardBg:  'rgba(30, 41, 59, 0.7)', // 深色玻璃底
  inputBg: 'rgba(15, 23, 42, 0.4)', // 輸入框深色底
  btnStart:'#2563eb',   // 寶石藍
  btnEnd:  '#0ea5e9',   // 海洋藍
};

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scalePulse = useRef(new Animated.Value(1)).current;
  const breathAnim = useRef(new Animated.Value(0)).current;
  const formFadeAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const formSlideAnims = [
    useRef(new Animated.Value(20)).current,
    useRef(new Animated.Value(20)).current,
    useRef(new Animated.Value(20)).current,
  ];

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scalePulse, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scalePulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    const formAnimations = formFadeAnims.map((fade, index) => [
      Animated.timing(fade, { toValue: 1, duration: 600, delay: index * 150, useNativeDriver: true }),
      Animated.spring(formSlideAnims[index], { toValue: 0, tension: 100, friction: 12, delay: index * 150, useNativeDriver: true }),
    ]).flat();
    Animated.stagger(150, formAnimations).start();
  }, [isLogin]);

  const handleSubmit = async () => {
    if (!email.trim() || !password || (!isLogin && !name.trim())) {
      Alert.alert('提示', '請完整填寫所有欄位');
      return;
    }
    setLoading(true);
    try {
      let userData;
      if (isLogin) {
        userData = await login(email.trim(), password);
      } else {
        userData = await register(name.trim(), email.trim(), password);
      }
      await saveUserProfile({
        name: userData.name || name.trim(),
        email: userData.email || email.trim(),
        bio: '股票投資者',
        avatarInitials: (userData.name || name)[0]?.toUpperCase() || 'U',
      });
      navigation.replace('MainApp');
    } catch (error) {
      Alert.alert('錯誤', typeof error === 'string' ? error : '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  const buttonScale = useRef(new Animated.Value(1)).current;
  const onButtonPressIn = () => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onButtonPressOut = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgStart }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.bgStart, COLORS.bgMid, COLORS.bgEnd]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.aurora, {
          opacity: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }),
          transform: [{ scale: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] 
        }]}>
          <LinearGradient
            colors={['transparent', 'rgba(56, 189, 248, 0.15)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                
                <View style={styles.header}>
                  <Animated.View style={[styles.logoContainer, { transform: [{ scale: scalePulse }] }]}>
                    <Image source={require('../../assets/app-logo.png')} style={styles.logo} resizeMode="contain" />
                  </Animated.View>
                  <Text style={styles.appName}>黃李智</Text>
                  <Text style={styles.appSlogan}>SMART TRADING</Text>
                </View>

                <Text style={styles.tagline}>
                  {isLogin ? '歡迎回來，掌握市場脈動' : '建立帳戶，開啟財富自由'}
                </Text>

                <View style={styles.formCard}>
                  {!isLogin && (
                    <Animated.View style={[styles.inputContainer, { opacity: formFadeAnims[0], transform: [{ translateX: formSlideAnims[0] }] }]}>
                      <View style={styles.iconWrapper}><Ionicons name="person" size={20} color={COLORS.accent} /></View>
                      <TextInput
                        style={styles.input}
                        placeholder="顯示名稱"
                        placeholderTextColor={COLORS.textSub}
                        value={name}
                        onChangeText={setName}
                      />
                    </Animated.View>
                  )}

                  <Animated.View style={[styles.inputContainer, { opacity: formFadeAnims[isLogin ? 0 : 1], transform: [{ translateX: formSlideAnims[isLogin ? 0 : 1] }] }]}>
                    <View style={styles.iconWrapper}><Ionicons name="mail" size={20} color={COLORS.accent} /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="電子郵件"
                      placeholderTextColor={COLORS.textSub}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </Animated.View>

                  <Animated.View style={[styles.inputContainer, { opacity: formFadeAnims[isLogin ? 1 : 2], transform: [{ translateX: formSlideAnims[isLogin ? 1 : 2] }] }]}>
                    <View style={styles.iconWrapper}><Ionicons name="lock-closed" size={20} color={COLORS.accent} /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="密碼"
                      placeholderTextColor={COLORS.textSub}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </Animated.View>

                  <Pressable
                    onPress={handleSubmit}
                    onPressIn={onButtonPressIn}
                    onPressOut={onButtonPressOut}
                    disabled={loading}
                    style={{ marginTop: 24 }}
                  >
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                      <LinearGradient
                        colors={[COLORS.btnStart, COLORS.btnEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryButton}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>{isLogin ? '登入' : '註冊'}</Text>
                        )}
                      </LinearGradient>
                    </Animated.View>
                  </Pressable>

                  <Pressable
                    style={styles.switchBtn}
                    onPress={() => {
                      setIsLogin(!isLogin);
                      setName(''); setEmail(''); setPassword('');
                    }}
                  >
                    <Text style={styles.switchText}>
                      {isLogin ? '還沒有帳號？ ' : '已經有帳號？ '}
                      <Text style={styles.switchHighlight}>{isLogin ? '立即註冊' : '前往登入'}</Text>
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.footer}>© 2025 Smart Trading Inc.</Text>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const getFontFamily = (weight = 'normal') => {
  if (Platform.OS === 'ios') return 'PingFang TC';
  return weight === 'bold' ? 'sans-serif-medium' : 'sans-serif';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  aurora: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  contentContainer: { alignItems: 'center', width: '100%' },
  
  header: { alignItems: 'center', marginBottom: 30 },
  
  // 🔥 [修改] 這裡把容器改大到 140x140，圓角也對應調整
  logoContainer: {
    width: 140, 
    height: 140,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // 🔥 [修改] 圖片保持佔滿 80%
  logo: { width: '80%', height: '80%' },
  
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: 1.5,
    fontFamily: getFontFamily('bold'),
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 10,
  },
  appSlogan: {
    fontSize: 14,
    color: COLORS.accent,
    letterSpacing: 6,
    fontWeight: '600',
    fontFamily: getFontFamily(),
  },
  
  tagline: {
    fontSize: 16,
    color: COLORS.textSub,
    marginBottom: 30,
    fontFamily: getFontFamily(),
    textAlign: 'center',
  },

  formCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 16,
    fontFamily: getFontFamily(),
    height: '100%',
    paddingRight: 16,
  },
  
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.btnStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: getFontFamily('bold'),
  },
  
  switchBtn: { marginTop: 24, alignItems: 'center', padding: 8 },
  switchText: { color: COLORS.textSub, fontSize: 14, fontFamily: getFontFamily() },
  switchHighlight: { color: COLORS.accent, fontWeight: '700' },
  
  footer: { marginTop: 40, color: 'rgba(255,255,255,0.2)', fontSize: 12 },
});