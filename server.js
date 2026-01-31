import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Postgres connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

/* Create PayU payment + SAVE DATA */
app.post("/create-payment", async (req, res) => {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();

  const { name, email, phone, profession, state, batch, amount } = req.body;

  if (!name || !email || !phone || !profession || !state || !batch) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const txnid = "TXN" + Date.now();
  const finalAmount = String(amount || "10.00");
  const productinfo = "ISML Foundation Program";
  const firstname = name;

  // 🔹 SAVE TO DATABASE (payment initiated)
  await pool.query(
    `INSERT INTO registrations
     (txnid, name, email, phone, profession, state, batch, amount, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      txnid,
      name,
      email,
      phone,
      profession,
      state,
      batch,
      finalAmount,
      "INITIATED"
    ]
  );

  // 🔹 PayU hash (NO UDFs)
  const hashString =
    `${key}|${txnid}|${finalAmount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString, "utf8")
    .digest("hex");

  res.json({
    key,
    txnid,
    amount: finalAmount,
    productinfo,
    firstname,
    email,
    phone,
    surl: "https://isml-backend-production.up.railway.app/success",
    furl: "https://isml-backend-production.up.railway.app/failure",
    hash
  });
});

/* PayU success callback */
app.post("/success", async (req, res) => {
  const { txnid } = req.body;

  if (txnid) {
    await pool.query(
      `UPDATE registrations
       SET payment_status = 'SUCCESS'
       WHERE txnid = $1`,
      [txnid]
    );
  }

  res.send("Payment Successful");
});

/* PayU failure callback */
app.post("/failure", async (req, res) => {
  const { txnid } = req.body;

  if (txnid) {
    await pool.query(
      `UPDATE registrations
       SET payment_status = 'FAILED'
       WHERE txnid = $1`,
      [txnid]
    );
  }

  res.send("Payment Failed");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
