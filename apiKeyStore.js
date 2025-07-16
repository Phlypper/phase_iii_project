const crypto = require("crypto");

// Global API key map: email → key
const apiKeys = new Map();

function generateKey() {
  return crypto.randomBytes(16).toString("hex");
}

function addApiKey(email, customKey = null) {
  const key = customKey || generateKey();
  apiKeys.set(email, key);
  console.log("🔐 Updated API Key Map:", Object.fromEntries(apiKeys));
  return key;
}

module.exports = {
  apiKeys,
  addApiKey,
};
