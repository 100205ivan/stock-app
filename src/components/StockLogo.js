// src/components/StockLogo.js
import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// 為常見台股定義顏色方案
const STOCK_COLORS = {
  '0050': '#0052CC',  // 元大台灣50 - 藍色
  '0056': '#0052CC',  // 元大高股息 - 藍色
  '2330': '#8B4513',  // 台積電 - 棕色
  '2317': '#DC143C',  // 鴻海 - 紅色
  '2882': '#C41E3A',  // 中信金 - 紅色
  '2891': '#006633',  // 中信金控 - 綠色
  '2884': '#0066CC',  // 玉山金 - 藍色
  '2886': '#FF6600',  // 兆豐金 - 橙色
  '2892': '#1E90FF',  // 第一金 - 藍色
  '2881': '#228B22',  // 富邦金 - 綠色
  '2880': '#4169E1',  // 華南金 - 藍色
  '2883': '#8B0000',  // 開發金 - 深紅
  '2885': '#006400',  // 元大金 - 深綠
  '2887': '#191970',  // 台新金 - 深藍
  '2890': '#8B4513',  // 永豐金 - 棕色
  '2382': '#FF4500',  // 廣達 - 橙紅
  '2454': '#4B0082',  // 聯發科 - 靛藍
  '1301': '#2F4F4F',  // 台塑 - 深灰綠
  '1303': '#556B2F',  // 南亞 - 橄欖綠
  '1326': '#8B4513',  // 台化 - 棕色
  '2881': '#228B22',  // 富邦金 - 綠色
  '2882': '#DC143C',  // 國泰金 - 紅色
  '2412': '#1E90FF',  // 中華電 - 藍色
  '2303': '#FF8C00',  // 聯電 - 橙色
  '2308': '#4682B4',  // 台達電 - 鋼藍
  '2603': '#8B0000',  // 長榮 - 深紅
  '2609': '#DC143C',  // 陽明 - 紅色
  '2615': '#006400',  // 萬海 - 深綠
};

// 獲取股票名稱的縮寫（前2個字或1個字）
const getStockAbbr = (name) => {
  if (!name) return '?';
  // 如果名稱包含常見後綴，去掉它們
  const cleanName = name.replace(/(控股|金控|科技|電子|工業|國際|企業|公司)/g, '');
  // 取前2個字，如果只有1個字就取1個
  return cleanName.substring(0, 2) || name.substring(0, 1);
};

export default function StockLogo({ symbol, name, market = 'TW', size = 40 }) {
  const [imageError, setImageError] = useState(false);
  
  const logoUri = market === 'TW' 
    ? `https://financialmodelingprep.com/image-stock/${symbol}.TW.png`
    : `https://financialmodelingprep.com/image-stock/${symbol}.png`;

  const backgroundColor = STOCK_COLORS[symbol] || '#6B7280';
  const abbr = getStockAbbr(name);

  if (imageError) {
    // 顯示文字縮寫
    return (
      <View style={[styles.fallbackContainer, { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor 
      }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
          {abbr}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logoUri }}
      style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}
      onError={() => setImageError(true)}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: '#f0f0f0',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
