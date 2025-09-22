'use client';
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    title: 'About',
    content: (
      <p className="mt-3 text-gray-700 leading-relaxed">
        Dr. Pradeep Narwal is a highly respected Endocrinologist with over 22 years of experience in diagnosing and managing complex hormonal disorders. His core specialization lies in Diabetes Mellitus (Type 1 & 2), Thyroid Disorders (Hyperthyroidism, Hypothyroidism, Goiter), and Metabolic Syndrome. Dr. Narwal is known for his patient-centric approach, combining advanced diagnostics with lifestyle guidance for long-term care.
      </p>
    ),
    side: 'left',
  },
  {
    title: 'Education',
    content: (
      <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-1">
        <li>MBBS - All India Institute of Medical Sciences (AIIMS), Delhi (1996 - 2001)</li>
        <li>MD in Endocrinology - Postgraduate Institute of Medical Education & Research (PGIMER), Chandigarh (2002 - 2005)</li>
        <li>Fellowship in Diabetes Management - Royal College of Physicians, London (2007)</li>
      </ul>
    ),
    side: 'right',
  },
  {
    title: 'Awards & Recognition',
    content: (
      <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-1">
        <li>“Best Endocrinologist of the Year” – Indian Medical Awards, 2018</li>
        <li>Lifetime Achievement Award in Diabetes Care – 2022</li>
        <li>Invited Speaker at International Diabetes Federation Congress, 2019</li>
        <li>Featured in “Top 50 Doctors in India” – Times Health Survey, 2021</li>
      </ul>
    ),
    side: 'left',
  },
  {
    title: 'Experience',
    content: (
      <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-1">
        <li>Chief Endocrinologist at Medanta Hospital, Gurgaon (2010–Present)</li>
        <li>Senior Consultant – Apollo Hospitals, Delhi (2005–2010)</li>
        <li>Mentor – National Diabetes Awareness Program (NDAP)</li>
      </ul>
    ),
    side: 'right',
  },
  // New card: Research & Publications
  {
    title: 'Research & Publications',
    content: (
      <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-1">
        <li>Published over 40 research papers in leading endocrinology journals.</li>
        <li>Lead investigator for the "Indian Diabetes Prevention Study" (2015-2019).</li>
        <li>Regular contributor to the Journal of Clinical Endocrinology & Metabolism.</li>
        <li>Presented research at international conferences in the US, UK, and Singapore.</li>
      </ul>
    ),
    side: 'left',
  },
  // New card: Patient Testimonials
  {
    title: 'Patient Testimonials',
    content: (
      <div className="mt-3 text-gray-700 space-y-2">
        <p>"Dr. Narwal's expertise and compassion changed my life. My diabetes is finally under control!" <span className="block text-sm text-blue-600">- S. Mehta</span></p>
        <p>"He explains everything so clearly and always listens to my concerns." <span className="block text-sm text-blue-600">- R. Sharma</span></p>
        <p>"The best thyroid specialist in the region. Highly recommended!" <span className="block text-sm text-blue-600">- A. Gupta</span></p>
      </div>
    ),
    side: 'right',
  },
];

const DoctorHistory = () => {
  const imgRef = useRef(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (imgRef.current) {
      gsap.set(imgRef.current, { opacity: 1, x: 0 }); // Reset state
      gsap.from(imgRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    }
    // Responsive ScrollTrigger positions
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    const start = isMobile ? 'top 50%' : 'top 80%';
    const end = isMobile ? 'bottom bottom' : 'bottom 20%';
    const toggleActions = isMobile ? 'play none none reverse' : 'play reverse play reverse';
    cardRefs.current.forEach((ref, i) => {
      if (ref) {
        const isLast = i === sections.length - 1;
        if (isMobile) {
          gsap.fromTo(
            ref,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: ref,
                start: isLast ? 'top 95%' : start,
                end: isLast ? 'bottom bottom' : end,
                toggleActions: 'play none none none',
                invalidateOnRefresh: true,
              },
            }
          );
        } else {
          gsap.fromTo(
            ref,
            { x: sections[i].side === 'left' ? -200 : 200, opacity: 100 },
            {
              x: 0,
              opacity: 1,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: ref,
                start,
                end,
                toggleActions: isLast ? 'play none none none' : toggleActions,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }
    });
  }, []);

  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-8 py-10 bg-gradient-to-br from-white to-blue-50 text-gray-800 flex flex-col items-center">
      {/* Doctor Header */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-6 mb-10">
        <div ref={imgRef} className="flex-shrink-0 flex justify-center items-center p-6 md:p-10 bg-blue-100 rounded-full">
          <Image
            src="/doctor.png"
            alt="Dr. Pradeep Narwal"
            width={200}
            height={200}
            className="rounded-full object-cover shadow-lg border-4 border-blue-200"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Dr. Pradeep Narwal</h1>
          <p className="text-lg mt-2 text-gray-700">MD (Endocrinology), MBBS</p>
          <p className="text-md text-blue-600 font-medium">Diabetes, Blood Sugar & Thyroid Specialist</p>
          <p className="text-sm text-gray-600 mt-1">Practicing Since 2002</p>
        </div>
      </div>
      {/* Timeline Cards */}
      <div className="w-full max-w-5xl flex flex-col gap-10">
        {sections.map((section, i) => (
          <div
            key={section.title}
            ref={el => { cardRefs.current[i] = el; }}
            className={`w-full flex ${section.side === 'left' ? 'justify-start' : 'justify-end'} `}
          >
            <div className={`bg-blue-50 border border-blue-200 shadow-lg rounded-lg p-6 md:p-8 max-w-xl w-full min-h-[220px] max-h-[260px] flex flex-col justify-start`}>
              <h2 className="text-2xl font-semibold text-blue-800">{section.title}</h2>
              <div className="mt-2 overflow-y-auto flex-1 hide-scrollbar">{section.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorHistory;