// src/components/stocks/TaiwanStocksSection.js
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
import { fetchTaiwanStocks } from '../../services/stockApi';
import { useTheme } from '../../context/ThemeContext';

// 台股預設清單（API 掛掉時用）
const TAIWAN_STOCKS_DEFAULT = [
  { symbol: '0050', name: '元大台灣50', price: 150, change: -0.8 },
  { symbol: '2330', name: '台積電', price: 850, change: +5.5 },
  { symbol: '2317', name: '鴻海', price: 160.5, change: +0.3 },
  { symbol: '2412', name: '中華電', price: 120.2, change: -0.4 },
];

const TAIWAN_CODES = TAIWAN_STOCKS_DEFAULT.map((s) => s.symbol);

export default function TaiwanStocksSection({
  navigation,
  watchlist = [],
  onToggleWatchlist,
  refreshing,
  onRefresh,
}) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 進來就抓一次台股
  useEffect(() => {
    const loadTw = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTaiwanStocks(TAIWAN_CODES);
        if (data && data.length > 0) {
          setStocks(data);
        }
      } catch (err) {
        console.warn('fetchTaiwanStocks error', err);
        setError('台股資料載入失敗，顯示預設資料');
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

    return (
      <Pressable
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
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
        <View style={styles.left}>
          <StockLogo symbol={item.symbol} name={item.name} market="TW" />
          <View style={styles.stockInfo}>
            <View style={styles.symbolRow}>
              <Text style={[styles.symbol, { color: theme.colors.text }]}>{item.symbol}</Text>
              <Pressable
                hitSlop={8}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist && onToggleWatchlist(item.symbol);
                }}
              >
                <Text style={[styles.star, isFavorite && styles.starActive]}>
                  {isFavorite ? '★' : '☆'}
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.name, { color: theme.colors.textSecondary }]}>{item.name}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.price, { color: theme.colors.text }]}>
            {typeof item.price === 'number'
              ? item.price.toFixed(2)
              : item.price}
          </Text>
          <View style={[
            styles.changeContainer,
            { backgroundColor: isUp ? theme.colors.upBackground : theme.colors.downBackground }
          ]}>
            <Text style={[styles.change, { color: isUp ? theme.colors.up : theme.colors.down }]}>
              {isUp ? '+' : ''}
              {typeof item.change === 'number'
                ? item.change.toFixed(2)
                : item.change}
            </Text>
            <Text style={[styles.changePercent, { color: isUp ? theme.colors.up : theme.colors.down }]}>
              {isUp ? '+' : ''}{changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>  台股資料讀取中...</Text>
        </View>
      )}
      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.symbol + index}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
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
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  left: {
    flex: 1,
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
  
  stockInfo: {
    flex: 1,
  },
  
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  symbol: { 
    fontSize: 18, 
    fontWeight: '700',
    marginRight: 8,
  },
  
  name: { 
    fontSize: 14,
    marginTop: 2,
  },

  star: {
    fontSize: 18,
    color: '#6B7280',
  },
  starActive: {
    color: '#F59E0B',
  },

  right: {
    alignItems: 'flex-end',
  },

  price: { 
    fontSize: 20, 
    fontWeight: '700',
    marginBottom: 6,
  },
  
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  
  change: { 
    fontSize: 13,
    fontWeight: '600',
  },
  
  changePercent: {
    fontSize: 13,
    fontWeight: '600',
  },
});