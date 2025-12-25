// src/screens/BacktestScreen.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import SegmentedControl from '../components/backtest/SegmentedControl';
import BacktestResultSheet from '../components/backtest/BacktestResultSheet';

import { fetchDailyClosesByStooq } from '../services/backtestApi';
import { backtestBuyHold } from '../services/backtestEngine';
import companyData from '../data/companyData.json';

const MARKETS = [
  { key: 'TW', label: '台股' },
  { key: 'US', label: '美股' },
];

const RANGES = [
  { key: '3M', label: '3 個月' },
  { key: '6M', label: '6 個月' },
  { key: '1Y', label: '1 年' },
  { key: 'custom', label: '自訂' },
];

const STRATEGIES = [
  { key: 'buy_hold', label: '買進持有（真實）' },
  { key: 'ma_cross', label: '均線交叉 (MA20/MA60)（先示意）' },
  { key: 'rsi_reversal', label: 'RSI 反轉策略（先示意）' },
  { key: 'breakout', label: '區間突破 (20 日新高)（先示意）' },
  { key: 'bb_reversal', label: '布林通道反轉（先示意）' },
];

// ---- 小工具：日期 ----
function pad2(n) {
  return String(n).padStart(2, '0');
}
function toYMD(d) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}
function daysAgoDate(nDays) {
  const d = new Date();
  d.setDate(d.getDate() - nDays);
  return d;
}

function calcRangeDates(rangeKey, customStart, customEnd) {
  const end = new Date();
  if (rangeKey === 'custom') {
    return { startDate: customStart, endDate: customEnd };
  }

  // 用「日曆天」往回抓，避免遇到假日沒資料
  // 3M：抓 120 天、6M：抓 240 天、1Y：抓 480 天（保險）
  const map = {
    '3M': 120,
    '6M': 240,
    '1Y': 480,
  };
  const backDays = map[rangeKey] ?? 120;
  const start = daysAgoDate(backDays);

  return { startDate: toYMD(start), endDate: toYMD(end) };
}

// ---- 其他策略：暫時仍用示意結果（避免你一次做太多） ----
function runMockBacktest({ days, strategyKey }) {
  let price = 100;
  const prices = [price];

  let vol = 1.0;
  let baseWin = 55;
  let tradeBase = 8;

  switch (strategyKey) {
    case 'ma_cross':
      vol = 1.3;
      baseWin = 52;
      tradeBase = 15;
      break;
    case 'rsi_reversal':
      vol = 1.1;
      baseWin = 58;
      tradeBase = 10;
      break;
    case 'breakout':
      vol = 1.5;
      baseWin = 50;
      tradeBase = 18;
      break;
    case 'bb_reversal':
      vol = 0.9;
      baseWin = 57;
      tradeBase = 9;
      break;
    case 'buy_hold':
    default:
      vol = 0.8;
      baseWin = 60;
      tradeBase = 4;
      break;
  }

  const d = Math.max(20, days || 60);
  for (let i = 1; i < d; i += 1) {
    const noise = (Math.random() - 0.5) * 2;
    price = price * (1 + (noise * vol) / 100);
    prices.push(price);
  }

  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const totalReturn = (endPrice / startPrice - 1) * 100;

  const yearFactor = 240 / d;
  const annualReturn = ((endPrice / startPrice) ** yearFactor - 1) * 100;

  let peak = prices[0];
  let maxDrawdown = 0;
  prices.forEach((p) => {
    if (p > peak) peak = p;
    const dd = (p / peak - 1) * 100;
    if (dd < maxDrawdown) maxDrawdown = dd;
  });

  const trades = tradeBase + Math.floor(Math.random() * Math.max(3, tradeBase / 2));
  const winRate = baseWin + (Math.random() - 0.5) * 10;

  return { totalReturn, annualReturn, maxDrawdown, winRate, trades };
}

export default function BacktestScreen() {
  const [market, setMarket] = useState('TW');
  const [symbol, setSymbol] = useState('');
  const [rangeKey, setRangeKey] = useState('3M');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [strategyKey, setStrategyKey] = useState('buy_hold');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const runningRef = useRef(false);

  const fmt = (value, digits = 2) =>
    Number.isFinite(value) ? value.toFixed(digits) : '--';

  const selectedRangeLabel = RANGES.find((r) => r.key === rangeKey)?.label ?? '';
  const selectedStrategyLabel =
    STRATEGIES.find((s) => s.key === strategyKey)?.label ?? '';

  // 獲取公司名稱
  const getCompanyName = (sym) => {
    if (!sym) return '';
    const cleanSymbol = sym.trim();
    // companyData 是物件，直接用鍵查找
    const company = companyData[cleanSymbol];
    return company?.fullName || '';
  };

  const companyName = getCompanyName(symbol);

  const handleRun = async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    if (!symbol.trim()) {
      alert('請先輸入股票代號');
      runningRef.current = false;
      return;
    }

    if (rangeKey === 'custom') {
      if (!customStart || !customEnd) {
        alert('請輸入自訂的開始與結束日期（YYYY-MM-DD）');
        runningRef.current = false;
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const { startDate, endDate } = calcRangeDates(rangeKey, customStart, customEnd);

      if (strategyKey === 'buy_hold') {
        console.log('[Backtest] request', { symbol: symbol.trim(), startDate, endDate });

        const allRows = await fetchDailyClosesByStooq({
          market,
          symbol: symbol.trim(),
        });

        console.log('[Backtest] 日期範圍:', { startDate, endDate });
        console.log('[Backtest] 過濾前資料筆數:', allRows?.length);
        
        const rows = allRows
          .filter((r) => r.date >= startDate && r.date <= endDate)
          .sort((a, b) => a.date.localeCompare(b.date));

        console.log('[Backtest] 過濾後資料筆數:', rows?.length);
        if (rows.length > 0) {
          console.log('[Backtest] 過濾後第一筆:', rows[0]);
          console.log('[Backtest] 過濾後最後一筆:', rows[rows.length - 1]);
        }

        if (!rows || rows.length < 2) {
          setLoading(false);
          alert(`抓不到足夠的歷史資料\n\n總資料: ${allRows?.length || 0} 筆\n符合日期範圍: ${rows?.length || 0} 筆\n\n可能原因：\n1. 代號錯誤（台股請輸入數字，如：2330）\n2. 區間太短或太舊\n3. 此股票無資料`);
          runningRef.current = false;
          return;
        }

        const closes = rows.map((r) => r.close);
        const real = backtestBuyHold({ closes });

        setResult(real);
        setLoading(false);
        setShowModal(true);
        runningRef.current = false;
        return;
      }

      const mock = runMockBacktest({ days: 60, strategyKey });
      setResult(mock);
      setLoading(false);
      setShowModal(true);
      runningRef.current = false;
    } catch (e) {
      console.log('backtest error:', e);
      setLoading(false);
      alert('回測失敗，請稍後再試或檢查網路連線\n\n錯誤訊息: ' + (e.message || '未知錯誤'));
      runningRef.current = false;
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          使用 Yahoo Finance 提供台股與美股的真實歷史資料進行「買進持有」回測。
        </Text>

        <Text style={styles.label}>市場</Text>
        <SegmentedControl options={MARKETS} value={market} onChange={setMarket} />

        <Text style={styles.label}>股票代號</Text>
        <TextInput
          style={styles.input}
          placeholder={market === 'TW' ? '例如：2330, 0050' : '例如：AAPL, TSLA'}
          value={symbol}
          onChangeText={setSymbol}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>回測區間</Text>
        <SegmentedControl options={RANGES} value={rangeKey} onChange={setRangeKey} />

        {rangeKey === 'custom' && (
          <View style={styles.customRangeBox}>
            <Text style={styles.customHint}>請輸入自訂回測日期（格式：YYYY-MM-DD）</Text>

            <Text style={styles.smallLabel}>開始日期</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：2024-01-01"
              value={customStart}
              onChangeText={setCustomStart}
            />

            <Text style={styles.smallLabel}>結束日期</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：2024-06-30"
              value={customEnd}
              onChangeText={setCustomEnd}
            />
          </View>
        )}

        <Text style={styles.label}>策略</Text>
        <SegmentedControl
          options={STRATEGIES}
          value={strategyKey}
          onChange={setStrategyKey}
          scrollable
        />

        <Pressable
          style={[styles.runButton, loading && styles.runButtonDisabled]}
          onPress={handleRun}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.runButtonText}>開始回測</Text>
          )}
        </Pressable>
      </ScrollView>

      {result && (
        <BacktestResultSheet
          visible={showModal}
          onClose={() => setShowModal(false)}
          result={result}
          market={market}
          symbol={symbol}
          companyName={companyName}
          rangeLabel={selectedRangeLabel}
          strategyLabel={selectedStrategyLabel}
          fmt={fmt}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#374151',
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 4,
    color: '#4b5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  runButton: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  runButtonDisabled: {
    opacity: 0.7,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  customRangeBox: {
    marginTop: 8,
    marginBottom: 4,
  },
  customHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});