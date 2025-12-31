import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDrawer } from '../context/DrawerContext';

export default function BacktestScreen({ navigation }) {
  const { theme } = useTheme();
  const { openDrawer } = useDrawer();

  useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);
  
  // 參數
  const [symbol, setSymbol] = useState('2330');
  const [days, setDays] = useState('180'); 
  const [shortMA, setShortMA] = useState('5');
  const [longMA, setLongMA] = useState('20');
  const [takeProfit, setTakeProfit] = useState('10');
  const [stopLoss, setStopLoss] = useState('5');
  const [initialCapital, setInitialCapital] = useState('100000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runBacktest = () => {
    if (!symbol || !days) return;
    setLoading(true); setResult(null);
    setTimeout(() => {
      setLoading(false);
      const isProfit = parseInt(stopLoss) < parseInt(takeProfit);
      setResult({
        totalReturn: isProfit ? 21.5 : -8.4,
        netProfit: isProfit ? 21500 : -8400,
        winRate: isProfit ? 68.5 : 45.2,
        maxDrawdown: isProfit ? -4.2 : -12.8,
        trades: 16,
        sharpeRatio: isProfit ? 2.3 : 0.9,
        finalCapital: isProfit ? 121500 : 91600,
      });
    }, 1500);
  };

  const ResultCard = ({ icon, label, value, color, isPercent }) => (
    <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.cardHeader}>
         <MaterialCommunityIcons name={icon} size={16} color={theme.colors.textTertiary} />
         <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.resultValue, { color: color || theme.colors.text }]}>
        {value > 0 && isPercent ? '+' : ''}{value}{isPercent ? '%' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Header */}
          <View style={styles.headerContainer}>
             <View style={styles.headerLeftRow}>
                <Pressable onPress={openDrawer} style={styles.menuButton}>
                  <Ionicons name="menu" size={28} color={theme.colors.text} />
                </Pressable>
                <View style={{ marginLeft: 12 }}>
                   <Text style={[styles.pageTitle, { color: theme.colors.text }]}>策略回測</Text>
                   <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>均線策略引擎 v2.0</Text>
                </View>
             </View>
             <View style={[styles.proBadge, { backgroundColor: theme.colors.primary }]}>
               <Text style={styles.proText}>PRO</Text>
             </View>
          </View>

          {/* 設定面板 */}
          <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.panelHeader}>
               <MaterialCommunityIcons name="tune-vertical" size={18} color={theme.colors.primary} />
               <Text style={[styles.panelTitle, { color: theme.colors.text }]}>參數配置</Text>
            </View>
            
            <View style={styles.row}>
               <InputBox label="股票代號" value={symbol} onChange={setSymbol} theme={theme} width="48%" />
               <InputBox label="回測天數" value={days} onChange={setDays} theme={theme} width="48%" />
            </View>
            <View style={styles.row}>
               <InputBox label="短均線 MA" value={shortMA} onChange={setShortMA} theme={theme} width="48%" />
               <InputBox label="長均線 MA" value={longMA} onChange={setLongMA} theme={theme} width="48%" />
            </View>
            <View style={styles.row}>
               <InputBox label="停利 (%)" value={takeProfit} onChange={setTakeProfit} theme={theme} width="48%" color={theme.colors.up} />
               <InputBox label="停損 (%)" value={stopLoss} onChange={setStopLoss} theme={theme} width="48%" color={theme.colors.down} />
            </View>
             <InputBox label="初始資金 (TWD)" value={initialCapital} onChange={setInitialCapital} theme={theme} width="100%" />

            <Pressable 
              style={({pressed}) => [styles.runBtn, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.9 : 1 }]}
              onPress={runBacktest} disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                   <MaterialCommunityIcons name="play" size={20} color="#FFF" style={{ marginRight: 6 }} />
                   <Text style={styles.runBtnText}>執行回測</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* 結果面板 */}
          {result && !loading && (
            <View style={styles.resultSection}>
              <View style={[styles.bigSummary, { backgroundColor: result.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderColor: result.netProfit >= 0 ? theme.colors.up : theme.colors.down }]}>
                 <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>總淨利 (Net Profit)</Text>
                 <Text style={[styles.summaryBigVal, { color: result.netProfit >= 0 ? theme.colors.up : theme.colors.down }]}>
                   {result.netProfit > 0 ? '+' : ''}{result.netProfit.toLocaleString()}
                 </Text>
                 <Text style={[styles.summarySub, { color: theme.colors.textTertiary }]}>本金翻倍率: {((result.finalCapital/parseInt(initialCapital))*100).toFixed(1)}%</Text>
              </View>

              <View style={styles.grid}>
                 <ResultCard icon="chart-line" label="總報酬率" value={result.totalReturn} isPercent color={result.totalReturn >= 0 ? theme.colors.up : theme.colors.down} />
                 <ResultCard icon="trophy-outline" label="勝率" value={result.winRate} isPercent color={theme.colors.primary} />
                 <ResultCard icon="alert-circle-outline" label="最大回撤" value={result.maxDrawdown} isPercent color={theme.colors.down} />
                 <ResultCard icon="scale-balance" label="夏普比率" value={result.sharpeRatio} color={theme.colors.text} />
              </View>

              {/* ✨ 視覺化圖表模擬區 */}
              <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                 <Text style={[styles.chartTitle, { color: theme.colors.textSecondary }]}>資金曲線模擬 (Equity Curve)</Text>
                 <View style={styles.fakeChart}>
                    <MaterialCommunityIcons name="chart-areaspline" size={64} color={theme.colors.primary} style={{ opacity: 0.5 }} />
                 </View>
              </View>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputBox = ({ label, value, onChange, theme, width, color }) => (
  <View style={[styles.inputWrapper, { width }]}>
    <Text style={[styles.label, { color: color || theme.colors.textSecondary }]}>{label}</Text>
    <TextInput
      style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
      value={value} onChangeText={onChange} keyboardType="numeric"
    />
  </View>
);

const getFontFamily = (weight = 'normal') => Platform.OS === 'ios' ? 'PingFang TC' : (weight === 'bold' ? 'sans-serif-medium' : 'sans-serif');

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16 },
  headerContainer: { paddingVertical: 12, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.1)', marginBottom: 16 },
  headerLeftRow: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 4 },
  pageTitle: { fontSize: 22, fontWeight: '700', fontFamily: getFontFamily('bold') },
  statusText: { fontSize: 11, fontFamily: getFontFamily(), marginTop: 2 },
  proBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  proText: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  
  panel: { padding: 20, borderRadius: 12, borderWidth: 1 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  panelTitle: { fontSize: 16, fontWeight: '700', fontFamily: getFontFamily('bold') },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  inputWrapper: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', fontFamily: getFontFamily() },
  input: { height: 44, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, fontFamily: getFontFamily(), borderWidth: 1, fontVariant: ['tabular-nums'] },
  
  runBtn: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  runBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: getFontFamily('bold'), letterSpacing: 1 },

  resultSection: { marginTop: 24, gap: 12 },
  bigSummary: { padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  summaryLabel: { fontSize: 13, fontFamily: getFontFamily() },
  summaryBigVal: { fontSize: 32, fontWeight: '800', fontFamily: getFontFamily('bold'), marginVertical: 4, fontVariant: ['tabular-nums'] },
  summarySub: { fontSize: 12, fontFamily: getFontFamily() },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  resultCard: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  resultLabel: { fontSize: 12, fontFamily: getFontFamily() },
  resultValue: { fontSize: 18, fontWeight: '700', fontFamily: getFontFamily('bold'), fontVariant: ['tabular-nums'] },
  
  chartPlaceholder: { height: 120, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
  chartTitle: { fontSize: 12, position: 'absolute', top: 10, left: 16 },
  fakeChart: { alignItems: 'center', justifyContent: 'center' },
});