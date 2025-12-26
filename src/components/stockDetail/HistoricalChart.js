import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { fetchDailyClosesByStooq } from '../../services/backtestApi';
import { useTheme } from '../../context/ThemeContext';

const TIMEFRAMES = [
  { key: '1W', label: '1週', days: 7 },
  { key: '1M', label: '1月', days: 30 },
  { key: '3M', label: '3月', days: 90 },
  { key: '6M', label: '6月', days: 180 },
  { key: '1Y', label: '1年', days: 365 },
  { key: 'YTD', label: '今年', days: null },
];

function SimpleLineChart({ data, width, height, isPositive, theme }) {
  if (!data || data.length === 0) return null;
  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const rangeY = maxY - minY || 1;
  const chartWidth = width - 40;
  const chartHeight = height - 40;
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth + 20;
    const y = chartHeight - ((point.y - minY) / rangeY) * chartHeight + 20;
    return { x, y };
  });
  const lineColor = isPositive ? theme.colors.up : theme.colors.down;

  return (
    <View style={[styles.chartContainer, { width, height, backgroundColor: 'transparent' }]}>
      <View style={styles.gridLines}>
        {[0, 1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[styles.gridLine, { top: (i * chartHeight) / 4 + 20, borderColor: theme.colors.chartGrid }]}
          />
        ))}
      </View>
      {points.map((point, index) => {
        if (index === points.length - 1) return null;
        const nextPoint = points[index + 1];
        const lineLength = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
        return (
          <View
            key={index}
            style={[
              styles.lineSegment,
              {
                position: 'absolute',
                left: point.x,
                top: point.y,
                width: lineLength,
                backgroundColor: lineColor,
                transform: [{ rotate: `${angle}deg` }],
              }
            ]}
          />
        );
      })}
    </View>
  );
}

export default function HistoricalChart({ symbol, market }) {
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (symbol && market) fetchHistoricalData();
  }, [symbol, market, selectedTimeframe]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const allData = await fetchDailyClosesByStooq({ market, symbol });
      if (!allData || allData.length === 0) {
        setChartData([]); setStats(null); setLoading(false); return;
      }
      const timeframe = TIMEFRAMES.find(t => t.key === selectedTimeframe);
      let filteredData = [...allData];
      const today = new Date();
      let startDate = null;
      if (timeframe.key === 'YTD') startDate = `${today.getFullYear()}-01-01`;
      else if (timeframe.days) {
        const start = new Date(today);
        start.setDate(start.getDate() - timeframe.days);
        startDate = start.toISOString().split('T')[0];
      }
      if (startDate) filteredData = allData.filter(d => d.date >= startDate);
      const sorted = filteredData.sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length === 0) { setChartData([]); setStats(null); setLoading(false); return; }

      const formatted = sorted.map((item, index) => ({ x: index, y: item.close, date: item.date }));
      setChartData(formatted);
      const firstPrice = sorted[0].close;
      const lastPrice = sorted[sorted.length - 1].close;
      const change = lastPrice - firstPrice;
      const changePercent = (change / firstPrice) * 100;
      const prices = sorted.map(d => d.close);
      const high = Math.max(...prices);
      const low = Math.min(...prices);
      setStats({ change, changePercent, high, low });
      setLoading(false);
    } catch (error) {
      console.log('Failed to fetch historical data:', error);
      setChartData([]); setStats(null); setLoading(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const chartHeight = 220;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>走勢圖</Text>
        {stats && (
          <Text style={[styles.headerStat, { color: stats.change >= 0 ? theme.colors.up : theme.colors.down }]}>
            {stats.change >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
          </Text>
        )}
      </View>
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map(tf => (
          <Pressable
            key={tf.key}
            style={[styles.timeframeButton, selectedTimeframe === tf.key && { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => setSelectedTimeframe(tf.key)}
          >
            <Text style={[styles.timeframeText, { color: selectedTimeframe === tf.key ? theme.colors.primary : theme.colors.textSecondary }, selectedTimeframe === tf.key && { fontWeight: '700' }]}>
              {tf.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <View style={[styles.loadingContainer, { height: chartHeight }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : chartData.length > 0 ? (
        <>
          <SimpleLineChart data={chartData} width={chartWidth} height={chartHeight} isPositive={stats && stats.change >= 0} theme={theme} />
          <View style={styles.statsRow}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>最高: <Text style={{color: theme.colors.text}}>{stats.high.toFixed(2)}</Text></Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>最低: <Text style={{color: theme.colors.text}}>{stats.low.toFixed(2)}</Text></Text>
          </View>
        </>
      ) : (
        <View style={[styles.noDataContainer, { height: chartHeight }]}>
          <Text style={[styles.noDataText, { color: theme.colors.textTertiary }]}>無歷史資料</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, padding: 16, marginVertical: 12, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  headerStat: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timeframeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  timeframeButton: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  timeframeText: { fontSize: 13 },
  chartContainer: { position: 'relative', overflow: 'hidden', marginBottom: 8 },
  gridLines: { position: 'absolute', width: '100%', height: '100%' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 0, borderTopWidth: 1, borderStyle: 'dashed' },
  lineSegment: { height: 2, transformOrigin: 'left center', borderRadius: 1 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  noDataContainer: { alignItems: 'center', justifyContent: 'center' },
  noDataText: { fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  statLabel: { fontSize: 12, fontVariant: ['tabular-nums'] }
});