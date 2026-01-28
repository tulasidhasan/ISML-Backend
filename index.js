import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("ISML backend running");
});

// ✅ REGISTER API (NEW)
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, language } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const result = await pool.query(
      `
      INSERT INTO enrollments (name, email, phone, language)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, phone, language]
    );

    res.status(201).json({
      message: "Enrollment successful",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
