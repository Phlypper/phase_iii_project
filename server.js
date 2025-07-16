require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const da = require("./data-access");
const verifyApiKey = require("./auth-middleware");
const { addApiKey } = require("./apiKeyStore");

const app = express();
const port = process.env.PORT || 4000;

// 1. Initialize default API key from env or CLI
const defaultKey = process.env.API_KEY || process.argv[2];
if (!defaultKey) {
  console.error("❌ No API key provided in .env or command line argument");
  process.exit(1);
}
addApiKey("default", defaultKey);

// 2. Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 3. Issue new API key for given email
app.get("/apikey", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).send("Missing email query parameter");
  }

  const key = addApiKey(email);
  res.send({ email, apiKey: key });
});

// 4. Protected CRUD routes

// GET all customers
app.get("/customers", verifyApiKey, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500).send(err);
  }
});

// GET customer by ID
app.get("/customers/:id", verifyApiKey, async (req, res) => {
  const id = req.params.id;
  const [cust, err] = await da.getCustomerById(id);
  if (cust) {
    res.send(cust);
  } else {
    res.status(404).send(err);
  }
});

// POST add new customer
app.post("/customers", verifyApiKey, async (req, res) => {
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

// PUT update customer by ID
app.put("/customers/:id", verifyApiKey, async (req, res) => {
  const updatedCustomer = req.body;

  if (!updatedCustomer || Object.keys(updatedCustomer).length === 0) {
    return res.status(400).send("Missing request body");
  }

  delete updatedCustomer._id;

  const [message, errMessage] = await da.updateCustomer(updatedCustomer);

  if (message) {
    res.send(message);
  } else {
    res.status(400).send(errMessage);
  }
});

// DELETE customer by ID
app.delete("/customers/:id", verifyApiKey, async (req, res) => {
  const id = req.params.id;
  const [message, errMessage] = await da.deleteCustomerById(id);

  if (message) {
    res.send(message);
  } else {
    res.status(404).send(errMessage);
  }
});

// GET reset customers
app.get("/reset", verifyApiKey, async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result) {
    res.send(result);
  } else {
    res.status(500).send(err);
  }
});

// 5. Start server
app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
