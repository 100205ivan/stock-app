import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchTaiwanFundamentals, fetchUsFundamentals } from '../services/fundamentalApi';

const DEFAULT_TW_STOCKS = ['2330', '2317', '2454', '2412', '0050', '2882', '2603', '2609', '2615', '1301', '1303', '2308', '2382', '2891', '2884'];
const DEFAULT_US_STOCKS = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN'];

export default function StockScreenerScreen({ navigation }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [twData, usData] = await Promise.all([
          fetchTaiwanFundamentals(DEFAULT_TW_STOCKS),
          fetchUsFundamentals(DEFAULT_US_STOCKS),
        ]);
        setStocks([...twData, ...usData]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderItem = ({ item }) => {
    const isUp = item.changePercent >= 0;
    const color = isUp ? theme.colors.up : theme.colors.down;
    const badgeColor = isUp ? theme.colors.up : theme.colors.down;

    return (
      <Pressable
        style={[styles.itemContainer, { borderBottomColor: theme.colors.border }]}
        onPress={() => {
          navigation.navigate('StockDetail', {
            symbol: item.symbol, name: item.name, market: /^\d/.test(item.symbol) ? 'TW' : 'US',
            price: item.price, changePercent: item.changePercent
          });
        }}
      >
        <View style={styles.leftCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.symbol, { color: theme.colors.text }]}>{item.symbol}</Text>
            <Text style={[styles.name, { color: theme.colors.textSecondary }]}>{item.name}</Text>
          </View>
          <View style={styles.fundamentalsRow}>
            <Text style={[styles.fundText, { color: theme.colors.textTertiary }]}>
              EPS {item.eps}  |  PE {item.pe}  |  殖利率 {(item.dividendYield * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.price, { color: color }]}>{item.price.toFixed(2)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.changeText}>{isUp ? '+' : ''}{item.changePercent.toFixed(2)}%</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList data={stocks} keyExtractor={(item) => item.symbol} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  leftCol: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  symbol: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  name: { fontSize: 14 },
  fundamentalsRow: { flexDirection: 'row' },
  fundText: { fontSize: 12, fontVariant: ['tabular-nums'] },
  rightCol: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], marginBottom: 4 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, minWidth: 70, alignItems: 'center', justifyContent: 'center' },
  changeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
});