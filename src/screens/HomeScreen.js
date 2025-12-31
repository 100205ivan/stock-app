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
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // ✨ 新增 MaterialCommunityIcons 用於更專業的圖示
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';
import { fetchLatestNews } from '../services/newsApi';

// 模擬指數資料 (✨ 新增 trend 欄位來模擬走勢圖方向)
const MOCK_INDICES = [
  { name: '加權指數', symbol: '^TWII', value: 20120.55, change: 120.5, percent: 0.60, trend: 'up' },
  { name: '櫃買指數', symbol: '^TWO', value: 252.12, change: -0.45, percent: -0.18, trend: 'down' },
  { name: '道瓊工業', symbol: '^DJI', value: 39087.38, change: 90.99, percent: 0.23, trend: 'up' },
  { name: '那斯達克', symbol: '^IXIC', value: 16274.94, change: -180.12, percent: -1.15, trend: 'down' },
  { name: '費半指數', symbol: '^SOX', value: 4950.22, change: 45.3, percent: 0.92, trend: 'up' },
];

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✨ 獲取今日日期
  const today = new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });

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

  // ✨✨✨ [重點改造] 指數卡片渲染 ✨✨✨
  const renderIndexCard = (item, index) => {
    const isUp = item.change >= 0;
    const color = isUp ? theme.colors.up : theme.colors.down;
    // 使用更專業的箭頭符號
    const ArrowIcon = isUp ? 'triangle' : 'triangle-down';
    // 模擬走勢圖圖示
    const TrendChartIcon = isUp ? 'chart-line-variant' : 'chart-line-variant';

    return (
      <Pressable
        key={index}
        style={[
          styles.indexCard,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.indexCardTop}>
          <View>
            <Text style={[styles.indexName, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.indexSymbol, { color: theme.colors.textTertiary }]}>{item.symbol}</Text>
          </View>
          {/* ✨ 模擬迷你走勢圖 (用大圖示淡化呈現) */}
          <MaterialCommunityIcons 
            name={TrendChartIcon} 
            size={32} 
            color={color} 
            style={{ opacity: 0.2, transform: isUp ? [] : [{ scaleY: -1 }] }} 
          />
        </View>
        
        <View style={styles.indexCardMain}>
           {/* ✨ 加大點數字體 */}
          <Text style={[styles.indexValue, { color: theme.colors.text }]}>
            {item.value.toLocaleString()}
          </Text>
        </View>

        <View style={styles.indexCardBottom}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* ✨ 加入實心箭頭 */}
            <MaterialCommunityIcons name={ArrowIcon} size={10} color={color} style={{ marginRight: 2 }} />
            <Text style={[styles.changeText, { color }]}>
              {Math.abs(item.change).toFixed(2)}
            </Text>
          </View>
          <Text style={[styles.percentText, { color }]}>
            {item.percent > 0 ? '+' : ''}{item.percent.toFixed(2)}%
          </Text>
        </View>
      </Pressable>
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
            {/* ✨ 新聞來源加粗 */}
            <Text style={[styles.newsSource, { color: theme.colors.text }]}>
              {item.source}
            </Text>
            <Text style={[styles.newsTime, { color: theme.colors.textTertiary }]}>
              {item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
          <Text style={[styles.newsTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.newsImage} resizeMode="cover" />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftRow}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color={theme.colors.text} />
          </Pressable>
          <View style={{ marginLeft: 12 }}>
             <Text style={[styles.pageTitle, { color: theme.colors.text }]}>市場概況</Text>
             {/* ✨ 新增日期與狀態列 */}
             <Text style={[styles.marketStatus, { color: theme.colors.textSecondary }]}>{today} · 市場開盤中</Text>
          </View>
        </View>

        <Pressable 
          style={[styles.searchButton, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}
          onPress={() => navigation.navigate('Stocks', { screen: 'StocksMain' })}
        >
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* 指數卡片區 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.indicesContainer}>
          {MOCK_INDICES.map(renderIndexCard)}
        </ScrollView>

        {/* 快捷按鈕區 (樣式微調得更緊湊) */}
        <View style={styles.shortcutRow}>
          <Pressable style={styles.shortcutBtn} onPress={() => navigation.navigate('Stocks', { screen: 'StocksMain' })}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="trending-up" size={22} color={theme.colors.primary} />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.textSecondary }]}>熱門排行</Text>
          </Pressable>

          <Pressable style={styles.shortcutBtn} onPress={() => navigation.navigate('Stocks', { screen: 'StocksMain', params: { initialTab: 'watchlist' } })}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="star" size={22} color={theme.colors.warning} />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.textSecondary }]}>自選股</Text>
          </Pressable>

          <Pressable style={styles.shortcutBtn} onPress={() => navigation.navigate('Backtest')}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="analytics" size={22} color={theme.colors.success} />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.textSecondary }]}>策略回測</Text>
          </Pressable>

          <Pressable style={styles.shortcutBtn} onPress={() => navigation.navigate('Portfolio')}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="briefcase" size={22} color="#8B5CF6" />
            </View>
            <Text style={[styles.shortcutText, { color: theme.colors.textSecondary }]}>資產管理</Text>
          </Pressable>
        </View>

        {/* 新聞列表 */}
        <View style={[styles.sectionHeader, { borderBottomColor: theme.colors.border, borderBottomWidth: 1, paddingBottom: 8 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>財經要聞</Text>
          <Pressable onPress={loadNews} style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Text style={{ color: theme.colors.textTertiary, fontSize: 12, marginRight: 4 }}>更新</Text>
             <Ionicons name="refresh" size={14} color={theme.colors.textTertiary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
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

// 字體優化
const getFontFamily = (weight = 'normal') => {
  if (Platform.OS === 'ios') return 'PingFang TC';
  return weight === 'bold' ? 'sans-serif-medium' : 'sans-serif';
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth, // 加入細分隔線增加層次
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 4 },
  pageTitle: { 
    fontSize: 22, // 稍微縮小標題，讓給日期
    fontWeight: '700', 
    fontFamily: getFontFamily('bold'),
    letterSpacing: 0.5,
  },
  marketStatus: { fontSize: 12, fontFamily: getFontFamily(), marginTop: 2 },
  searchButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  
  container: { flex: 1 },
  
  // ✨✨✨ [重點改造] 指數卡片樣式 ✨✨✨
  indicesContainer: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  indexCard: { 
    width: 160, // 稍微加寬
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    justifyContent: 'space-between'
  },
  indexCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  indexName: { fontSize: 14, fontWeight: '700', fontFamily: getFontFamily('bold') },
  indexSymbol: { fontSize: 11, fontFamily: getFontFamily(), marginTop: 2, opacity: 0.8 },
  
  indexCardMain: { marginVertical: 10 },
  indexValue: { 
    fontSize: 24, // ✨ 加大點數
    fontWeight: '800', 
    fontFamily: getFontFamily('bold'),
    fontVariant: ['tabular-nums'], 
    letterSpacing: 0.5 
  },
  
  indexCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  changeText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'], fontFamily: getFontFamily('bold') },
  percentText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'], fontFamily: getFontFamily('bold') },
  // ✨✨✨ 改造結束 ✨✨✨

  shortcutRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 16, marginTop: 8 },
  shortcutBtn: { alignItems: 'center', gap: 6 },
  iconCircle: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shortcutText: { fontSize: 11, fontWeight: '500', fontFamily: getFontFamily() },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: getFontFamily('bold') },
  
  loadingContainer: { padding: 20, alignItems: 'center' },
  
  newsList: { paddingHorizontal: 16 },
  newsItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  newsContent: { flex: 1, justifyContent: 'center' },
  newsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  newsSource: { fontSize: 12, fontWeight: '700', fontFamily: getFontFamily('bold') },
  newsTime: { fontSize: 11, fontFamily: getFontFamily() },
  newsTitle: { fontSize: 15, fontWeight: '500', lineHeight: 20, fontFamily: getFontFamily() },
  newsImage: { width: 70, height: 70, borderRadius: 6, backgroundColor: '#eee' },
  emptyText: { textAlign: 'center', marginTop: 20, fontFamily: getFontFamily() }
});