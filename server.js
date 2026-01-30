import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend running");
});

/**
 * Create PayU payment
 */
app.post("/create-payment", (req, res) => {
  const key = process.env.PAYU_MERCHANT_KEY.trim();
  const salt = process.env.PAYU_MERCHANT_SALT.trim();

  const {
    name,
    email,
    phone
  } = req.body;

  // Fixed for now (can be dynamic later)
  const txnid = "TXN" + Date.now();
  const amount = "1299";
  const productinfo = "ISML Course Registration";
  const firstname = name;

  const hashString =
    `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  res.json({
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl: "https://isml-backend-production.up.railway.app/success",
    furl: "https://isml-backend-production.up.railway.app/failure",
    hash
  });
});

// PayU callbacks
app.post("/success", (req, res) => {
  res.send("Payment Successful");
});

app.post("/failure", (req, res) => {
  res.send("Payment Failed");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
