import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// PayU TEST credentials from Railway ENV
const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

// Health check
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

// Hash generation
app.post("/hash", (req, res) => {
  const txnid = "TXN001";
  const amount = "10";
  const productinfo = "PayU Test";
  const firstname = "Tulasi";
  const email = "test@mail.com";

  const hashString =
    `${process.env.PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  res.json({
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash
  });
});



// PayU callbacks
app.post("/success", (req, res) => {
  res.send("PAYMENT SUCCESS (TEST)");
});

app.post("/failure", (req, res) => {
  res.send("PAYMENT FAILED (TEST)");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
