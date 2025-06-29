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
