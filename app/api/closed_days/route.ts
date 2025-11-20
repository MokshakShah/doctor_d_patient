import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = 'Patient';
let cachedClient: MongoClient | null = null;
async function connectToDB() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function GET(req: NextRequest) {
  try {
    const client = await connectToDB();
    const db = client.db(dbName);
    const col = db.collection('closed_days');
    const docs = await col.find({}).toArray();
    return NextResponse.json({ closedDays: docs });
  } catch (err) {
    console.error('GET closed_days error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
