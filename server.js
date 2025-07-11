const express = require("express");
const path = require("path");
const bodyParser = require("body-parser"); // ✅ Required for parsing POST bodies
const da = require("./data-access");

const app = express();
const port = process.env.PORT || 4000;

// Middleware setup
app.use(bodyParser.json()); // ✅ Must come before route handling
app.use(express.static(path.join(__dirname, "public")));

// GET all customers
app.get("/customers", async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.send(cust);
  } else {
    res.status(500).send(err);
  }
});

// GET reset endpoint
app.get("/reset", async (req, res) => {
  const [result, err] = await da.resetCustomers();
  if (result) {
    res.send(result);
  } else {
    res.status(500).send(err);
  }
});

// ✅ POST /customers
app.post("/customers", async (req, res) => {
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

app.get("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const [cust, err] = await da.getCustomerById(id);
  if (cust) {
    res.send(cust);
  } else {
    res.status(404).send(err);
  }
});

app.put("/customers/:id", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
