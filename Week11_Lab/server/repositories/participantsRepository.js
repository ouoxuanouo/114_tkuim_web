import { getDb, ObjectId } from '../db.js';

const COLLECTION = 'participants';

export async function createParticipant(data) {
  const db = await getDb();
  data.createdAt = new Date();
  data.updatedAt = new Date();
  const result = await db.collection(COLLECTION).insertOne(data);
  return { ...data, _id: result.insertedId };
}

export async function getParticipants({ page, limit }) {
  const db = await getDb();
  const skip = (page - 1) * limit;
  const col = db.collection(COLLECTION);
  const items = await col.find().skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
  const total = await col.countDocuments();
  return { items, total };
}

export async function updateParticipant(id, fields) {
  const db = await getDb();
  const _id = new ObjectId(id);
  fields.updatedAt = new Date();
  const r = await db.collection(COLLECTION).findOneAndUpdate(
    { _id }, { $set: fields }, { returnDocument: 'after' }
  );
  return r.value;
}

export async function deleteParticipant(id) {
  const db = await getDb();
  const _id = new ObjectId(id);
  const r = await db.collection(COLLECTION).deleteOne({ _id });
  return r.deletedCount;
}
