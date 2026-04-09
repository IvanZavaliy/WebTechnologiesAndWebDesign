const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const col = () => getDb().collection('messages');

async function create(roomId, participantId, text) {
  const doc = {
    room_id: new ObjectId(roomId),
    participant_id: new ObjectId(participantId),
    text,
    created_at: new Date(),
  };
  const result = await col().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function findByRoom(roomId, limit = 50) {
  // Get last N messages, but return in chronological order
  const messages = await col()
    .find({ room_id: new ObjectId(roomId) })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();

  return messages.reverse();
}

module.exports = { create, findByRoom };
