// src/components/stocks/USStocksSection.js
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
import { fetchUsStockQuotes } from '../../services/usStockApi';

// 這裡先挑幾檔常見美股，之後想再加自己改這個陣列就好
const US_CODES = ['AAPL', 'MSFT', 'TSLA', 'NVDA'];

export default function USStocksSection({ navigation, watchlist = [], onToggleWatchlist, refreshing, onRefresh }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUsStockQuotes(US_CODES);
        setStocks(data);
      } catch (e) {
        console.log('USStocksSection load error:', e);
        setError('美股資料載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadUs();
  }, []);

  const renderItem = ({ item }) => {
    const isUp = item.change >= 0;
    const isFavorite = watchlist.includes(item.symbol);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate('StockDetail', {
            symbol: item.symbol,
            name: item.name,
            market: 'US',
            price: item.price,
            change: item.change,
            changePercent:
              typeof item.changePercent === 'number'
                ? item.changePercent
                : 0,
          })
        }
      >
        <View style={styles.left}>
          <StockLogo symbol={item.symbol} name={item.name} market="US" />
          <View>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.right}>
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
          <Text style={styles.percent}>
            {item.changePercent > 0 ? '+' : ''}
            {item.changePercent.toFixed(2)}%
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#666' }}>美股資料載入中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#d32f2f' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  star: {
    fontSize: 20,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  starActive: {
    color: '#F59E0B',
  },
  price: { fontSize: 18, fontWeight: 'bold' },
  change: { fontSize: 14, marginTop: 4 },
  percent: { fontSize: 12, marginTop: 2, color: '#666' },
  up: { color: '#d32f2f' },
  down: { color: '#1976d2' },
});