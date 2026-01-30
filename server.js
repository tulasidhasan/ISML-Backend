// Load env variables (works locally + Railway)
require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// PayU credentials from ENV (Railway Variables)
const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

// Safety check
if (!MERCHANT_KEY || !MERCHANT_SALT) {
  console.error("❌ PayU Merchant Key or Salt missing in ENV");
}

// Health check route
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

// Generate PayU hash
app.post("/hash", (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email } = req.body;

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashString =
      `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${MERCHANT_SALT}`;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    res.json({ hash });
  } catch (err) {
    console.error("Hash error:", err);
    res.status(500).json({ error: "Hash generation failed" });
  }
});

// PayU success callback
app.post("/success", (req, res) => {
  res.send("PAYMENT SUCCESS (TEST)");
});

// PayU failure callback
app.post("/failure", (req, res) => {
  res.send("PAYMENT FAILED (TEST)");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
