"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';

const initialForm = {
  name: "",
  dob: "",
  bloodGroup: "",
  gender: "",
  contact: "",
  medicalConditions: "",
  allergy: "",
  familyHistory: "",
};

const PatientDetailsPage = () => {
  const searchParams = useSearchParams();
  const clinic = searchParams.get("clinic") || "";
  const location = searchParams.get("location") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const [isNew, setIsNew] = useState<null | boolean>(null);
  const [visitNo, setVisitNo] = useState("");
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<{ dob?: string; contact?: string; gender?: string; bloodGroup?: string }>({});
  const [calculatedAge, setCalculatedAge] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<{
    name?: string;
    age?: string;
    gender?: string;
    dob?: string;
    bloodGroup?: string;
    medicalConditions?: string;
    allergy?: string;
    familyHistory?: string;
    contact?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const paymentOptions = [
    { value: "cash", label: "Cash on Service" },
    { value: "online", label: "Online Payment" },
    { value: "upi", label: "UPI/QR Code" },
  ];
  const [payment, setPayment] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [newVisitNo, setNewVisitNo] = useState("");

  // const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Restrict contact to max 10 digits, only numbers
    if (name === 'contact') {
      if (!/^\d{0,10}$/.test(value)) return;
    }
    if (name === 'dob') {
      // Calculate age from dob
      if (value) {
        const today = new Date();
        const dobDate = new Date(value);
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        setCalculatedAge(age >= 0 ? age.toString() : "");
      } else {
        setCalculatedAge("");
      }
    }
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const errors: { dob?: string; contact?: string; gender?: string; bloodGroup?: string } = {};
    if (!form.dob) errors.dob = 'Enter date of birth';
    if (!form.bloodGroup) errors.bloodGroup = 'Select blood group';
    if (!/^\d{10}$/.test(form.contact)) errors.contact = 'Contact must be exactly 10 digits';
    if (!form.gender) errors.gender = 'Select gender';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    // Immediately store patient details in MongoDB (without payment record)
    const res = await fetch("/api/patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: calculatedAge, clinic, location, date, time, skipPayment: true }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.visitNo) {
      setNewVisitNo(data.visitNo);
      setShowPayment(true);
    } else {
      setError("Failed to register patient. Please try again.");
    }
  };

  const handleOldPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPatientData(null);
    setTimeout(async () => {
      const res = await fetch(`/api/patient?visitNo=${visitNo}&location=${location}`);
      const data = await res.json();
      setLoading(false);
      if (data.error) {
        setError("Patient not found. Please check your visit number.");
      } else {
        setPatientData(data);
        setShowPayment(true);
      }
    }, 5000);
  };

  const handleBook = async () => {
    if (!payment) return;
    if (isNew) {
      if (payment === 'online' || payment === 'upi') {
        // Prepare success and cancel URLs
        const params = new URLSearchParams({
          visitNo: newVisitNo,
          name: form.name,
          date,
          time,
          payment,
        });
        const success_url = `${window.location.origin}${window.location.pathname}?payment=success&${params.toString()}`;
        const cancel_url = `${window.location.origin}${window.location.pathname}?payment=cancel`;

        // Store booking details in sessionStorage for confirmation page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('bookingDetails', JSON.stringify({
            visitNo: newVisitNo,
            name: form.name,
            contact: form.contact,
            clinic,
            location,
            date,
            time,
            payment,
          }));
        }

        const res = await fetch('/api/payment/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success_url, cancel_url }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          setError('Failed to initiate payment. Please try again.');
          return;
        }
      } else {
        // Cash payment: update patient record with payment and appointment info
        const res = await fetch("/api/patient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitNo: newVisitNo, clinic, location, date, time, payment }),
        });
        const data = await res.json();
        if (data.visitNo) {
          setPatientId(data.visitNo);
          setSubmitted(true);
        } else {
          setError("Failed to update patient with payment. Please try again.");
        }
        return;
      }
    }
    // Existing patient
    if (payment === 'online' || payment === 'upi') {
      // Prepare success and cancel URLs
      const params = new URLSearchParams({
        visitNo,
        name: patientData?.name || '',
        date,
        time,
        payment,
      });
      const success_url = `${window.location.origin}${window.location.pathname}?payment=success&${params.toString()}`;
      const cancel_url = `${window.location.origin}${window.location.pathname}?payment=cancel`;

      // Store booking details in sessionStorage for confirmation page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bookingDetails', JSON.stringify({
          visitNo,
          name: patientData?.name || '',
          contact: patientData?.contact || '',
          clinic,
          location,
          date,
          time,
          payment,
        }));
      }

      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success_url, cancel_url }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      } else {
        setError('Failed to initiate payment. Please try again.');
        return;
      }
    } else {
      // Cash payment: record appointment and payment, include all details
      const res = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...patientData,
          clinic,
          location,
          date,
          time,
          payment,
          visitNo, // ensure visitNo is present
        }),
      });
      const data = await res.json();
      if (data.visitNo) {
        setSubmitted(true);
      } else {
        setError("Failed to book appointment. Please try again.");
      }
    }
  };

  // Helper to format date as dd-mm-yyyy
  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('payment') === 'success') && !submitted) {
      // For new patients, update payment info after payment
      if (isNew && newVisitNo) {
        fetch("/api/patient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitNo: newVisitNo, clinic, location, date, time, payment: payment || 'online' }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.visitNo) {
              setPatientId(data.visitNo);
              setSubmitted(true);
              window.location.href = `/book/confirmation?visitNo=${data.visitNo}&name=${form.name}&date=${date}&time=${time}&payment=${payment || 'online'}`;
            } else {
              setError("Failed to update patient with payment after payment. Please try again.");
            }
          });
      }
      // Try to get all booking details from state, fallback to sessionStorage if missing
      let bookingData;
      if (
        !form.name ||
        !clinic ||
        !location ||
        !date ||
        !time ||
        !payment
      ) {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('bookingDetails') : null;
        const newPatientStored = typeof window !== 'undefined' ? sessionStorage.getItem('newPatientDetails') : null;
        if (stored && isNew && newPatientStored) {
          const parsed = JSON.parse(stored);
          const newPatientParsed = JSON.parse(newPatientStored);
          bookingData = { ...newPatientParsed, ...parsed, payment: payment || 'online' };
        } else if (stored) {
          const parsed = JSON.parse(stored);
          bookingData = isNew
            ? { ...form, ...parsed, age: calculatedAge, payment: payment || 'online' }
            : { visitNo, ...parsed, payment: payment || 'online' };
        } else if (newPatientStored && isNew) {
          const newPatientParsed = JSON.parse(newPatientStored);
          bookingData = { ...newPatientParsed, payment: payment || 'online' };
        } else {
          bookingData = isNew
            ? { ...form, clinic, location, date, time, payment: payment || 'online', age: calculatedAge }
            : { visitNo, clinic, location, date, time, payment: payment || 'online' };
        }
      } else {
        bookingData = isNew
          ? { ...form, clinic, location, date, time, payment: payment || 'online', age: calculatedAge }
          : { visitNo, clinic, location, date, time, payment: payment || 'online' };
      }
      fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })
        .then(res => res.json())
        .then(data => {
          if (data.visitNo) {
            // Remove new patient details from sessionStorage after successful save
            if (typeof window !== 'undefined' && isNew) {
              sessionStorage.removeItem('newPatientDetails');
            }
            // Debug log
            console.log('Sent bookingData to backend:', bookingData);
            // Redirect to confirmation page with details
            const name = isNew ? (bookingData.name || form.name) : (patientData && patientData.name) || '';
            const query = new URLSearchParams({
              visitNo: data.visitNo,
              name,
              date: bookingData.date || date,
              time: bookingData.time || time,
              payment: payment || 'online',
            }).toString();
            window.location.href = `/book/confirmation?${query}`;
          } else {
            setError("Failed to register patient. Please try again.");
          }
        });
    }
  }, [newVisitNo, payment, submitted]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pt-6 px-2 relative">
      {/* Back Button */}
      {(!submitted && !patientData) && (
        <button
          className="absolute left-2 top-4 flex items-center text-blue-700 bg-white rounded-full shadow p-2 z-10"
          onClick={() => window.location.href = '/book/slot'}
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="text-xl font-bold text-blue-800 mb-4 text-center w-full">Appointment Details</h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mb-4">
        <div className="mb-2 text-sm text-gray-700">Clinic: <span className="font-semibold">{clinic}</span></div>
        <div className="mb-2 text-sm text-gray-700">Location: <span className="font-semibold">{location}</span></div>
        <div className="mb-2 text-sm text-gray-700">Date: <span className="font-semibold">{date}</span></div>
        <div className="mb-2 text-sm text-gray-700">Time: <span className="font-semibold">{time}</span></div>
      </div>
      {isNew === null && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 flex flex-col items-center">
          <p className="mb-4 text-base text-gray-700">Are you a new patient?</p>
          <div className="flex gap-4">
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => setIsNew(true)}>Yes</button>
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => setIsNew(false)}>No</button>
          </div>
        </div>
      )}
      {isNew === true && !submitted && !showPayment && (
        <form className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4" onSubmit={handleNewPatientSubmit}>
          <h2 className="text-lg font-bold text-blue-800 mb-2">Patient Registration</h2>
          <input name="name" placeholder="Name" className="w-full mb-2 p-2 border rounded" value={form.name} onChange={handleFormChange} required />
          <input name="dob" type="date" placeholder="Date of Birth" className="w-full mb-2 p-2 border rounded" value={form.dob} onChange={handleFormChange} required />
          {formErrors.dob && <div className="text-red-500 text-xs mb-2">{formErrors.dob}</div>}
          <div className="w-full mb-2 p-2 border rounded bg-gray-100 text-gray-700">Age: {calculatedAge ? calculatedAge : '--'}</div>
          <select name="bloodGroup" className="w-full mb-2 p-2 border rounded" value={form.bloodGroup} onChange={handleFormChange} required>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          {formErrors.bloodGroup && <div className="text-red-500 text-xs mb-2">{formErrors.bloodGroup}</div>}
          <select name="gender" className="w-full mb-2 p-2 border rounded" value={form.gender} onChange={handleFormChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
          </select>
          {formErrors.gender && <div className="text-red-500 text-xs mb-2">{formErrors.gender}</div>}
          <input name="contact" placeholder="Contact" className="w-full mb-2 p-2 border rounded" value={form.contact} onChange={handleFormChange} required inputMode="numeric" />
          {formErrors.contact && <div className="text-red-500 text-xs mb-2">{formErrors.contact}</div>}
          <textarea name="medicalConditions" placeholder="Medical Conditions" className="w-full mb-2 p-2 border rounded" value={form.medicalConditions} onChange={handleFormChange} required />
          <textarea name="allergy" placeholder="Allergy" className="w-full mb-2 p-2 border rounded" value={form.allergy} onChange={handleFormChange} required />
          <textarea name="familyHistory" placeholder="Family History" className="w-full mb-2 p-2 border rounded" value={form.familyHistory} onChange={handleFormChange} required />
          <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold mt-2">Submit</button>
          {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
        </form>
      )}
      {isNew === true && !submitted && showPayment && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4 flex flex-col items-center">
          <h2 className="text-lg font-bold text-blue-800 mb-2">Select Payment Method</h2>
          <div className="flex flex-col gap-2 w-full mb-4">
            {paymentOptions.map(opt => (
              <label key={opt.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${payment === opt.value ? 'bg-blue-100 border-blue-700' : 'bg-white border-blue-200'}`}>
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={payment === opt.value}
                  onChange={() => setPayment(opt.value)}
                  className="accent-blue-700"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <button
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition disabled:opacity-50"
            disabled={!payment}
            onClick={handleBook}
          >
            Book
          </button>
          {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
        </div>
      )}
      {isNew === true && submitted && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4 flex flex-col items-center">
          <h2 className="text-lg font-bold text-blue-800 mb-2">Thank you!</h2>
          <p className="mb-2 text-gray-700">Your Visit Number: <span className="font-semibold">{patientId}</span></p>
          <p className="mb-2 text-gray-700">Name: <span className="font-semibold">{form.name}</span></p>
          <p className="mb-2 text-gray-700">DOB: <span className="font-semibold">{form.dob}</span></p>
          <p className="mb-2 text-gray-700">Age: <span className="font-semibold">{calculatedAge}</span></p>
          <p className="mb-2 text-gray-700">Blood Group: <span className="font-semibold">{form.bloodGroup}</span></p>
          <p className="mb-2 text-gray-700">Gender: <span className="font-semibold">{form.gender}</span></p>
          <p className="mb-2 text-gray-700">Current Booking: <span className="font-semibold">{formatDate(date)} at {time}</span></p>
          <p className="mb-2 text-gray-700">Payment Method: <span className="font-semibold">{payment}</span></p>
          <p className="text-gray-700">Please save this number for future visits.</p>
          <button
            className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition"
            onClick={() => window.location.href = '/'}
          >
            Home
          </button>
        </div>
      )}
      {isNew === false && !patientData && (
        <form className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4" onSubmit={handleOldPatientSubmit}>
          <h2 className="text-lg font-bold text-blue-800 mb-2">Enter Visit Number</h2>
          <input name="visitNo" placeholder="Visit Number" className="w-full mb-2 p-2 border rounded" value={visitNo} onChange={e => setVisitNo(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold mt-2">Submit</button>
          {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
        </form>
      )}
      {loading && (
        <div className="w-full max-w-md flex flex-col items-center mt-4">
          <div className="loader mb-2"></div>
          <div className="text-blue-700">Loading patient data...</div>
        </div>
      )}
      {patientData && !submitted && !confirmed && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4 flex flex-col items-center">
          <h2 className="text-lg font-bold text-blue-800 mb-2">Patient Details</h2>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Name:</span> {patientData.name || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Age:</span> {patientData.age || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Gender:</span> {patientData.gender || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">DOB:</span> {patientData.dob || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Blood Group:</span> {patientData.bloodGroup || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Medical Conditions:</span> {patientData.medicalConditions || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Allergy:</span> {patientData.allergy || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Family History:</span> {patientData.familyHistory || '--'}</div>
          <button className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => setConfirmed(true)}>Proceed</button>
        </div>
      )}
      {patientData && !submitted && confirmed && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4 flex flex-col items-center">
          <h2 className="text-lg font-bold text-blue-800 mb-2">Select Payment Method</h2>
          <div className="flex flex-col gap-2 w-full mb-4">
            {paymentOptions.map(opt => (
              <label key={opt.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${payment === opt.value ? 'bg-blue-100 border-blue-700' : 'bg-white border-blue-200'}`}>
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={payment === opt.value}
                  onChange={() => setPayment(opt.value)}
                  className="accent-blue-700"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <button
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition disabled:opacity-50"
            disabled={!payment}
            onClick={handleBook}
          >
            Book
          </button>
        </div>
      )}
      {isNew === false && submitted && patientData && (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4">
          <h2 className="text-lg font-bold text-blue-800 mb-2">Patient Details</h2>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Name:</span> {patientData.name || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Age:</span> {patientData.age || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Gender:</span> {patientData.gender || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">DOB:</span> {patientData.dob || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Blood Group:</span> {patientData.bloodGroup || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Medical Conditions:</span> {patientData.medicalConditions || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Allergy:</span> {patientData.allergy || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Family History:</span> {patientData.familyHistory || '--'}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Current Booking:</span> {formatDate(date)} at {time}</div>
          <div className="mb-2 text-gray-700"><span className="font-semibold">Payment Method:</span> {payment}</div>
          <button
            className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition"
            onClick={() => window.location.href = '/'}
          >
            Home
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage; 