import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';

config();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

export async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
  }
  return db;
}

export { ObjectId };
