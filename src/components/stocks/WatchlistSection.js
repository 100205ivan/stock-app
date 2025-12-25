// src/components/stocks/WatchlistSection.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import StockLogo from '../StockLogo';
import { useTheme } from '../../context/ThemeContext';
import { fetchTaiwanStocks } from '../../services/stockApi';
import { fetchUsStockQuotes } from '../../services/usStockApi';

export default function WatchlistSection({ navigation, watchlist = [], refreshing, onRefresh }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 每次 watchlist 變動，就重新抓一次台股報價
  useEffect(() => {
    const load = async () => {
      if (!watchlist || watchlist.length === 0) {
        setStocks([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 將自選股代碼分成台股（純數字）與美股（含英文字母）
        const twCodes = watchlist.filter((code) => /^\d+$/.test(code));
        const usCodes = watchlist.filter((code) => !/^\d+$/.test(code));

        const [twData, usData] = await Promise.all([
          twCodes.length ? fetchTaiwanStocks(twCodes) : Promise.resolve([]),
          usCodes.length ? fetchUsStockQuotes(usCodes) : Promise.resolve([]),
        ]);

        const merged = [
          ...(twData || []),
          ...(usData || []),
        ];

        setStocks(merged);
      } catch (e) {
        console.warn('[watchlist] fetch error:', e);
        setError('自選股資料載入失敗');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [watchlist]);

  const renderItem = ({ item }) => {
    const isUp = item.change >= 0;
    const isTw = /^\d+$/.test(item.symbol);

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          navigation.navigate('StockDetail', {
            symbol: item.symbol,
            name: item.name,
            market: isTw ? 'TW' : 'US',
            price: item.price,
            change: item.change,
            changePercent:
              typeof item.changePercent === 'number'
                ? item.changePercent
                : 0,
          });
        }}
      >
        <View style={styles.left}>
          <StockLogo symbol={item.symbol} name={item.name} market={isTw ? 'TW' : 'US'} />
          <View>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>
            {typeof item.price === 'number'
              ? item.price.toFixed(2)
              : item.price}
          </Text>
          <Text style={[styles.change, isUp ? styles.up : styles.down]}>
            {isUp ? '+' : ''}
            {typeof item.change === 'number'
              ? item.change.toFixed(2)
              : item.change}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>目前沒有自選股</Text>
        <Text style={styles.emptyText}>
          可以在「熱門」或「台股」頁面點選右側的「☆」來加入自選股。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>  自選股資料載入中...</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={stocks}
        keyExtractor={(item, index) => item.symbol + index}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    marginBottom: 4,
    paddingHorizontal: 2,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  symbol: { fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 14, color: '#666' },
  right: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: 'bold' },
  change: { fontSize: 14, marginTop: 4 },
  up: { color: '#d32f2f' },
  down: { color: '#1976d2' },
});