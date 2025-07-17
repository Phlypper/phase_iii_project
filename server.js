require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto");

const da = require("./data-access");
const verifyApiKey = require("./auth-middleware");

const app = express();
const port = process.env.PORT || 4000;
const API_KEYS_FILE = path.join(__dirname, "api_keys.json");

// 🗺️ Map to store user email → API key
const apiKeys = new Map();

// Restore API key map from file
if (fs.existsSync(API_KEYS_FILE)) {
  try {
    const fileData = fs.readFileSync(API_KEYS_FILE, "utf-8");
    const parsed = JSON.parse(fileData);
    for (const [email, key] of Object.entries(parsed)) {
      apiKeys.set(email, key);
    }
    console.log("🔁 Loaded API keys from file:", parsed);
  } catch (err) {
    console.error("❌ Failed to load API keys:", err);
  }
}

// Add default key if set by ENV or CLI
const startupKey = process.env.API_KEY || process.argv[2];
if (startupKey) {
  apiKeys.set("default", startupKey);
  saveApiKeys();
  console.log("✅ Default API key registered:", startupKey);
} else {
  console.warn(
    "⚠️ No API key set via env or CLI. Use /apikey to generate one."
  );
}

// Save keys to disk
function saveApiKeys() {
  const plainObject = Object.fromEntries(apiKeys);
  fs.writeFileSync(
    API_KEYS_FILE,
    JSON.stringify(plainObject, null, 2),
    "utf-8"
  );
}

// Express Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ GET /apikey – generate + return key for user
app.get("/apikey", (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Missing email query parameter");
  }

  const newKey = crypto.randomBytes(16).toString("hex"); // 32-char key
  apiKeys.set(email, newKey);
  saveApiKeys();
  console.log("🔑 New API key added:", Object.fromEntries(apiKeys));
  res.send({ email, apiKey: newKey });
});

// ✅ GET /apikey/reset – clear map + delete file
app.get("/apikey/reset", verifyApiKey(apiKeys), (req, res) => {
  apiKeys.clear();
  if (fs.existsSync(API_KEYS_FILE)) {
    fs.unlinkSync(API_KEYS_FILE);
  }
  console.log("🔁 All API keys cleared and file deleted.");
  res.send("All API keys have been reset.");
});

// ✅ GET all customers
app.get("/customers", verifyApiKey(apiKeys), async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) res.send(cust);
  else res.status(500).send(err);
});

// ✅ GET single customer
app.get("/customers/:id", verifyApiKey(apiKeys), async (req, res) => {
  const id = req.params.id;
  const [cust, err] = await da.getCustomerById(id);
  if (cust) res.send(cust);
  else res.status(404).send(err);
});

// ✅ POST add customer
app.post("/customers", verifyApiKey(apiKeys), async (req, res) => {
  const newCustomer = req.body;
  if (!newCustomer || Object.keys(newCustomer).length === 0) {
    return res.status(400).send("Missing request body");
  }

  const [status, id, errMessage] = await da.addCustomer(newCustomer);
  if (status === "success") {
    res.status(201).send({ ...newCustomer, _id: id });
  } else {
    res.status(400).send(errMessage);
  }
});

// ✅ PUT update customer
app.put("/customers/:id", verifyApiKey(apiKeys), async (req, res) => {
  const id = req.params.id;
  const updatedCustomer = req.body;
  if (!updatedCustomer || Object.keys(updatedCustomer).length === 0) {
    return res.status(400).send("Missing request body");
  }
  delete updatedCustomer._id;
  const [msg, errMsg] = await da.updateCustomer(updatedCustomer);
  if (msg) res.send(msg);
  else res.status(400).send(errMsg);
});

// ✅ DELETE customer
app.delete("/customers/:id", verifyApiKey(apiKeys), async (req, res) => {
  const id = req.params.id;
  const [msg, errMsg] = await da.deleteCustomerById(id);
  if (msg) res.send(msg);
  else res.status(404).send(errMsg);
});

// ✅ GET /reset – reset customers (also protected)
app.get("/reset", verifyApiKey(apiKeys), async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result) res.send(result);
  else res.status(500).send(err);
});

// Server start
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
