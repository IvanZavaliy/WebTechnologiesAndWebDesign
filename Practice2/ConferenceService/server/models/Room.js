const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const col = () => getDb().collection('rooms');

async function create(name) {
  const doc = {
    name,
    closed: false,
    closed_at: null,
    created_at: new Date(),
  };
  const result = await col().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function findAll() {
  return col().find().sort({ created_at: -1 }).toArray();
}

async function findById(id) {
  return col().findOne({ _id: new ObjectId(id) });
}

async function closeRoom(id) {
  const result = await col().updateOne(
    { _id: new ObjectId(id), closed: false },
    { $set: { closed: true, closed_at: new Date() } }
  );
  return result.modifiedCount > 0;
}

async function deleteRoom(id) {
  const result = await col().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = { create, findAll, findById, closeRoom, deleteRoom };
