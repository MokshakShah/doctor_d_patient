import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'Patient';
const locationCollections = {
  Borivali: 'Patients_history_borivali',
  Malad: 'Patients_history_malad',
  Bhayander: 'Patients_history_bhayander',
};

let cachedClient: MongoClient | null = null;

async function connectToDB() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinic = searchParams.get('clinic');
  const location = searchParams.get('location');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  if (!clinic || !location || !date || !time) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  const client = await connectToDB();
  const db = client.db(dbName);
  const collectionName = locationCollections[location as keyof typeof locationCollections] || 'Patients_history_other';
  const patients = db.collection(collectionName);
  const count = await patients.countDocuments({
    'appointments.clinic': clinic,
    'appointments.location': location,
    'appointments.date': date,
    'appointments.time': time,
  });
  return NextResponse.json({ count });
} 
