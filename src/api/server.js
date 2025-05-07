const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 9050;

app.use(cors());
app.use(express.json());

// 👤 Kullanıcı bakiyeleri burada tutulur
let userBalances = {
  user123: 500 // varsayılan başlangıç bakiyesi
};

// 💳 Sanal kart verileri burada tutulur
let userCards = {};

function generateMaskedPan(pan) {
  return `${pan.slice(0, 4)} **** **** ${pan.slice(-4)}`;
}

function generatePan() {
  const bin = '455612';
  const account = Math.floor(100000000 + Math.random() * 900000000).toString();
  const partialPan = bin + account;
  const checkDigit = generateLuhnCheckDigit(partialPan);
  return partialPan + checkDigit;
}

function generateLuhnCheckDigit(number) {
  const digits = number.split('').map(Number).reverse();
  const sum = digits.reduce((acc, digit, idx) => {
    if (idx % 2 === 0) {
      let dbl = digit * 2;
      if (dbl > 9) dbl -= 9;
      return acc + dbl;
    }
    return acc + digit;
  }, 0);
  return (10 - (sum % 10)) % 10;
}

// 📌 Sanal kart oluştur
app.post('/card/create', (req, res) => {
  const { userId } = req.body;
  const pan = generatePan();
  const token = 'tok_' + Math.random().toString(36).substring(2, 12);
  const maskedPan = generateMaskedPan(pan);

  userCards[userId] = {
    token,
    maskedPan,
    pan
  };

  return res.json({ card: userCards[userId] });
});

// 💰 Bakiye yükleme
app.post('/balance/load', (req, res) => {
  const { userId, amount } = req.body;
  if (!userBalances[userId]) userBalances[userId] = 0;
  userBalances[userId] += amount;
  return res.json({ newBalance: userBalances[userId] });
});

// 💸 Ödeme yap
app.post('/payment/nfc', (req, res) => {
  const { userId, token, amount } = req.body;

  // kart kontrolü
  const card = userCards[userId];
  if (!card || card.token !== token) {
    return res.status(403).json({ success: false, message: 'Kart geçersiz' });
  }

  if (!userBalances[userId]) userBalances[userId] = 0;

  if (userBalances[userId] < amount) {
    return res.json({ success: false, newBalance: userBalances[userId] });
  }

  userBalances[userId] -= amount;
  return res.json({ success: true, newBalance: userBalances[userId] });
});

app.listen(PORT, () => {
  console.log(`✅ Wallet server is running at http://localhost:${PORT}`);
});
