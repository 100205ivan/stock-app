// src/components/stocks/HotStocksSection.js
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
import { useTheme } from '../../context/ThemeContext';
import { fetchTwHotRanksTop15 } from '../../services/stockRankingApi';
import StockLogo from '../StockLogo';

export default function HotStocksSection({ navigation, watchlist = [], onToggleWatchlist, refreshing, onRefresh }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHotUs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTwHotRanksTop15();
        setStocks(data);
      } catch (e) {
        console.log('HotStocksSection load error:', e);
        setError('熱門台股資料載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadHotUs();
  }, []);

  const renderItem = ({ item, index }) => {
    const isUp = item.change >= 0;
    const rank = index + 1;
    const changePercent = typeof item.changePercent === 'number' ? item.changePercent : 0;
    const isFavorite = watchlist.includes(item.symbol);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate('StockDetail', {
            symbol: item.symbol,
            name: item.name,
            market: 'TW',
            price: item.price,
            change: item.change,
            changePercent:
              typeof item.changePercent === 'number'
                ? item.changePercent
                : 0,
          })
        }
      >
        {/* 左側：排行 + 股票資訊 */}
        <View style={styles.left}>
          <StockLogo symbol={item.symbol} name={item.name} market="TW" />
          <View>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        </View>

        {/* 右側：自選星星 + 價格 + 漲跌 + 漲跌幅 */}
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
            {changePercent > 0 ? '+' : ''}
            {changePercent.toFixed(2)}%
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#666' }}>熱門台股載入中...</Text>
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

  if (!stocks || stocks.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#666' }}>目前沒有熱門台股資料。</Text>
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
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  symbol: { fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 14, color: '#666' },

  right: {
    alignItems: 'flex-end',
  },
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