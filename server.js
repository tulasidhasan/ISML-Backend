import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* Health check */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* Create PayU payment */
app.post("/create-payment", (req, res) => {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();

  if (!key || !salt) {
    return res.status(500).json({ error: "PayU credentials missing" });
  }

  const {
    name,
    email,
    phone,
    profession,
    state,
    batch,
    amount
  } = req.body;

  /* Basic validation */
  if (!name || !email || !phone || !profession || !state || !batch) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  /* PayU required fields */
  const txnid = "TXN" + Date.now();
  const finalAmount = String(amount || "1299"); // ensure string
  const productinfo = "ISML Foundation Program";
  const firstname = name;

  /* Map extra data to UDFs */
  const udf1 = batch;        // Weekday / Weekend
  const udf2 = profession;
  const udf3 = state;
  const udf4 = phone;
  const udf5 = "";

  /* Hash string (IMPORTANT: exact order) */
  const hashString =
    `${key}|${txnid}|${finalAmount}|${productinfo}|${firstname}|${email}|` +
    `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString, "utf8")
    .digest("hex");

  /* Send everything frontend needs */
  res.json({
    key,
    txnid,
    amount: finalAmount,
    productinfo,
    firstname,
    email,
    phone,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    surl: "https://isml-backend-production.up.railway.app/success",
    furl: "https://isml-backend-production.up.railway.app/failure",
    hash
  });
});

/* PayU callbacks */
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
