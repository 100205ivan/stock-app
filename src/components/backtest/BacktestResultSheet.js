// src/components/backtest/BacktestResultSheet.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

/**
 * 回測結果底部彈出小卡片
 * props:
 * - visible: 是否顯示
 * - onClose: () => void
 * - result: { totalReturn, annualReturn, maxDrawdown, winRate, trades }
 * - market: 'TW' | 'US'
 * - symbol: string
 * - rangeLabel: string
 * - strategyLabel: string
 * - fmt: (number, digits?) => string
 */
export default function BacktestResultSheet({
  visible,
  onClose,
  result,
  market,
  symbol,
  companyName,
  rangeLabel,
  strategyLabel,
  fmt,
}) {
  if (!visible || !result) return null;

  const marketLabel = market === 'TW' ? '台股' : '美股';

  return (
    <View style={styles.modalOverlay}>
      <Pressable style={styles.modalBackground} onPress={onClose} />

      <View style={styles.bottomSheet}>
        <View style={styles.dragBar} />

        <Text style={styles.sheetTitle}>回測結果</Text>
        <Text style={styles.sheetSubtitle}>
          {marketLabel} · {companyName ? `${companyName} ` : ''}{symbol?.toUpperCase()} · {rangeLabel} · {strategyLabel}
        </Text>

        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>總報酬率</Text>
          <Text
            style={[
              styles.sheetValue,
              result.totalReturn >= 0 ? styles.up : styles.down,
            ]}
          >
            {fmt(result.totalReturn)}%
          </Text>
        </View>

        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>年化報酬率</Text>
          <Text
            style={[
              styles.sheetValue,
              result.annualReturn >= 0 ? styles.up : styles.down,
            ]}
          >
            {fmt(result.annualReturn)}%
          </Text>
        </View>

        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>最大回撤</Text>
          <Text style={styles.sheetValue}>
            {fmt(result.maxDrawdown)}%
          </Text>
        </View>

        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>勝率</Text>
          <Text style={styles.sheetValue}>{fmt(result.winRate)}%</Text>
        </View>

        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>交易次數</Text>
          <Text style={styles.sheetValue}>{result.trades}</Text>
        </View>

        <Text style={styles.note}>
          ※ 本結果目前為示意用隨機模擬，不代表真實交易績效。
          未來可替換為真實歷史資料回測。
        </Text>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>關閉</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBackground: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetLabel: {
    fontSize: 14,
    color: '#444',
  },
  sheetValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  up: { color: '#dc2626' },
  down: { color: '#2563eb' },
  note: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 10,
    marginBottom: 10,
    lineHeight: 16,
  },
  closeButton: {
    marginTop: 4,
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});