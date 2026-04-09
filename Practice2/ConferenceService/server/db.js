const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'conference_service';

let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[DB] Connected to MongoDB → ${DB_NAME}`);

  // Ensure indexes
  await db.collection('participants').createIndex({ room_id: 1, left_at: 1 });
  await db.collection('messages').createIndex({ room_id: 1, created_at: -1 });

  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected. Call connect() first.');
  return db;
}

async function close() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}

module.exports = { connect, getDb, close };
