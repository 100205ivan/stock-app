const express = require('express');
const mysql = require('mysql2'); // 🟢 關鍵修正：這裡一定要引入 mysql2
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 1. 設定 Middleware (讓 APP 可以連線並傳送 JSON)
app.use(cors());
app.use(bodyParser.json());

// 2. 資料庫連線設定
// ⚠️ 請確認你的 XAMPP / phpMyAdmin 設定是否與下方一致
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // XAMPP 預設帳號
  password: '',      // XAMPP 預設密碼 (通常是空字串)
  database: 'stock-app' // ⚠️ 請確認 phpMyAdmin 裡有這個資料庫
});

// 3. 執行連線 (包含防呆機制)
db.connect(err => {
  if (err) {
    console.error('\n❌ 資料庫連線失敗！(Database Connection Failed)');
    console.error('錯誤代碼:', err.code);
    console.error('錯誤訊息:', err.message);
    console.error('------------------------------------------------');
    console.error('請檢查：');
    console.error('1. XAMPP 的 MySQL 按鈕是否已亮綠燈？');
    console.error('2. phpMyAdmin 裡是否有建立 "stock_app" 資料庫？');
    console.error('3. 密碼是否正確？');
    console.error('------------------------------------------------\n');
  } else {
    console.log('\n✅ 資料庫連線成功 (Database Connected)\n');
  }
});

// 4. API 路由設定

// [測試用] 檢查伺服器是否活著
app.get('/', (req, res) => {
  res.send('伺服器正在運作中！(Node.js Server is running correctly)');
});

// [註冊 API]
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // 檢查欄位是否都有填
  if (!name || !email || !password) {
    return res.status(400).json({ error: '請填寫完整資訊 (姓名、Email、密碼)' });
  }

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error('註冊失敗:', err);
      // 如果 Email 重複
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: '這個 Email 已經註冊過了' });
      }
      return res.status(500).json({ error: '資料庫錯誤' });
    }
    
    console.log(`🎉 新用戶註冊: ${name} (${email})`);
    res.json({ 
      message: '註冊成功', 
      userId: result.insertId,
      name, 
      email 
    });
  });
});

// [登入 API]
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '請輸入 Email 和密碼' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('登入查詢失敗:', err);
      return res.status(500).json({ error: '資料庫錯誤' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const user = results[0];
    console.log(`👋 用戶登入: ${user.name}`);
    
    res.json({
      message: '登入成功',
      userId: user.id,
      name: user.name,
      email: user.email
    });
  });
});

// 5. 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器已啟動，正在監聽 Port: ${PORT}`);
  console.log(`👉 請在瀏覽器打開: http://localhost:${PORT} 來測試`);
  console.log(`👉 記得開啟 ngrok: ngrok http ${PORT}`);
});