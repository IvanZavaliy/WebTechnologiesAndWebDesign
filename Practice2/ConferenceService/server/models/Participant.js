const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const col = () => getDb().collection('participants');

/**
 * Join a room by name.
 * If an active participant with that name exists → return existing.
 * Otherwise create a new participant.
 */
async function joinOrCreate(roomId, name) {
  const roomOid = new ObjectId(roomId);

  // Check if an active participant with this name already exists
  const existing = await col().findOne({
    room_id: roomOid,
    name,
    left_at: null,
  });

  if (existing) {
    return { participant: existing, isNew: false };
  }

  const doc = {
    room_id: roomOid,
    name,
    joined_at: new Date(),
    left_at: null,
  };
  const result = await col().insertOne(doc);
  return { participant: { ...doc, _id: result.insertedId }, isNew: true };
}

async function leave(participantId) {
  const result = await col().updateOne(
    { _id: new ObjectId(participantId), left_at: null },
    { $set: { left_at: new Date() } }
  );
  return result.modifiedCount > 0;
}

async function leaveAllInRoom(roomId) {
  await col().updateMany(
    { room_id: new ObjectId(roomId), left_at: null },
    { $set: { left_at: new Date() } }
  );
}

async function findActive(roomId) {
  return col()
    .find({ room_id: new ObjectId(roomId), left_at: null })
    .sort({ joined_at: 1 })
    .toArray();
}

async function countActive(roomId) {
  return col().countDocuments({
    room_id: new ObjectId(roomId),
    left_at: null,
  });
}

async function findById(id) {
  return col().findOne({ _id: new ObjectId(id) });
}

module.exports = { joinOrCreate, leave, leaveAllInRoom, findActive, countActive, findById };
