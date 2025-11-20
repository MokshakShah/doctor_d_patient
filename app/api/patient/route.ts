import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
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

function generateVisitNo(lastNo: string | null) {
  let num = 1;
  if (lastNo && /^D-\d{8}$/.test(lastNo)) {
    num = parseInt(lastNo.slice(2), 10) + 1;
  }
  return `D-${num.toString().padStart(8, '0')}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('Received patient data:', body); // Debug log
  const client = await connectToDB();
  const db = client.db(dbName);
  const location = body.location as string;
  const collectionName = locationCollections[location as keyof typeof locationCollections] || 'Patients_history_other';
  const patients = db.collection(collectionName);

  // Check closed days for this clinic/date before accepting booking
  try {
    const closedCol = db.collection('closed_days');
  // match closed entries for All or either the clinic name or the location value
  const cands = await closedCol.find({ $or: [{ branch: 'All' }, { branch: body.clinic }, { branch: body.location }] }).toArray();
    if (Array.isArray(cands) && cands.length > 0 && body.date) {
      const target = new Date(body.date);
      const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
      for (const c of cands) {
        if (c.date) {
          const cd = new Date(c.date);
          const cdDay = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate()).getTime();
          if (cdDay === targetDay) {
            return NextResponse.json({ error: 'Clinic closed on this date', reason: c.reason || '' }, { status: 400 });
          }
        } else if (c.dateFrom) {
          const from = new Date(c.dateFrom);
          const to = c.dateTo ? new Date(c.dateTo) : new Date(c.dateFrom);
          const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
          const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
          if (targetDay >= fromDay && targetDay <= toDay) {
            return NextResponse.json({ error: 'Clinic closed on this date', reason: c.reason || '' }, { status: 400 });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Unable to validate closed_days before booking', err);
  }

  // If visitNo is provided, treat as existing patient booking
  if (body.visitNo) {
    // Append new appointment to the patient's appointments array
    await patients.updateOne(
      { visitNo: body.visitNo },
      {
        $push: {
          appointments: {
            clinic: body.clinic,
            location: body.location,
            date: body.date,
            time: body.time,
          },
        },
      } as any
    );
    // Record the payment (only if not skipped)
    if (!body.skipPayment && body.payment) {
      const paymentRecord = {
        visitNo: body.visitNo,
        clinic: body.clinic,
        location: body.location,
        date: body.date,
        time: body.time,
        payment: body.payment,
        createdAt: new Date(),
      };
      await db.collection('payment_record').insertOne(paymentRecord);
    }
    return NextResponse.json({ visitNo: body.visitNo });
  }

  // New patient registration
  // Find last visit number in this collection
  const last = await patients.find().sort({ visitNo: -1 }).limit(1).toArray();
  const lastNo = last.length > 0 ? last[0].visitNo : null;
  const visitNo = generateVisitNo(lastNo);

  const patient = {
    visitNo,
    name: body.name,
    dob: body.dob,
    age: body.age, // calculated on frontend, optional for display
    bloodGroup: body.bloodGroup,
    gender: body.gender,
    contact: body.contact,
    medicalConditions: body.medicalConditions,
    allergy: body.allergy,
    familyHistory: body.familyHistory,
    appointments: [
      {
        clinic: body.clinic,
        location: body.location,
        date: body.date,
        time: body.time,
      },
    ],
    createdAt: new Date(),
  };
  await patients.insertOne(patient);

  // Insert payment record in payment_record collection (only if not skipped)
  if (!body.skipPayment && body.payment) {
    const paymentRecord = {
      visitNo,
      clinic: body.clinic,
      location: body.location,
      date: body.date,
      time: body.time,
      payment: body.payment,
      createdAt: new Date(),
    };
    await db.collection('payment_record').insertOne(paymentRecord);
  }

  return NextResponse.json({ visitNo: patient.visitNo });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visitNo = searchParams.get('visitNo');
  const location = searchParams.get('location');
  if (!visitNo) return NextResponse.json({ error: 'Visit number required' }, { status: 400 });
  if (!location) return NextResponse.json({ error: 'Location required' }, { status: 400 });
  const client = await connectToDB();
  const db = client.db(dbName);
  const collectionName = locationCollections[location as keyof typeof locationCollections] || 'Patients_history_other';
  const patients = db.collection(collectionName);
  const patient = await patients.findOne({ visitNo });
  if (patient) return NextResponse.json(patient);
  return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
} 