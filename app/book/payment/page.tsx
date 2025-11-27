"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const paymentOptions = [
  { value: "cash", label: "Cash on Service" },
  { value: "online", label: "Online Payment" },
  { value: "upi", label: "UPI/QR Code" },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinic = searchParams.get("clinic") || "";
  const location = searchParams.get("location") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const [payment, setPayment] = useState("");

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pt-6 px-2">
      <h1 className="text-xl font-bold text-blue-800 mb-4 text-center w-full">Payment Method</h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mb-4 flex flex-col items-center">
        <div className="mb-2 text-base text-blue-800 font-semibold">{clinic}</div>
        <div className="mb-2 text-sm text-gray-700">Location: <span className="font-semibold">{location}</span></div>
        <div className="mb-2 text-sm text-gray-700">Date: <span className="font-semibold">{date}</span></div>
        <div className="mb-2 text-sm text-gray-700">Time: <span className="font-semibold">{time}</span></div>
        <div className="mb-4 text-gray-700 font-medium">How will you make the payment?</div>
        <div className="flex flex-col gap-2 w-full">
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
          className="mt-6 w-full bg-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition disabled:opacity-50"
          disabled={!payment}
          onClick={() => router.push(`/book/details?clinic=${encodeURIComponent(clinic)}&location=${encodeURIComponent(location)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&payment=${encodeURIComponent(payment)}`)}
        >
          Book
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <PaymentContent />
    </Suspense>
  );
} 