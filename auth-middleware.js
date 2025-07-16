require("dotenv").config();

function verifyApiKey(req, res, next) {
  const apiKeyHeader = req.headers["x-api-key"];
  const validKey = req.app.locals.apiKey;

  if (!apiKeyHeader) {
    return res.status(401).send("API Key is missing");
  }

  if (apiKeyHeader !== validKey) {
    return res.status(403).send("API Key is invalid");
  }

  next(); // 🔑 Proceed to the next middleware or route
}

module.exports = verifyApiKey;
