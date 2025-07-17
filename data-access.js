const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "customerDB";
const collectionName = "customers";

async function getCustomers(filter = {}) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const customers = await collection.find(filter).toArray();
    return [customers, null];
  } catch (err) {
    return [null, err.message];
  }
}

async function getCustomerById(id) {
  try {
    const [customers, err] = await getCustomers({ id: parseInt(id) });
    if (customers && customers.length > 0) {
      return [customers[0], null];
    } else {
      return [null, "Customer not found"];
    }
  } catch (err) {
    return [null, err.message];
  }
}

async function addCustomer(customer) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(customer);
    return ["success", result.insertedId, null];
  } catch (err) {
    return ["error", null, err.message];
  }
}

async function updateCustomer(customer) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.updateOne(
      { id: customer.id },
      { $set: customer }
    );
    if (result.matchedCount === 0) {
      return [null, "Customer not found"];
    }
    return ["Customer updated", null];
  } catch (err) {
    return [null, err.message];
  }
}

async function deleteCustomerById(id) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.deleteOne({ id: parseInt(id) });
    if (result.deletedCount === 0) {
      return [null, "Customer not found"];
    }
    return ["Customer deleted", null];
  } catch (err) {
    return [null, err.message];
  }
}

async function resetCustomers() {
  const defaultCustomers = [
    { id: 0, name: "Alice", email: "alice@abc.com", password: "apple" },
    { id: 1, name: "Bob", email: "bob@abc.com", password: "banana" },
    { id: 2, name: "Carol", email: "carol@abc.com", password: "cherry" },
  ];

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    await collection.insertMany(defaultCustomers);
    return ["Customers reset", null];
  } catch (err) {
    return [null, err.message];
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomerById,
  resetCustomers,
};
