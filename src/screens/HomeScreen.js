import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext'; 
import { fetchLatestNews } from '../services/newsApi';

// 模擬指數資料
const MOCK_INDICES = [
  { name: '加權指數', symbol: '^TWII', value: 20120.55, change: 120.5, percent: 0.60 },
  { name: '櫃買指數', symbol: '^TWO', value: 252.12, change: -0.45, percent: -0.18 },
  { name: '道瓊工業', symbol: '^DJI', value: 39087.38, change: 90.99, percent: 0.23 },
  { name: '那斯達克', symbol: '^IXIC', value: 16274.94, change: -180.12, percent: -1.15 },
  { name: '費半指數', symbol: '^SOX', value: 4950.22, change: 45.3, percent: 0.92 },
];

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchLatestNews();
      setNews(data);
    } catch (e) {
      console.warn('load news error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

  const renderIndexCard = (item, index) => {
    const isUp = item.change >= 0;
    const color = isUp ? theme.colors.up : theme.colors.down;
    const bg = isUp ? theme.colors.upBackground : theme.colors.downBackground;

    return (
      <View
        key={index}
        style={[
          styles.indexCard,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.indexHeader}>
          <Text style={[styles.indexName, { color: theme.colors.textSecondary }]}>{item.name}</Text>
          <Text style={[styles.indexSymbol, { color: theme.colors.textTertiary }]}>{item.symbol}</Text>
        </View>
        <Text style={[styles.indexValue, { color: theme.colors.text }]}>
          {item.value.toLocaleString()}
        </Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeText, { color }]}>
            {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
          </Text>
          <View style={[styles.percentBadge, { backgroundColor: bg }]}>
            <Text style={[styles.percentText, { color }]}>
              {item.percent > 0 ? '+' : ''}{item.percent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderNewsItem = (item) => {
    return (
      <Pressable
        key={item.uuid}
        style={[styles.newsItem, { borderBottomColor: theme.colors.border }]}
        onPress={() => item.url && Linking.openURL(item.url)}
      >
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <Text style={[styles.newsSource, { color: theme.colors.primary }]}>
              {item.source}
            </Text>
            <Text style={[styles.newsTime, { color: theme.colors.textTertiary }]}>
              {item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
          <Text style={[styles.newsTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={[styles.newsDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.newsImage} resizeMode="cover" />
        ) : (
          <View style={[styles.newsImage, { backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="newspaper-outline" size={32} color={theme.colors.textTertiary} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* 頂部 Header */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerLeftRow}>
          {/* 選單按鈕 */}
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color={theme.colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{todayStr}</Text>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>市場概況</Text>
          </View>
        </View>

        <Pressable 
          style={[styles.searchButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Stocks', { screen: 'StocksMain' })}
        >
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* 指數卡片 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.indicesContainer}>
          {MOCK_INDICES.map(renderIndexCard)}
        </ScrollView>

        {/* 快捷按鈕區 (修正導航) */}
        <View style={styles.shortcutRow}>
          <Pressable 
            style={styles.shortcutBtn} 
            onPress={() => navigation.navigate('Stocks', { screen: 'StocksMain' })}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.text }]}>熱門排行</Text>
          </Pressable>

          <Pressable 
            style={styles.shortcutBtn} 
            onPress={() => navigation.navigate('Stocks', { 
              screen: 'StocksMain',
              params: { initialTab: 'watchlist' }
            })}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.warning + '15' }]}>
              <Ionicons name="star" size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.text }]}>自選股</Text>
          </Pressable>

          <Pressable 
            style={styles.shortcutBtn} 
            onPress={() => navigation.navigate('Backtest')}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.success + '15' }]}>
              <Ionicons name="analytics" size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.text }]}>策略回測</Text>
          </Pressable>

          <Pressable 
            style={styles.shortcutBtn} 
            onPress={() => navigation.navigate('Portfolio')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#8B5CF6' + '15' }]}>
              <Ionicons name="briefcase" size={24} color="#8B5CF6" />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.text }]}>資產管理</Text>
          </Pressable>
        </View>

        {/* 新聞列表 */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>財經快訊</Text>
          <Pressable onPress={loadNews}>
             <Ionicons name="refresh" size={18} color={theme.colors.primary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>正在更新市場資訊...</Text>
          </View>
        ) : (
          <View style={styles.newsList}>
            {news.map(renderNewsItem)}
            {news.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>目前沒有最新新聞</Text>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: { padding: 4 },
  dateText: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  welcomeText: { fontSize: 28, fontWeight: '800' },
  searchButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  indicesContainer: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  indexCard: { width: 150, padding: 12, borderRadius: 12, borderWidth: 1, marginRight: 0 },
  indexHeader: { marginBottom: 8 },
  indexName: { fontSize: 12, fontWeight: '600' },
  indexSymbol: { fontSize: 10, marginTop: 2 },
  indexValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 6 },
  changeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  changeText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  percentBadge: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  percentText: { fontSize: 10, fontWeight: '700', fontVariant: ['tabular-nums'] },
  shortcutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  shortcutBtn: { alignItems: 'center', gap: 8 },
  iconCircle: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  shortcutText: { fontSize: 12, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  newsList: { paddingHorizontal: 16 },
  newsItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  newsContent: { flex: 1, justifyContent: 'space-between' },
  newsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  newsSource: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  newsTime: { fontSize: 11 },
  newsTitle: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 6 },
  newsDesc: { fontSize: 13, lineHeight: 18 },
  newsImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  emptyText: { textAlign: 'center', marginTop: 20 }
});