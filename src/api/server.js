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
  try {
    const { userId } = req.body;

    // Veritabanından kullanıcının kartlarını sorgula
    const result = await pool.query(
      'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

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

// 🚀 Start server
app.listen(3000, () => {
  console.log('API listening on http://192.168.1.110:3000');
});