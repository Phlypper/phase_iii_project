const { apiKeys } = require("./apiKeyStore");

function verifyApiKey(req, res, next) {
  const apiKeyHeader = req.headers["x-api-key"];

  if (!apiKeyHeader) {
    return res.status(401).send("API Key is missing");
  }

  // Check if the key exists in the Map values
  const valid = Array.from(apiKeys.values()).includes(apiKeyHeader);

  if (!valid) {
    return res.status(403).send("API Key is invalid");
  }

  next();
}

module.exports = verifyApiKey;
