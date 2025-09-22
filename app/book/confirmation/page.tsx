"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use state to allow hydration from sessionStorage
  const [details, setDetails] = useState({
    visitNo: searchParams.get("visitNo") || "",
    name: searchParams.get("name") || "",
    contact: searchParams.get("contact") || "",
    clinic: searchParams.get("clinic") || "",
    location: searchParams.get("location") || "",
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || "",
    payment: searchParams.get("payment") || "",
  });

  useEffect(() => {
    // If any field is missing, try to get from sessionStorage
    if (
      !details.name ||
      !details.contact ||
      !details.clinic ||
      !details.location
    ) {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("bookingDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          setDetails((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    }
    // Set a timer to clear bookingDetails after 5 minutes
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("bookingDetails");
      }
    }, 300000); // 5 minutes
    return () => clearTimeout(timer);
  }, []);

  // Handler for Home button to clear sessionStorage immediately
  const handleHome = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("bookingDetails");
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pt-6 px-2">
      <h1 className="text-xl font-bold text-blue-800 mb-4 text-center w-full">Appointment Confirmed!</h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mt-4 flex flex-col items-center">
        <h2 className="text-lg font-bold text-blue-800 mb-2">Thank you!</h2>
        {/* Clinic Details */}
        <p className="mb-2 text-gray-700">Clinic: <span className="font-semibold">{details.clinic}</span></p>
        <p className="mb-2 text-gray-700">Location: <span className="font-semibold">{details.location}</span></p>
        {/* Patient Details */}
        <p className="mb-2 text-gray-700">Name: <span className="font-semibold">{details.name}</span></p>
        {details.contact && <p className="mb-2 text-gray-700">Contact: <span className="font-semibold">{details.contact}</span></p>}
        {/* Booking Details */}
        <p className="mb-2 text-gray-700">Date: <span className="font-semibold">{details.date}</span></p>
        <p className="mb-2 text-gray-700">Time: <span className="font-semibold">{details.time}</span></p>
        {/* Payment Mode */}
        <p className="mb-2 text-gray-700">Payment Method: <span className="font-semibold">{details.payment}</span></p>
        {/* Visit Number for new patients */}
        {details.visitNo ? (
          <>
            <p className="mb-2 text-gray-700">Your Visit Number: <span className="font-semibold">{details.visitNo}</span></p>
            <p className="text-gray-700">Please save this number for future visits.</p>
          </>
        ) : (
          <p className="text-gray-700">Thank you for booking your appointment!</p>
        )}
        <button
          className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition"
          onClick={handleHome}
        >
          Home
        </button>
      </div>
    </div>
  );
} 