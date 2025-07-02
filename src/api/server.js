const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1111',
  port: 5432,
});

// 🔐 Password hashing
const saltRounds = 10;

// Kart oluşturma endpoint'i (PostgreSQL uyumlu)
app.post('/api/createCard', async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body;
    
    // 1. Kullanıcı var mı kontrol et (hem ID hem username için)
    const userCheck = await client.query(
      `SELECT user_id FROM users 
       WHERE username = $1 
       LIMIT 1`,
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Kullanıcı bulunamadı: ${userId}`,
        suggestion: 'Lütfen geçerli bir kullanıcı ID veya kullanıcı adı girin'
      });
    }

    const actualUserId = userCheck.rows[0].user_id;

    // 2. Transaction başlat
    await client.query('BEGIN');
    console.log('USER ID : '  ,actualUserId ) ; 
    // 3. Kart oluştur
    const result = await client.query(
      `INSERT INTO cards (user_id, masked_pan, token, balance, created_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        actualUserId, 
        generateMaskedCardNumber(), 
        generateToken(), 
        0, 
        new Date()
      ]
    );

    await client.query('COMMIT');
    
    res.status(201).json({ 
      success: true,
      card: result.rows[0],
      message: 'Kart başarıyla oluşturuldu'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Kart oluşturma hatası:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      message: 'Kart oluşturma işlemi başarısız',
      errorDetail: error.detail,
      technicalInfo: {
        code: error.code,
        constraint: error.constraint
      }
    });
  } finally {
    client.release();
  }
});

// Kullanıcının kartlarını getirme endpoint'i
app.post('/api/getCards', async (req, res) => {
const client = await pool.connect();
  
  try {
    const { userId } = req.body;
    const userCheck = await client.query(
      `SELECT user_id FROM users 
       WHERE username = $1 
       LIMIT 1`,
      [userId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Kullanıcı bulunamadı: ${userId}`,
        suggestion: 'Lütfen geçerli bir kullanıcı ID veya kullanıcı adı girin'
      });
    }

    const actualUserId = userCheck.rows[0].user_id;
    

    // Veritabanından kullanıcının kartlarını sorgula
    const result = await pool.query(
      'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
      [actualUserId]
    );
    await client.query('BEGIN');
    res.status(200).json({
      success: true,
      cards: result.rows
    });

  } catch (error) {
    console.error('Kartları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kartlar getirilemedi'
    });
  }
});

// Yardımcı fonksiyonlar
function generateMaskedCardNumber() {
  const last4 = Math.floor(1000 + Math.random() * 9000);
  return `****-****-****-${last4}`;
}

function generateToken() {
  return require('crypto').randomBytes(16).toString('hex');
}

// ✅ Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'Kullanıcı zaten var.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ✅ Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) { 
      return res.json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Parola yanlış.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});
app.post('/api/loadBalance', async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, amount, cardToken } = req.body; // userId, yüklenecek miktar ve kartın token'ını bekliyoruz

    // 1. Kullanıcı ve Kart Kontrolü
    // Önce userId'nin varlığını kontrol edelim (username veya user_id olabilir, frontend'den ne geldiğine göre ayarlayın)
    const userCheck = await client.query(
      `SELECT user_id FROM users
       WHERE username = $1 OR user_id = $1 -- Hem username hem user_id ile kontrol edelim
       LIMIT 1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Kullanıcı bulunamadı: ${userId}`,
        suggestion: 'Lütfen geçerli bir kullanıcı ID veya kullanıcı adı girin'
      });
    }
    const actualUserId = userCheck.rows[0].user_id;

    // Belirtilen token'a sahip kartın bu kullanıcıya ait olup olmadığını kontrol et
    const cardCheck = await client.query(
      `SELECT id, balance FROM cards
       WHERE token = $1 AND user_id = $2`,
      [cardToken, actualUserId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Belirtilen karta veya bu kullanıcıya ait karta ulaşılamadı.',
        suggestion: 'Kart tokenını ve kullanıcı ID\'sini kontrol edin.'
      });
    }

    const currentCard = cardCheck.rows[0];
    const newBalance = parseFloat(currentCard.balance) + parseFloat(amount); // Bakiyeyi float olarak topla

    // 2. Transaction başlat
    await client.query('BEGIN');

    // 3. Kartın bakiyesini güncelle
    const updateResult = await client.query(
      `UPDATE cards
       SET balance = $1
       WHERE token = $2
       RETURNING balance`, // Güncellenmiş bakiyeyi geri döndür
      [newBalance, cardToken]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      newBalance: updateResult.rows[0].balance, // Güncellenmiş bakiyeyi gönder
      message: `${amount} TL bakiyeniz yüklendi. Yeni bakiye: ${newBalance} TL`
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Hata durumunda değişiklikleri geri al
    console.error('Bakiye yükleme hatası:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      requestBody: req.body // Hata ayıklama için request body'yi logla
    });

    res.status(500).json({
      success: false,
      message: 'Bakiye yükleme işlemi başarısız.',
      errorDetail: error.detail,
      technicalInfo: {
        code: error.code,
        constraint: error.constraint
      }
    });
  } finally {
    client.release(); // Bağlantıyı havuza geri bırak
  }
});


// 🚀 Start server
app.listen(3000, () => {
  console.log('API listening on http://192.168.1.110:3000');
});