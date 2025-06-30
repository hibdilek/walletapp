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
  database: 'wallet',
  password: '1111',
  port: 5432,
});

// 🔐 Password hashing
const saltRounds = 10;
// Kart oluşturma endpoint'i (PostgreSQL uyumlu)
app.post('/api/createCard', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Rastgele kart bilgileri oluştur
    const masked_pan= generateMaskedCardNumber(); // Örnek: '****-****-****-4242'
    const token = generateToken(); // Güvenli rastgele token
    const balance = 0; // Varsayılan bakiye

    // Veritabanına kaydet
    const result = await pool.query(
      `INSERT INTO cards (user_id, masked_pan, token, balance, created_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, masked_pan, token, balance, new Date()]
    );

    res.status(201).json({ 
      success: true,
      card: result.rows[0]
    });
    
  } catch (error) {
    console.error('Kart oluşturma hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Kart oluşturulamadı'
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
