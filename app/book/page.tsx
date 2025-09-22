"use client";

import React, { useState, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from 'lucide-react';

const LOCATIONS = [
  {
    name: "Narwal Clinic",
    address: "Shop 12, Shreeji Heights, Chandavarkar Road, Borivali West, Mumbai 400092",
    image: "/clinic1.jpg",
    timings: [
      "09:00 AM - 01:00 PM (Morning)",
      "05:00 PM - 09:00 PM (Evening)"
    ],
    location: "Borivali"
  },
  {
    name: "Dr.Narwal Clinic",
    address: "Ground Floor, Harmony Plaza, Daftary Road, Malad East, Mumbai 400097",
    image: "/clinic2.jpg",
    timings: [
      "09:00 AM - 01:00 PM"
    ],
    location: "Malad"
  },
  {
    name: "Shraddha Clinic",
    address: "Shop 5, Sai Darshan Complex, Maxus Mall Road, Bhayander West, Mumbai 401101",
    image: "/clinic3.jpeg",
    timings: [
      "10:00 AM - 02:00 PM"
    ],
    location: "Bhayander"
  },
];

const getHourlySlots = (timingArr: string[]) => {
  // Example: ["09:00 AM - 01:00 PM (Morning)", "05:00 PM - 09:00 PM (Evening)"]
  // Returns: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"]
  const slots: string[] = [];
  timingArr.forEach((range) => {
    const match = range.match(/(\d{2}:\d{2} [AP]M) - (\d{2}:\d{2} [AP]M)/);
    if (!match) return;
    let [_, start, end] = match;
    let [startHour, startMin, startPeriod] = start.match(/(\d{2}):(\d{2}) ([AP]M)/)!.slice(1);
    let [endHour, endMin, endPeriod] = end.match(/(\d{2}):(\d{2}) ([AP]M)/)!.slice(1);
    let hour = parseInt(startHour, 10);
    let min = parseInt(startMin, 10);
    let period = startPeriod;
    while (true) {
      slots.push(`${hour.toString().padStart(2, "0")}:00 ${period}`);
      if (`${hour}:${min} ${period}` === `${endHour}:${endMin} ${endPeriod}`) break;
      hour++;
      if (hour === 12) period = period === "AM" ? "PM" : "AM";
      if (hour > 12) hour = 1;
    }
  });
  return slots;
};

const BookPage = () => {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const locationRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timingRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Animation handlers
  const handleCardEnter = (ref: HTMLButtonElement | null) => {
    if (ref) {
      gsap.to(ref, { scale: 1.04, boxShadow: "0 8px 24px 0 rgba(37, 99, 235, 0.15)", duration: 0.25 });
    }
  };
  const handleCardLeave = (ref: HTMLButtonElement | null) => {
    if (ref) {
      gsap.to(ref, { scale: 1, boxShadow: "0 1px 4px 0 rgba(37, 99, 235, 0.08)", duration: 0.2 });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pt-6 px-2 relative">
      {/* Back Button */}
      <button
        className="absolute left-2 top-4 flex items-center text-blue-700 bg-white rounded-full shadow p-2 z-10"
        onClick={() => router.push('/')} // Go to homepage
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h1 className="text-xl font-bold text-blue-800 mb-4 text-center w-full">Book Your Appointment</h1>
      {selectedLocation === null ? (
        <>
          <div className="w-full flex flex-col gap-4">
            {LOCATIONS.map((loc, i) => (
              <div
                key={loc.name}
                className="w-full bg-white rounded-xl shadow border border-blue-200 p-3 flex flex-col items-center gap-2 mb-2"
              >
                <div className="w-full flex justify-center">
                  <Image src={loc.image} alt={loc.name} width={320} height={120} className="rounded-lg object-cover w-full h-28 mb-2" />
                </div>
                <div className="w-full flex flex-col items-start px-2">
                  <span className="font-bold text-blue-800 text-lg mb-1">{loc.name}</span>
                  <span className="text-xs text-gray-500 mb-2">{loc.address}</span>
                  <span className="text-sm text-gray-700 mb-3">Timings: {loc.timings.join(", ")}</span>
                  <button
                    ref={el => { locationRefs.current[i] = el; }}
                    className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition flex items-center justify-center gap-2 mt-1"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('selectedClinic', JSON.stringify({ name: loc.name, location: loc.location }));
                      }
                      router.push('/book/slot');
                    }}
                    onMouseEnter={() => handleCardEnter(locationRefs.current[i])}
                    onMouseLeave={() => handleCardLeave(locationRefs.current[i])}
                    onTouchStart={() => handleCardEnter(locationRefs.current[i])}
                    onTouchEnd={() => handleCardLeave(locationRefs.current[i])}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default BookPage; 