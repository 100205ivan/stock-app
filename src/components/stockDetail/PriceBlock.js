import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

function toNumber(value) {
  if (value === undefined || value === null) return NaN;
  const n = Number(value);
  return Number.isNaN(n) ? NaN : n;
}

export default function PriceBlock({ price, change, changePercent }) {
  const { theme } = useTheme();
  const numericPrice = toNumber(price);
  const numericChange = toNumber(change);
  const numericChangePercent = toNumber(changePercent);
  const hasPrice = !Number.isNaN(numericPrice);
  const hasChange = !Number.isNaN(numericChange);
  const hasChangePercent = !Number.isNaN(numericChangePercent);
  const isUp = numericChange >= 0;
  const color = isUp ? theme.colors.up : theme.colors.down;

  return (
    <View style={styles.container}>
      <Text style={[styles.priceValue, { color: hasPrice ? color : theme.colors.text }]}>
        {hasPrice ? numericPrice.toFixed(2) : '--.--'}
      </Text>
      <View style={styles.changeRow}>
        {hasChange && hasChangePercent ? (
          <>
            <Text style={[styles.changeValue, { color }]}>
              {numericChange > 0 ? '▲' : numericChange < 0 ? '▼' : ''} {Math.abs(numericChange).toFixed(2)}
            </Text>
            <View style={[styles.percentBadge, { backgroundColor: isUp ? theme.colors.upBackground : theme.colors.downBackground }]}>
              <Text style={[styles.percentText, { color }]}>
                {numericChangePercent >= 0 ? '+' : ''}{numericChangePercent.toFixed(2)}%
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.neutralText, { color: theme.colors.textSecondary }]}>
            無即時資料
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
  priceValue: { fontSize: 40, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 },
  changeValue: { fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  percentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  percentText: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  neutralText: { fontSize: 16 },
});