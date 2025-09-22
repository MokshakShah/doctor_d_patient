"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    title: "Caring Consultations",
    description:
      "Our doctors provide attentive, one-on-one consultations to understand every patient's unique needs.",
    image: "/consult1.jpeg",
  },
  {
    title: "Expert Examinations",
    description:
      "Thorough check-ups ensure accurate diagnosis and the best treatment plans for you.",
    image: "/consult2.jpeg",
  },
  {
    title: "Friendly Interactions",
    description:
      "We believe in building trust through friendly and open communication with our patients.",
    image: "/doctor1.jpeg",
  },
  {
    title: "Teamwork in Care",
    description:
      "Our doctors collaborate to provide holistic and comprehensive healthcare.",
    image: "/doctor2.jpeg",
  },
];

const DoctorCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Changed from 1000 to 3000 ms
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-{500} flex justify-center bg-blue-50 mt-8 py-6 px-2 md:px-0">
      <div className="relative w-full max-w-3xl rounded-xl shadow-lg overflow-hidden bg-white flex flex-col md:flex-row items-center">
        {/* Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slides[activeIndex].image}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <Image
                src={slides[activeIndex].image}
                alt={slides[activeIndex].title}
                width={400}
                height={260}
                className="rounded-lg object-cover h-[180px] w-[180px] md:h-[260px] md:w-[260px] border-4 border-blue-200 shadow"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start p-4 md:p-8">
          <h3 className="text-lg md:text-2xl font-bold text-blue-800 mb-2 text-center md:text-left">
            {slides[activeIndex].title}
          </h3>
          <p className="text-gray-700 text-sm md:text-base text-center md:text-left">
            {slides[activeIndex].description}
          </p>
        </div>
        {/* Controls */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={goToPrev}
            className="bg-white/80 hover:bg-blue-100 rounded-full p-2 shadow"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-blue-700" />
          </button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={goToNext}
            className="bg-white/80 hover:bg-blue-100 rounded-full p-2 shadow"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-blue-700" />
          </button>
        </div>
        {/* Pause/Play */}
        <div className="absolute bottom-1/100 right-1/10 translate-x-1/2 z-10">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="bg-white/80 hover:bg-blue-900  rounded-full p-2 shadow"
            aria-label={isPaused ? "Play carousel" : "Pause carousel"}
          >
            {isPaused ? <Play className="w-5 h-5 text-blue-700" /> : <Pause className="w-5 h-5 text-blue-700" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCarousel; 