import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

// Initialize dotenv
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Allow requests from your Frontend
// In production, replace '*' with 'https://isml-foundation.netlify.app' for better security
app.use(cors({
  origin: "*" 
}));

// ENV VARIABLES
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

// Health Check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));