"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getBookingDates(clinicObj: { name: string; location: string } | null, closedDays: any[] = []) {
  const today = new Date();
  const dates: Date[] = [];
  let i = 3; // Start from 3 days after today
  const isClosed = (d: Date) => {
    try {
      const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      for (const c of closedDays || []) {
        const branch = c.branch || '';
        // Match branch against clinic name or clinic location (branch values come from nurse dashboard as locations)
        if (!(branch === 'All' || (clinicObj && (branch === clinicObj.name || branch === clinicObj.location)))) continue;
        if (c.date) {
          const cd = new Date(c.date);
          const cdDay = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate()).getTime();
          if (cdDay === target) return true;
        } else if (c.dateFrom) {
          const from = new Date(c.dateFrom);
          const to = c.dateTo ? new Date(c.dateTo) : new Date(c.dateFrom);
          const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
          const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
          if (target >= fromDay && target <= toDay) return true;
        }
      }
    } catch (err) {
      console.error('isClosed check error', err);
    }
    return false;
  };

  while (dates.length < 5) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay();
    // Skip Sunday(0) only (Saturdays are now allowed)
    if (day === 0) {
      i++;
      continue;
    }
    // Skip closed days for this clinic
    if (isClosed(d)) {
      i++;
      continue;
    }
    dates.push(new Date(d));
    i++;
  }
  return dates;
}

const CLINIC_TIMINGS: Record<string, string[]> = {
  "Narwal Clinic": ["09:00 AM - 01:00 PM (Morning)", "05:00 PM - 09:00 PM (Evening)"],
  "Dr.Narwal Clinic": ["09:00 AM - 01:00 PM"],
  "Bhayander Clinic": ["10:00 AM - 02:00 PM"],
  "Shraddha Clinic": ["10:00 AM - 02:00 PM"],
};

function getHourlySlots(timingArr: string[] | undefined) {
  if (!Array.isArray(timingArr) || timingArr.length === 0) return [];
  const slots: string[] = [];
  timingArr.forEach((range) => {
    // Remove any label like (Morning) or (Evening)
    const cleanRange = range.replace(/\([^)]*\)/g, '').trim();
    const match = cleanRange.match(/(\d{2}:\d{2} [AP]M) - (\d{2}:\d{2} [AP]M)/);
    if (!match) return;
    let [_, start, end] = match;
    // Convert to Date objects for easier math
    const toDate = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hour, min] = time.split(':').map(Number);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const d = new Date(2000, 0, 1, hour, min);
      return d;
    };
    let startDate = toDate(start);
    let endDate = toDate(end);
    // Generate slots at 60-minute intervals
    let slotDate = new Date(startDate);
    let safety = 0;
    while (slotDate < endDate && safety < 24) {
      const hour = slotDate.getHours();
      const min = slotDate.getMinutes();
      let period = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const slotStr = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
      slots.push(slotStr);
      slotDate.setHours(slotDate.getHours() + 1);
      safety++;
    }
  });
  return slots;
}

export default function SlotPage() {
  const router = useRouter();
  const [clinic, setClinic] = useState<{ name: string; location: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dates, setDates] = useState<Date[]>([]);
  const [closedDays, setClosedDays] = useState<any[]>([]);
  const [closedReasonForSelected, setClosedReasonForSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedClinic = sessionStorage.getItem('selectedClinic');
      if (storedClinic) {
        const parsed = JSON.parse(storedClinic);
        setClinic(parsed);
        const timings = CLINIC_TIMINGS[parsed.name];
        setSlots(getHourlySlots(timings));
      }
    }
    // fetch closed days
    (async () => {
      try {
        const res = await fetch('/api/closed_days');
        if (!res.ok) return;
        const j = await res.json();
        setClosedDays(j.closedDays || []);
      } catch (err) {
        console.error('Failed to fetch closed days', err);
      }
    })();
  }, []);

  // whenever clinic or closedDays change, recompute available booking dates
  useEffect(() => {
    if (!clinic) return;
    try {
      const computed = getBookingDates(clinic, closedDays || []);
      setDates(computed);
    } catch (err) {
      console.error('Failed to compute booking dates', err);
    }
  }, [clinic, closedDays]);

  // Fetch slot counts when date or slots change
  useEffect(() => {
    if (!clinic || !selectedDate || slots.length === 0) return;
    // if selected date is closed, skip fetching slot counts
    const isClosed = checkDateClosedForClinic(selectedDate, clinic, closedDays);
    if (isClosed) {
      setSlotCounts({});
      setClosedReasonForSelected(isClosed.reason || 'Closed');
      return;
    } else {
      setClosedReasonForSelected(null);
    }
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(slots.map(async (slot) => {
        const params = new URLSearchParams({
          clinic: clinic.name,
          location: clinic.location,
          date: selectedDate,
          time: slot,
        });
        const res = await fetch(`/api/patient/slotCount?${params.toString()}`);
        const data = await res.json();
        counts[slot] = data.count || 0;
      }));
      setSlotCounts(counts);
    };
    fetchCounts();
  }, [clinic, selectedDate, slots]);

  function parseDateOnly(d: Date | string) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  function checkDateClosedForClinic(dateStr: string, clinicObj: { name: string; location: string } | null, closedArr: any[]) {
    if (!clinicObj) return false;
    try {
      const d = new Date(dateStr);
      const target = parseDateOnly(d).getTime();
      for (const c of closedArr || []) {
        const branch = c.branch || '';
        if (!(branch === 'All' || branch === clinicObj.name || branch === clinicObj.location)) continue;
        if (c.date) {
          const cd = parseDateOnly(new Date(c.date)).getTime();
          if (cd === target) return { closed: true, reason: c.reason || '' , reasonRaw: c };
        } else if (c.dateFrom) {
          const from = parseDateOnly(new Date(c.dateFrom)).getTime();
          const to = parseDateOnly(new Date(c.dateTo || c.dateFrom)).getTime();
          if (target >= from && target <= to) return { closed: true, reason: c.reason || '', reasonRaw: c };
        }
      }
    } catch (err) {
      console.error('checkDateClosed error', err);
    }
    return false;
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
        <div className="text-red-500">No clinic selected. Please go back and choose a clinic.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pt-6 px-2">
      <h1 className="text-xl font-bold text-blue-800 mb-4 text-center w-full">Book a Slot</h1>
      <div className="w-full max-w-md bg-white rounded-xl shadow p-4 border border-blue-200 mb-4">
        <div className="mb-2 text-base text-blue-800 font-semibold">{clinic.name}</div>
        <div className="mb-4 text-sm text-gray-700">Location: <span className="font-semibold">{clinic.location}</span></div>
        <div className="mb-2 text-gray-700 font-medium">Choose a date for booking:</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
            {dates.map((date) => {
              const dateStr = date.toISOString().slice(0, 10);
              const closed = checkDateClosedForClinic(dateStr, clinic, closedDays);
              const isDisabled = !!closed;
              return (
                <button
                  key={dateStr}
                  className={`rounded-lg p-2 border text-center font-semibold shadow-sm transition-all ${selectedDate === dateStr ? 'bg-blue-700 text-white' : isDisabled ? 'bg-red-100 text-red-700 line-through' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                  onClick={() => { if (!isDisabled) { setSelectedDate(dateStr); setSelectedTime(""); } }}
                  disabled={isDisabled}
                  title={isDisabled ? (closed.reason || 'Closed') : ''}
                >
                  <div className="text-xs">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className="text-base">{date.getDate()}</div>
                  <div className="text-xs">{date.toLocaleDateString(undefined, { month: 'short' })}</div>
                  {isDisabled && <div className="text-[10px] mt-1">Closed</div>}
                </button>
              );
            })}
        </div>
        {selectedDate && (
          <>
            <div className="mb-2 text-gray-700 font-medium">Choose a time slot:</div>
            {closedReasonForSelected ? (
              <div className="text-red-600 mb-4">This clinic is closed on the selected date: {closedReasonForSelected}</div>
            ) : slots.length === 0 ? (
              <div className="text-red-500 mb-4">No slots available for this clinic. Please choose another clinic or date.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {slots.map((slot) => {
                    const isFull = slotCounts[slot] >= 10;
                    return (
                      <button
                        key={slot}
                        className={`rounded-lg p-2 border text-center font-semibold shadow-sm transition-all ${isFull ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : selectedTime === slot ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                        onClick={() => !isFull && setSelectedTime(slot)}
                        disabled={isFull}
                      >
                        {slot}
                        {isFull && <span className="block text-xs">Full</span>}
                      </button>
                    );
                  })}
                </div>
                {selectedTime && (
                  <button
                    className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition"
                    onClick={() => router.push(`/book/details?clinic=${encodeURIComponent(clinic.name)}&location=${encodeURIComponent(clinic.location)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`)}
                  >
                    Next
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
