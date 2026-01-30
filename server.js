import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/hash", (req, res) => {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();

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
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash
  });
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
