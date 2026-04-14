const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp-clone";
const client = new MongoClient(mongoUri);

let dbPromise;

async function getDb() {
  if (!dbPromise) {
    dbPromise = client.connect().then(() => client.db());
  }

  return dbPromise;
}

module.exports = { getDb };
