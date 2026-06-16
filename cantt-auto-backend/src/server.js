require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT || 4000);
const ALLOWED_STATUSES = new Set(["new", "in-progress", "done"]);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cantt-auto-backend" });
});

app.post("/api/appointments", async (req, res) => {
  const { customer_name, phone, car_model, service_type, message } = req.body || {};
  if (!customer_name || !phone || !car_model || !service_type) {
    return res.status(400).json({ error: "Fields required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO appointments (customer_name, phone, car_model, service_type, message) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [customer_name, phone, car_model, service_type, message || ""]
    );
    return res.status(201).json({ message: "Saved", appointment_id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ error: "Could not save" });
  }
});

app.get("/api/appointments", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY created_at DESC");
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: "Could not fetch" });
  }
});

app.patch("/api/appointments/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const status = String((req.body && req.body.status) || "").trim().toLowerCase();
  if (!id || !status) return res.status(400).json({ error: "id and status required" });
  if (!ALLOWED_STATUSES.has(status)) return res.status(400).json({ error: "Invalid status" });
  try {
    const result = await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [status, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ message: "Updated" });
  } catch (err) {
    return res.status(500).json({ error: "Could not update" });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "valid id required" });
  try {
    const result = await pool.query("DELETE FROM appointments WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Could not delete" });
  }
});

app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});
