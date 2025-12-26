import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Animated } from 'react-native';
import { fetchTaiwanStocks } from '../../services/stockApi';
import { fetchUsStockQuotes } from '../../services/usStockApi';
import { useTheme } from '../../context/ThemeContext';

export default function WatchlistSection({ navigation, watchlist = [] }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const load = async () => {
      if (!watchlist || watchlist.length === 0) { setStocks([]); return; }
      try {
        setLoading(true);
        fadeAnim.setValue(0);
        translateY.setValue(20);

        const twCodes = watchlist.filter((code) => /^\d+$/.test(code));
        const usCodes = watchlist.filter((code) => !/^\d+$/.test(code));

        const [twData, usData] = await Promise.all([
          twCodes.length ? fetchTaiwanStocks(twCodes) : Promise.resolve([]),
          usCodes.length ? fetchUsStockQuotes(usCodes) : Promise.resolve([]),
        ]);
        setStocks([...(twData || []), ...(usData || [])]);
        
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true })
        ]).start();

      } catch (e) {
        console.warn('[watchlist] fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [watchlist]);

  const renderItem = ({ item }) => {
    const isUp = item.change >= 0;
    const isTw = /^\d+$/.test(item.symbol);
    const color = isUp ? theme.colors.up : theme.colors.down;
    const bgColor = isUp ? theme.colors.up : theme.colors.down;

    return (
      <Pressable
        style={[styles.itemContainer, { borderBottomColor: theme.colors.border }]}
        onPress={() => {
          navigation.navigate('StockDetail', {
            symbol: item.symbol, name: item.name, market: isTw ? 'TW' : 'US',
            price: item.price, change: item.change, changePercent: typeof item.changePercent === 'number' ? item.changePercent : 0,
          });
        }}
      >
        <View style={styles.leftCol}>
          <Text style={[styles.symbol, { color: theme.colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.name, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.price, { color: color }]}>{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</Text>
          <View style={[styles.changeBadge, { backgroundColor: bgColor }]}>
            <Text style={styles.changeText}>{isUp ? '+' : ''}{typeof item.changePercent === 'number' ? item.changePercent.toFixed(2) : '0.00'}%</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>尚未加入自選股</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && <View style={styles.loadingRow}><ActivityIndicator size="small" color={theme.colors.primary} /></View>}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY }] }}>
        <FlatList data={stocks} keyExtractor={(item) => item.symbol} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingRow: { padding: 8, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1 },
  leftCol: { flex: 1, justifyContent: 'center' },
  rightCol: { alignItems: 'flex-end' },
  symbol: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 2 },
  name: { fontSize: 13 },
  price: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 4 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, minWidth: 72, alignItems: 'center', justifyContent: 'center' },
  changeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
});