// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(express.json());
// Allow requests from your Netlify Frontend
app.use(cors({
  origin: "*" // For testing. In production, replace '*' with your Netlify URL (e.g., 'https://isml-foundation.netlify.app')
}));

// ENV VARIABLES (Set these in Railway Dashboard)
const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

if (!MERCHANT_KEY || !MERCHANT_SALT) {
  console.error("CRITICAL ERROR: PayU Keys not found in environment variables.");
}

// ROUTE: Generate Hash
app.post('/api/payment/hash', (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email } = req.body;

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // PayU Hash Formula:
    // sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
    const hashString = `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${MERCHANT_SALT}`;
    
    // Generate Hash
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    res.json({ hash: hash, key: MERCHANT_KEY });
  } catch (error) {
    console.error("Hash Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health Check (To confirm Railway is running)
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));