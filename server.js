require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const da = require("./data-access");
const verifyApiKey = require("./auth-middleware");

const app = express();
const port = process.env.PORT || 4000;

// Check for API_KEY in env or CLI
let apiKey = process.env.API_KEY;
const cliArg = process.argv.find((arg) => arg.startsWith("api_key="));
if (cliArg) {
  apiKey = cliArg.split("=")[1];
}

// Exit if no API_KEY is set
if (!apiKey) {
  console.error(
    "❌ API Key not set. Please provide it via .env or as a command-line argument: api_key=yourkey"
  );
  process.exit(1);
}
app.locals.apiKey = apiKey;

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// GET all customers (✔️ Protected)
app.get("/customers", verifyApiKey, async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500).send(err);
  }
});

// GET reset endpoint (✔️ Protected)
app.get("/reset", verifyApiKey, async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result) {
    res.send(result);
  } else {
    res.status(500).send(err);
  }
});

// POST new customer (✔️ Protected)
app.post("/customers", verifyApiKey, async (req, res) => {
  const newCustomer = req.body;

  if (!newCustomer || Object.keys(newCustomer).length === 0) {
    res.status(400).send("missing request body");
    return;
  }

  const [status, id, errMessage] = await da.addCustomer(newCustomer);

  if (status === "success") {
    res.status(201).send({ ...newCustomer, _id: id });
  } else {
    res.status(400).send(errMessage);
  }
});

// GET customer by id (✔️ Protected)
app.get("/customers/:id", verifyApiKey, async (req, res) => {
  const id = req.params.id;
  const [cust, err] = await da.getCustomerById(id);
  if (cust) {
    res.send(cust);
  } else {
    res.status(404).send(err);
  }
});

// PUT update customer (✔️ Protected)
app.put("/customers/:id", verifyApiKey, async (req, res) => {
  const id = req.params.id;
  const updatedCustomer = req.body;

  if (!updatedCustomer || Object.keys(updatedCustomer).length === 0) {
    res.status(400).send("missing request body");
    return;
  }

  delete updatedCustomer._id;

  const [message, errMessage] = await da.updateCustomer(updatedCustomer);

  if (message) {
    res.send(message);
  } else {
    res.status(400).send(errMessage);
  }
});

// DELETE customer by id (✔️ Protected)
app.delete("/customers/:id", verifyApiKey, async (req, res) => {
  const id = req.params.id;
  const [message, errMessage] = await da.deleteCustomerById(id);
  if (message) {
    res.send(message);
  } else {
    res.status(404).send(errMessage);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
