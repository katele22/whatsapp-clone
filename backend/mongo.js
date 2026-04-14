require("dotenv").config();

const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp-clone";
const mongoDbName = process.env.MONGODB_DB || "whatsapp-clone";

if (!process.env.MONGODB_URI) {
  console.warn(
    "MONGODB_URI is not set. Create a .env file in the project root using .env.example before starting the backend."
  );
}

const client = new MongoClient(mongoUri);

let dbPromise;

async function getDb() {
  if (!dbPromise) {
    dbPromise = client.connect().then(() => client.db(mongoDbName));
  }

  return dbPromise;
}

module.exports = { getDb };
