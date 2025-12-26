import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { fetchTaiwanStocks } from '../../services/stockApi';
import { useTheme } from '../../context/ThemeContext';

const TAIWAN_STOCKS_DEFAULT = [
  { symbol: '0050', name: '元大台灣50', price: 150, change: -0.8, changePercent: -0.53 },
  { symbol: '2330', name: '台積電', price: 850, change: +5.5, changePercent: +0.65 },
  { symbol: '2317', name: '鴻海', price: 160.5, change: +0.3, changePercent: +0.19 },
  { symbol: '2412', name: '中華電', price: 120.2, change: -0.4, changePercent: -0.33 },
];

const TAIWAN_CODES = TAIWAN_STOCKS_DEFAULT.map((s) => s.symbol);

export default function TaiwanStocksSection({ navigation, watchlist = [], onToggleWatchlist }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTw = async () => {
      try {
        setLoading(true);
        const data = await fetchTaiwanStocks(TAIWAN_CODES);
        if (data && data.length > 0) setStocks(data);
      } catch (err) {
        console.warn('fetchTaiwanStocks error', err);
      } finally {
        setLoading(false);
      }
    };
    loadTw();
  }, []);

  const data = stocks.length > 0 ? stocks : TAIWAN_STOCKS_DEFAULT;

  const renderItem = ({ item }) => {
    const isUp = item.change >= 0;
    const isFavorite = watchlist.includes(item.symbol);
    const changePercent = typeof item.changePercent === 'number' ? item.changePercent : 0;
    const color = isUp ? theme.colors.up : theme.colors.down;
    const bgColor = isUp ? theme.colors.up : theme.colors.down;

    return (
      <Pressable
        style={[styles.itemContainer, { borderBottomColor: theme.colors.border }]}
        onPress={() =>
          navigation.navigate('StockDetail', {
            symbol: item.symbol,
            name: item.name,
            market: 'TW',
            price: item.price,
            change: item.change,
            changePercent: changePercent,
          })
        }
      >
        <View style={styles.leftCol}>
          <View style={styles.symbolRow}>
            <Text style={[styles.symbol, { color: theme.colors.text }]}>{item.symbol}</Text>
            <Pressable
              hitSlop={10}
              onPress={(e) => {
                e.stopPropagation();
                onToggleWatchlist && onToggleWatchlist(item.symbol);
              }}
            >
              <Text style={[styles.star, isFavorite ? styles.starActive : { color: theme.colors.textTertiary }]}>
                {isFavorite ? '★' : '☆'}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.name, { color: theme.colors.textSecondary }]}>{item.name}</Text>
        </View>

        <View style={styles.rightCol}>
          <Text style={[styles.price, { color: color }]}>
            {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </Text>
          <View style={[styles.changeBadge, { backgroundColor: bgColor }]}>
            <Text style={styles.changeText}>
              {isUp ? '+' : ''}{changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.symbol + index}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingRow: { padding: 8, alignItems: 'center' },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  leftCol: { flex: 1 },
  symbolRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  symbol: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], marginRight: 8 },
  name: { fontSize: 13 },
  star: { fontSize: 18 },
  starActive: { color: '#F59E0B' },
  rightCol: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 4 },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
});