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

// 🔹 TEST HASH (GET — so browser works)
app.get("/hash", (req, res) => {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();

  if (!key || !salt) {
    return res.status(500).json({ error: "Key or salt missing in ENV" });
  }

  const txnid = "TXN001";
  const amount = "10";
  const productinfo = "PayU Test";
  const firstname = "Tulasi";
  const email = "test@mail.com";

  const hashString =
    `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString, "utf8")
    .digest("hex");

  res.json({
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash
  });
});

// (We will use this later)
app.post("/hash", (req, res) => {
  res.json({ message: "POST hash endpoint ready" });
});

app.post("/success", (req, res) => {
  res.send("PAYMENT SUCCESS");
});

app.post("/failure", (req, res) => {
  res.send("PAYMENT FAILED");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
