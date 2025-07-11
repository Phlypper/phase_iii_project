const express = require("express");
const path = require("path");
const da = require("./data-access"); // ✅ New import

const app = express();
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "public")));

// ✅ New route to get customer list
app.get("/customers", async (req, res) => {
  const cust = await da.getCustomers();
  res.send(cust);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
