# phase_iii_project – Secure Customer Management API

This is a secure Express.js + MongoDB REST API for managing a customer database with full CRUD support, API key authentication, user-specific access, and search capability.

## 📦 Features

- 🧾 Customer records with `_id`, `id`, `name`, `email`, `password`
- 🔐 API key authentication (per user via email or default key)
- 🔄 API key generation, storage, and reset
- 💾 API key persistence in `api_keys.json`
- 🔎 Customer search by `id`, `email`, or `password`
- 🌐 JSON-based HTTP endpoints
- 👨‍🦯 Designed with screen reader–friendly responses

---

## 🚀 Setup Instructions

1. **Clone this repo:**

   ```bash
   git clone https://github.com/Phlypper/phase_iii_project.git
   cd phase_iii_project
   Install dependencies:npm install
   ```

Start MongoDB locally:mongod --dbpath ~/data/db
(On local Mac machine)
Create a .env file with a default API key (optional):API_KEY=zappa1138

Run the server:node server.js
Or with CLI key override:node server.js zappa1138

🧪 Test the API with curl
🔑 API Key Management
Generate new API key by email:curl:
curl "http://localhost:4000/apikey?email=jack@abc.com"
curl "http://localhost:4000/apikey?email=bobby@abc.com"
Browser:
http://localhost:4000/apikey?email=jack@abc.com

Reset all keys (requires API key):curl -H "x-api-key: zappa1138" http://localhost:4000/apikey/reset

👥 Customer CRUD
All routes below require a valid x-api-key header (default: zappa1138 or generated via /apikey).
✅ GET all customers
a) Using header:
curl -H "x-api-key: zappa1138" http://localhost:4000/customers
b) Using query param:
curl "http://localhost:4000/customers?api_key=zappa1138"
Browser:
http://localhost:4000/customers?api_key=zappa1138

✅ GET single customer by ID
a) Using header:
curl -H "x-api-key: zappa1138" http://localhost:4000/customers/0
b) Using query param:
curl "http://localhost:4000/customers/0?api_key=zappa1138"
Browser:
http://localhost:4000/customers/0?api_key=zappa1138

✅ POST add new customer
a) Using header:
curl -X POST http://localhost:4000/customers \
 -H "Content-Type: application/json" \
 -H "x-api-key: zappa1138" \
 -d '{
"id": 3,
"name": "New Customer",
"email": "new@abc.com",
"password": "securepass"
}'
b) Using query param:
curl -X POST "http://localhost:4000/customers?api_key=zappa1138" \
 -H "Content-Type: application/json" \
 -d '{
"id": 3,
"name": "New Customer",
"email": "new@abc.com",
"password": "securepass"
}'

✅ PUT update customer
a) Using header:
curl -X PUT http://localhost:4000/customers/3 \
 -H "Content-Type: application/json" \
 -H "x-api-key: zappa1138" \
 -d '{
"id": 3,
"name": "Updated Customer",
"email": "updated@abc.com",
"password": "newpassword"
}'
b) Using query param:
curl -X PUT "http://localhost:4000/customers/3?api_key=zappa1138" \
 -H "Content-Type: application/json" \
 -d '{
"id": 3,
"name": "Updated Customer",
"email": "updated@abc.com",
"password": "newpassword"
}'

✅ DELETE customer
a) Using header:
curl -X DELETE -H "x-api-key: zappa1138" http://localhost:4000/customers/2
b) Using query param:
curl -X DELETE "http://localhost:4000/customers/2?api_key=zappa1138"

♻️ Reset Customer Database
a) Using header:
curl -H "x-api-key: zappa1138" http://localhost:4000/reset
b) Using query param:
curl "http://localhost:4000/reset?api_key=zappa1138"
Browser:
http://localhost:4000/reset?api_key=zappa1138

🔍 Search Customers (no API key required)
✅ Search by email
curl "http://localhost:4000/customers/find?email=alice@abc.com"
✅ Search by id
curl "http://localhost:4000/customers/find?id=1"
✅ Search by password
curl "http://localhost:4000/customers/find?password=apple"
🚫 Invalid search key
curl "http://localhost:4000/customers/find?name=Bob"

# Response: name must be one of the following (id, email, password)

🚫 Missing query
curl "http://localhost:4000/customers/find"

# Response: query string is required

🧠 Developer Notes
API keys are stored in api_keys.json on disk.
Default API key can be set in .env or via CLI.
Keys are tied to emails and validated on each request.
Search endpoint supports exact matches only.

🏷️ Git Tags
Each development stage is tagged for tracking:
stage09-optional01-base-complete
stage10-optional02-cli-support
stage11-optional01-startup-validation
stage12-optional01-advanced01-complete
stage13-optional02-save-load-reset
stage14-optional02-customer-find

👨‍🏫 Author
Jason WashburnPhase III Full Stack ProjectAccessible API Development

---
