'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { usePathname } from 'next/navigation'
import DoctorCarousel from './components/DoctorCarousel';
import { CalendarCheck } from 'lucide-react';

const Page = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const imgRef = useRef(null);
  const descRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (imgRef.current) {
      gsap.set(imgRef.current, { opacity: 0, x: 100 });
    }
    if (descRef.current) {
      gsap.set(descRef.current, { opacity: 0, x: -100 });
    }
    const tl = gsap.timeline();
    tl.to(imgRef.current, { opacity: 1, x: 0, duration: 0.8 })
      .to(descRef.current, { opacity: 1, x: 0, duration: 0.8 }, '+=0.2');
  }, [pathname, imgRef, descRef]);

  return (
    <div>
      <nav className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="flex items-center">
          <Image src="/doctordlogo.png" alt="DoctorD Logo" width={40} height={40} />
          <Link href="/" className="ml-2 text-xl font-bold text-blue-700">DoctorD</Link>
        </div>
        {/* Desktop links */}
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-700 font-medium">Home</Link>
          <Link href="/book" className="text-gray-700 hover:text-blue-700 font-medium">Book Appointment</Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-700 font-medium">About Doctors</Link>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
      {/* Doctor Carousel */}
      <DoctorCarousel />
      
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white shadow-md z-40 flex flex-col items-center py-4 space-y-2 animate-fade-in">
          <Link href="/" className="text-gray-700 hover:text-blue-700 font-medium w-full text-center" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/" className="text-gray-700 hover:text-blue-700 font-medium w-full text-center" onClick={() => setMenuOpen(false)}>Book Appointment</Link>
          <Link href="/" className="text-gray-700 hover:text-blue-700 font-medium w-full text-center" onClick={() => setMenuOpen(false)}>About Doctors</Link>
        </div>
      )}
      <main className="pt-16">
        {/* Doctor Card */}
        <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between bg-blue-50 rounded-lg shadow-lg mt-6 p-3 sm:p-4 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
          {/* Left: Description (bottom on mobile) */}
          <div ref={descRef} className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left mb-4 md:mb-0 w-full">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-2">Dr. Pradeep Narwal</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              Specialist in Diabetes, Blood Sugar, and Thyroid. Dr. Narwal has over 20 years of experience helping patients manage and overcome endocrine disorders. Compassionate, thorough, and always up-to-date with the latest medical advancements.
            </p>
            <Link href="/doctor-history">
              <button className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition text-sm sm:text-base">
                See More
              </button>
            </Link>
          </div>
          {/* Right: Doctor Image (top on mobile) */}
          <div ref={imgRef} className="flex-1 flex justify-center items-center w-full md:w-auto mb-4 md:mb-0 mt-4 md:mt-0">
            <Image
              src="/doctor.png"
              alt="Dr. Pradeep Narwal"
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-blue-200 shadow-lg md:w-[220px] md:h-[220px] w-[120px] h-[120px]"
            />
          </div>
          
        </div>
       {/* Book Appointment Card (Mobile-First) */}
      <div className="w-full flex justify-center mt-4 px-2 md:hidden">
        <div className="w-full max-w-xs bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border border-blue-100">
          <h2 className="text-lg font-bold text-blue-800 mb-2 text-center">Book Your Appointment</h2>
          <p className="text-gray-600 text-sm mb-4 text-center">Schedule your visit with our expert doctors in just a few taps.</p>
          <Link href="/book" className="w-full">
            <button className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition flex items-center justify-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Book Now
            </button>
          </Link>
        </div>
      </div>
      </main>
      {/* Footer */}
      <footer className="w-full bg-blue-900 text-white py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col gap-4">
          <div className="text-lg font-bold mb-2">Contact Us</div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div>
              <div className="font-semibold">Borivali Clinic</div>
              <div>Shop 12, Shreeji Heights, Chandavarkar Road, Borivali West, Mumbai 400092</div>
              <div>Phone: 022-12345678</div>
            </div>
            <div>
              <div className="font-semibold">Malad Clinic</div>
              <div>Ground Floor, Harmony Plaza, Daftary Road, Malad East, Mumbai 400097</div>
              <div>Phone: 022-87654321</div>
            </div>
            <div>
              <div className="font-semibold">Bhayander Clinic</div>
              <div>Shop 5, Sai Darshan Complex, Maxus Mall Road, Bhayander West, Mumbai 401101</div>
              <div>Phone: 022-11223344</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-blue-100">
            DoctorD &copy; {new Date().getFullYear()} &mdash; Your trusted partner for easy, modern doctor appointments.<br/>
            <span className="italic">Built with ❤️ for learning, demo, and real-world inspiration.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Page
