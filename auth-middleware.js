require("dotenv").config();
const fs = require("fs");
const path = require("path");

function verifyApiKey(apiKeysMap) {
  return (req, res, next) => {
    let apiKey = req.headers["x-api-key"];

    // Support query param fallback
    if (!apiKey && req.query.api_key) {
      apiKey = req.query.api_key;
    }

    // Check for missing key
    if (!apiKey) {
      return res.status(401).send("API Key is missing");
    }

    // Defensive check for Map
    if (!apiKeysMap || typeof apiKeysMap.values !== "function") {
      return res
        .status(500)
        .send("Server misconfiguration: API key map not found.");
    }

    // Validate against stored keys
    const isValid = Array.from(apiKeysMap.values()).includes(apiKey);

    if (!isValid) {
      return res.status(403).send("API Key is invalid");
    }

    next();
  };
}

module.exports = verifyApiKey;
