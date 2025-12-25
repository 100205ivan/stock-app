# 📈 台美股追蹤 App

> 一款功能完整的股票追蹤應用程式，支援台股、美股即時資訊查詢、自選股管理、投資組合分析與回測功能

## ✨ 核心功能

### 📊 多市場股票追蹤
- **台股市場**
  - 即時股價資訊
  - 熱門股票排行（成交量前10名）
  - 歷史價格走勢圖（1週/1個月/3個月/6個月/1年/本年迄今）
  - 區間漲跌統計（漲跌幅、最高價、最低價）
  - **公司 Logo 顯示**
    - API 自動載入公司圖標
    - 無 Logo 自動顯示彩色縮寫
    - 30+ 常見台股專屬色彩配置
  
- **美股市場**
  - 美國主要股票查詢
  - 即時報價與漲跌幅
  - 歷史價格走勢圖
  - 市值、本益比等基本資訊
  - **公司 Logo 顯示**
  
### ⭐ 自選股管理
- 快速加入/移除自選股
- 自選股列表一鍵查看
- 支援台股與美股混合追蹤
- 本地儲存，不需登入

### 💼 投資組合管理
- **交易記錄系統**
  - 記錄買入/賣出交易
  - 支援多次交易累計
  - 交易歷史紀錄查詢
  
- **智能計算**
  - 平均成本自動計算
  - 即時損益分析（金額 & 百分比）
  - 持有股數統計
  - 總市值追蹤
  
- **投資組合總覽**
  - 總資產統計
  - 總損益匯總
  - 各股持倉佔比
  - 視覺化呈現

### 🔍 智能搜尋
- 輸入股票代碼或公司名稱即時搜尋
- 支援台股、美股混合搜尋
- 搜尋結果快速預覽
- 一鍵導航至股票詳情
- **搜尋歷史記錄**
  - 自動記錄最近 10 次搜尋
  - 點擊快速重新查詢
  - 一鍵清除全部歷史
  - 單獨刪除歷史項目

### 📰 財經新聞整合
- 首頁顯示最新財經新聞
- 台股市場相關資訊
- 新聞標題、來源、時間顯示
- 點擊閱讀完整內容

### 🔔 價格提醒
- 自訂目標價格提醒
- 支援「突破」與「跌破」條件
- 多股票、多價位提醒設定
- 提醒開關管理
- 本地儲存提醒設定

### 🧪 策略回測系統
- **買進持有策略（真實回測）**
  - 使用 Yahoo Finance 真實歷史資料
  - 支援台股與美股
  - 多種時間範圍（3個月/6個月/1年/自訂）
  
- **回測分析指標**
  - 總報酬率計算
  - 年化報酬率
  - 最大回撤分析
  - 勝率統計
  - 交易次數

- **其他策略（示意功能，待開發）**
  - 均線交叉策略
  - RSI 反轉策略
  - 區間突破策略
  - 布林通道策略

### 🌓 深色模式
- 淺色/深色主題切換
- 自動跟隨系統設定
- 全局主題管理（Context API）
- 護眼深色設計
- 台灣習慣配色（漲紅跌綠）

### 🎨 精緻 UI/UX
- 現代化卡片式設計
- 流暢動畫效果
- 響應式布局
- 直覺操作體驗
- **下拉刷新**
  - 股票頁面下拉刷新資料
  - 持倉頁面下拉刷新
  - 視覺化載入動畫
- 側邊選單導航（漢堡選單）
  - 一鍵開啟側邊選單
  - 快速切換所有主要頁面
  - 點擊股票自動回到列表首頁

## 📁 專案結構

```
stock-app/
├── App.js                        # 應用入口
├── index.js                      # Expo 入口
├── app.json                      # Expo 配置
├── package.json                  # 依賴管理
│
├── assets/                       # 靜態資源
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
│
└── src/
    ├── components/               # 可重用組件
    │   ├── CustomDrawer.js       # 側邊選單
    │   ├── SearchBar.js          # 搜尋欄
    │   ├── StockCard.js          # 股票卡片
    │   ├── StockLogo.js          # 股票 Logo 組件
    │   ├── NewsCard.js           # 新聞卡片
    │   ├── SegmentControl.js     # 分段控制器
    │   ├── LoadingIndicator.js   # 載入動畫
    │   ├── AddTransactionModal.js        # 交易彈窗
    │   ├── TransactionHistoryModal.js    # 交易記錄彈窗
    │   ├── PriceAlertModal.js            # 價格提醒彈窗
    │   │
    │   ├── stocks/                       # 股票頁面組件
    │   │   ├── WatchlistSection.js      # 自選股區塊
    │   │   ├── TaiwanStocksSection.js   # 台股區塊
    │   │   ├── USStocksSection.js       # 美股區塊
    │   │   └── HotStocksSection.js      # 熱門股區塊
    │   │
    │   ├── stockDetail/                  # 股票詳情組件
    │   │   ├── StockHeader.js           # 標題區
    │   │   ├── PriceBlock.js            # 價格區塊
    │   │   ├── HistoricalChart.js       # 歷史走勢圖
    │   │   ├── CompanyInfoSection.js    # 公司資訊
    │   │   └── TechnicalSection.js      # 技術指標（示意）
    │   │
    │   └── backtest/                     # 回測組件
    │       ├── SegmentedControl.js      # 策略選擇器
    │       └── BacktestResultSheet.js   # 回測結果
    │
    ├── screens/                  # 畫面頁面
    │   ├── WelcomeScreen.js      # 歡迎頁
    │   ├── HomeScreen.js         # 首頁
    │   ├── StocksScreen.js       # 股票頁
    │   ├── StockDetailScreen.js  # 股票詳情
    │   ├── PortfolioScreen.js    # 投資組合
    │   ├── BacktestScreen.js     # 策略回測
    │   └── ProfileScreen.js      # 個人設定
    │
    ├── navigation/               # 導航配置
    │   ├── RootNavigator.js      # 根導航
    │   └── StocksNavigator.js    # 股票子導航
    │
    ├── services/                 # API 服務
    │   ├── stockApi.js           # 台股 API
    │   ├── usStockApi.js         # 美股 API
    │   ├── newsApi.js            # 新聞 API
    │   ├── searchApi.js          # 搜尋 API
    │   ├── companyInfoApi.js     # 公司資訊 API
    │   ├── stockRankingApi.js    # 排行榜 API
    │   ├── backtestEngine.js     # 回測引擎
    │   └── backtestApi.js        # 回測 API
    │
    ├── storage/                  # 本地儲存
    │   ├── watchlistStorage.js   # 自選股儲存
    │   ├── portfolioStorage.js   # 投資組合儲存
    │   ├── priceAlertStorage.js  # 價格提醒儲存
    │   └── searchHistoryStorage.js # 搜尋歷史儲存
    │
    ├── context/                  # 全局狀態
    │   ├── ThemeContext.js       # 主題管理
    │   └── DrawerContext.js      # 側邊選單狀態管理
    │
    ├── utils/                    # 工具函數
    │   ├── formatters.js         # 格式化工具
    │   └── constants.js          # 常數定義
    │
    ├── config/                   # 配置檔案
    │   └── apiKeys.js            # API 金鑰
    │
    └── data/                     # 靜態資料
        └── companyData.json      # 公司資料
```

## 🎨 主題系統設計

### 配色方案

#### 淺色模式
```javascript
{
  background: '#F5F5F5',    // 背景色
  surface: '#FFFFFF',        // 卡片背景
  text: '#000000',           // 主要文字
  textSecondary: '#666666',  // 次要文字
  primary: '#2196F3',        // 主色調（藍色）
  up: '#EF4444',             // 上漲（紅色）
  down: '#10B981',           // 下跌（綠色）
  border: '#E0E0E0',         // 邊框
  divider: '#F0F0F0',        // 分隔線
}
```

#### 深色模式
```javascript
{
  background: '#0A0A0A',     // 極深色背景
  surface: '#1A1A1A',        // 卡片背景
  text: '#FFFFFF',           // 主要文字
  textSecondary: '#AAAAAA',  // 次要文字
  primary: '#64B5F6',        // 主色調（淡藍）
  up: '#EF4444',             // 上漲（紅色）
  down: '#10B981',           // 下跌（綠色）
  border: '#333333',         // 邊框
  divider: '#2A2A2A',        // 分隔線
}
```

**注意：配色採用台灣習慣，漲紅跌綠**

### 主題使用方式

#### 在組件中使用
```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme, setThemeMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Hello</Text>
    </View>
  );
}
```

#### 主題管理功能
- `theme` - 當前主題配色物件
- `isDark` - 是否為深色模式
- `toggleTheme()` - 切換淺色/深色
- `setThemeMode(mode)` - 設定模式：'light' | 'dark' | 'auto'

## 💾 資料儲存架構

使用 **AsyncStorage** 進行本地資料持久化：

### 儲存項目
| 鍵名 | 說明 | 資料格式 |
|-----|------|---------|
| `@watchlist` | 自選股清單 | Array<string> |
| `@portfolio` | 投資組合交易記錄 | Array<Transaction> |
| `@price_alerts` | 價格提醒設定 | Array<Alert> |
| `@search_history` | 搜尋歷史記錄 | Array<SearchItem> |
| `@theme_mode` | 主題偏好 | 'light'\|'dark'\|'auto' |

### 資料結構範例

#### 交易記錄 (Transaction)
```javascript
{
  id: 'uuid',
  symbol: '2330',
  type: 'buy',           // 'buy' | 'sell'
  price: 580,
  quantity: 1000,
  date: '2025-12-24',
  timestamp: 1703404800000
}
```

#### 價格提醒 (Alert)
```javascript
{
  id: 'uuid',
  symbol: '2330',
  targetPrice: 600,
  condition: '>=',       // '>=' | '<='
  enabled: true,
  createdAt: '2025-12-24'
}
```

#### 搜尋歷史 (SearchItem)
```javascript
{
  symbol: '2330.TW',
  name: '台積電',
  market: 'TW',          // 'TW' | 'US'
  timestamp: 1703404800000
}
```
**限制：最多保存 10 筆記錄**

## 🛠 技術棧

### 核心框架
- **React Native** - 跨平台行動應用開發
- **Expo** - 快速開發與部署工具
- **React 19.1.0** - 最新 React 版本

### 導航與狀態管理
- **React Navigation 7** - 頁面導航管理
  - Bottom Tab Navigator - 底部標籤導航
  - Native Stack Navigator - 原生堆疊導航
  - Custom Drawer - 自訂側邊選單
- **Context API** - 全局狀態管理
  - ThemeContext - 主題狀態
  - DrawerContext - 側邊選單狀態

### UI 組件
- **React Native Paper 5** - Material Design 組件庫
- **NativeWind 4** - Tailwind CSS for React Native
- **自訂圖表組件** - 使用 React Native View 繪製折線圖

### 資料處理
- **AsyncStorage** - 本地資料持久化
- **Axios** - HTTP 請求處理
- **Yahoo Finance2** - 股票資料源

### 開發工具
- **Babel** - JavaScript 編譯
- **Expo Status Bar** - 狀態列管理

## 🚀 快速開始

### 環境需求
- Node.js 18+
- npm 或 yarn
- Expo Go App（iOS/Android）
- Expo CLI

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/100205ivan/stock-app.git
cd stock-app
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發伺服器**
```bash
npm start
# 或
npx expo start
```

4. **在裝置上運行**
- iOS：在 iPhone 上安裝 Expo Go，掃描 QR code
- Android：在 Android 手機上安裝 Expo Go，掃描 QR code
- 模擬器：按 `i` 開啟 iOS 模擬器，按 `a` 開啟 Android 模擬器

### 其他指令
```bash
npm run android    # 直接在 Android 裝置/模擬器運行
npm run ios        # 直接在 iOS 裝置/模擬器運行
npm run web        # 在瀏覽器運行
```

## 📱 功能使用指南

### � 側邊選單
- 點擊左上角漢堡選單圖示（☰）開啟側邊選單
- 快速切換至：首頁、股票、持倉管理、策略回測、設定
- 點擊股票會自動回到股票列表首頁（不停留在詳情頁）
- 點擊選單外部或叉叉圖示關閉選單

### �🏠 首頁
- 查看最新財經新聞
- 快速導航到各功能模組

### 📊 股票頁面
1. **查看自選股**：最上方顯示已加入的自選股列表
2. **搜尋股票**：使用頂部搜尋欄輸入代碼或名稱
3. **瀏覽台股**：向下滑動查看台股資訊
4. **查看美股**：切換至美股分頁
5. **熱門排行**：查看成交量前 10 名熱門股票

### 📈 股票詳情
1. 點擊任一股票卡片進入詳情頁
2. 查看即時股價、漲跌幅
3. 查看歷史價格走勢圖
   - 切換時間範圍（1週/1個月/3個月/6個月/1年/本年迄今）
   - 查看區間漲跌、最高價、最低價
4. 閱讀公司基本資料
5. 點擊 ⭐ 加入/移除自選股
6. 點擊「📊 新增交易」記錄買賣
7. 點擊「🔔 設定價格提醒」

### 💼 投資組合
1. 進入「持倉」頁面查看所有持股
2. 點擊「+ 新增交易」按鈕
3. 選擇買入或賣出
4. 輸入股票代碼、價格、數量
5. 確認後系統自動計算平均成本與損益
6. 點擊持股卡片查看交易歷史

### 🧪 策略回測
1. 進入「回測」頁面
2. 選擇市場（台股/美股）
3. 輸入股票代碼
4. 選擇回測期間（3個月/6個月/1年/自訂）
5. 選擇策略（目前僅「買進持有」為真實回測）
6. 點擊「開始回測」
7. 查看回測結果：
   - 總報酬率
   - 年化報酬率
   - 最大回撤
   - 勝率
   - 交易次數

### ⚙️ 個人設定
1. 進入「我的」頁面
2. 切換深色/淺色主題
3. 選擇自動跟隨系統

## 🔮 未來規劃

### 近期功能
- [ ] 價格提醒推播通知（本地通知）
- [ ] 真實技術指標計算（RSI、MACD、KD、布林通道）
- [ ] 更多回測策略實現（均線、RSI、MACD 等）
- [ ] 交易手續費與稅金計算
- [ ] 持倉績效圖表視覺化

### 中期功能
- [ ] 多幣別帳戶支援
- [ ] 股息記錄管理
- [ ] 匯率換算工具
- [ ] 離線模式支援
- [ ] 更完整的圖表功能（K線圖、成交量等）

### 長期功能
- [ ] 使用者帳號系統
- [ ] 雲端資料同步
- [ ] 社群討論功能
- [ ] AI 選股建議
- [ ] 更多國際市場（港股、日股等）

## 📝 開發注意事項

### API 串接
- 台股資料：使用 TWSE API 與第三方財經資料源
- 美股資料：使用 Yahoo Finance API
- 新聞資料：整合多個新聞來源
- 歷史股價：使用 Yahoo Finance v8 API（免費，無需 API key）
- 建議申請正式 API 金鑰以避免速率限制

### 資料儲存
- 所有交易記錄、自選股、提醒存在本地 AsyncStorage
- 解除安裝 App 會清除所有資料
- 未來版本將加入雲端備份功能

### 回測引擎
- 回測使用 Yahoo Finance 歷史收盤價計算
- 目前僅「買進持有」策略為真實回測
- 其他策略（均線、RSI 等）為示意功能，待開發
- 未考慮滑價、手續費等真實交易成本
- 回測結果僅供參考，不構成投資建議

### 圖表實現
- 使用 React Native 原生 View 組件繪製折線圖
- 不依賴第三方圖表庫，避免相依性問題

### 導航架構
- 使用 React Navigation 7 的 Tab Navigator 和 Stack Navigator
- 側邊選單透過 Modal 實現，使用 DrawerContext 管理狀態
- 導航 ref 透過 screenOptions 獲取，確保跨組件導航正確性

## 🎉 最近更新

### v2.1.0 (2024-12-25)
- ✨ 新增搜尋歷史記錄功能
  - 自動記錄最近 10 次搜尋
  - 支援快速重新查詢
  - 可清除全部或單獨刪除
- 🔄 新增下拉刷新功能
  - 股票頁面支援下拉刷新
  - 投資組合頁面支援下拉刷新
  - 視覺化載入動畫
- 🎨 新增公司 Logo 顯示
  - 熱門、台股、美股、自選股全部顯示 Logo
  - 無 Logo 股票自動顯示彩色縮寫
  - 元大、中信金、台塑、南亞、國泰金等30+股特殊色彩配置
- 🐛 修復股價百分比計算錯誤
- 🐛 修復搜尋歷史導航至股票詳情頁問題
- 🔧 改進股票詳情頁即時價格獲取

### v2.0.0 (2024-12-25)
- ✨ 新增側邊選單功能（漢堡選單）
- 🎨 優化深色主題配色（#0A0A0A 背景）
- 🐛 修復股票詳情頁導航問題
- 🔧 改進導航架構，使用 DrawerContext 管理狀態
- 📱 側邊選單點擊股票自動回到列表首頁
- 支援自適應螢幕寬度

### 效能優化
- 使用 FlatList 優化長列表渲染
- 圖片使用 lazy loading
- API 請求加入錯誤處理與重試機制

## 🐛 已知問題

- 技術指標（RSI、MACD、KD）目前為示意數值，非真實計算
- 部分低階 Android 裝置可能有圖表渲染延遲
- iOS 深色模式下部分陰影效果可能不明顯
- 價格提醒功能尚未完成背景推播機制（需要時手動檢查）

## 🤝 貢獻指南

歡迎提出 Issue 和 Pull Request！

### 貢獻步驟
1. Fork 此專案
2. 建立你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款

## 👨‍💻 作者

- GitHub: [@100205ivan](https://github.com/100205ivan)

## 🙏 致謝

- React Native 社群
- Expo 開發團隊
- 所有開源貢獻者

---

**版本**：v1.0.0  
**最後更新**：2025-12-25  

如有任何問題或建議，歡迎開 Issue 討論！ 📮
