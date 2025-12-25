// src/screens/PortfolioScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import {
  loadPortfolio,
  getPortfolioSummary,
  addTransaction,
  deleteTransaction,
} from '../storage/portfolioStorage';

export default function PortfolioScreen({ navigation }) {
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      // 模擬當前價格（實際應從 API 獲取）
      const mockPrices = {
        '2330.TW': 580,
        '2317.TW': 105,
        'AAPL': 175,
        'MSFT': 380,
      };

      const data = await getPortfolioSummary(mockPrices);
      setPortfolio(data.holdings);
      setSummary(data.summary);
    } catch (error) {
      console.error('Load portfolio error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  const handleSubmitTransaction = async (data) => {
    try {
      await addTransaction(
        data.symbol,
        data.name,
        data.market,
        data.transaction
      );

      Alert.alert('成功', '交易記錄已新增');
      setShowAddModal(false);
      loadPortfolioData();
    } catch (error) {
      console.error('Add transaction error:', error);
      Alert.alert('錯誤', '新增交易失敗');
    }
  };

  const handleDeleteHolding = (holding) => {
    Alert.alert(
      '刪除持倉',
      `確定要刪除 ${holding.name} (${holding.symbol}) 的所有交易記錄嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 刪除該持倉的所有交易
              for (const transaction of holding.transactions) {
                await deleteTransaction(holding.symbol, transaction.id);
              }
              Alert.alert('成功', '已刪除持倉記錄');
              loadPortfolioData();
            } catch (error) {
              console.error('Delete holding error:', error);
              Alert.alert('錯誤', '刪除失敗');
            }
          },
        },
      ]
    );
  };

  const handleViewHistory = (holding) => {
    setSelectedHolding(holding);
    setShowHistoryModal(true);
  };

  const handleDeleteTransactionFromHistory = async (symbol, transactionId) => {
    try {
      await deleteTransaction(symbol, transactionId);
      loadPortfolioData();
      // 更新 selectedHolding
      const updatedPortfolio = await getPortfolioSummary({
        '2330.TW': 580,
        '2317.TW': 105,
        'AAPL': 175,
        'MSFT': 380,
      });
      const updatedHolding = updatedPortfolio.holdings.find(h => h.symbol === symbol);
      if (updatedHolding) {
        setSelectedHolding(updatedHolding);
      } else {
        // 如果沒有交易記錄了，關閉 modal
        setShowHistoryModal(false);
        setSelectedHolding(null);
      }
      Alert.alert('成功', '交易記錄已刪除');
    } catch (error) {
      console.error('Delete transaction error:', error);
      Alert.alert('錯誤', '刪除失敗');
    }
  };

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
        投資組合總覽
      </Text>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
          總市值
        </Text>
        <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
          ${summary?.totalValue.toFixed(2) || 0}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
          總成本
        </Text>
        <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
          ${summary?.totalCost.toFixed(2) || 0}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
          損益
        </Text>
        <Text
          style={[
            styles.summaryValue,
            styles.profitLoss,
            { color: summary?.totalProfitLoss >= 0 ? theme.colors.up : theme.colors.down },
          ]}
        >
          ${summary?.totalProfitLoss.toFixed(2) || 0} (
          {summary?.totalProfitLossPercent.toFixed(2) || 0}%)
        </Text>
      </View>
    </View>
  );

  const renderHoldingCard = (holding) => {
    const isProfit = holding.profitLoss >= 0;
    
    // 從 symbol 中提取純代號和市場
    // holding.symbol 可能是 "2330.TW" 或 "AAPL"
    let pureSymbol = holding.symbol;
    let detectedMarket = holding.market;
    
    // 如果 symbol 包含 .TW 或 .US 後綴，移除它
    if (holding.symbol.endsWith('.TW')) {
      pureSymbol = holding.symbol.replace('.TW', '');
      detectedMarket = 'TW';
    } else if (holding.symbol.endsWith('.US')) {
      pureSymbol = holding.symbol.replace('.US', '');
      detectedMarket = 'US';
    }
    
    return (
      <Pressable
        key={holding.id}
        style={[styles.holdingCard, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          navigation.navigate('Stocks', {
            screen: 'StockDetail',
            params: {
              symbol: pureSymbol,
              name: holding.name,
              market: detectedMarket,
              price: holding.currentPrice,
              change: holding.profitLoss,
              changePercent: holding.profitLossPercent,
            }
          });
        }}
      >
          <View style={styles.holdingHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.holdingSymbol, { color: theme.colors.text }]}>
              {holding.symbol}
            </Text>
            <Text style={[styles.holdingName, { color: theme.colors.textSecondary }]}>
              {holding.name}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.holdingPrice, { color: theme.colors.text }]}>
              ${holding.currentPrice.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.holdingDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              持有股數
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {holding.totalShares}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              平均成本
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              ${holding.averageCost.toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              損益
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isProfit ? theme.colors.up : theme.colors.down },
              ]}
            >
              ${holding.profitLoss.toFixed(2)} ({holding.profitLossPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
        
        {/* 查看交易記錄按鈕 */}
        <Pressable
          style={[styles.viewHistoryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => handleViewHistory(holding)}
        >
          <Ionicons name="list-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.viewHistoryText, { color: theme.colors.primary }]}>
            查看交易記錄 ({holding.transactions.length})
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {summary && renderSummaryCard()}
        
        <View style={styles.holdingsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            我的持倉
          </Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddTransaction}
          >
            <Text style={styles.addButtonText}>+ 新增交易</Text>
          </Pressable>
        </View>

        {portfolio.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              尚無持倉記錄
            </Text>
            <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
              點擊上方按鈕新增第一筆交易
            </Text>
          </View>
        ) : (
          portfolio.map(renderHoldingCard)
        )}
      </ScrollView>

      {/* 新增交易 Modal - 完整版，包含股票搜尋功能 */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitTransaction}
      />
      
      {/* 交易記錄 Modal */}
      <TransactionHistoryModal
        visible={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedHolding(null);
        }}
        holding={selectedHolding}
        onDeleteTransaction={handleDeleteTransactionFromHistory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  profitLoss: {
    fontWeight: '700',
  },
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  holdingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  holdingSymbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  holdingName: {
    fontSize: 13,
    marginTop: 2,
  },
  holdingPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  holdingDetails: {
    gap: 8,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  viewHistoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
});
