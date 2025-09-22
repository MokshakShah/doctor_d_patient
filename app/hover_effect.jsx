"use client"
import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';

const cards = [
  {
    title: 'Designers',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    desc: 'Tools that work like you do. Streamline your design process with AI-powered tools and high-quality assets that help you work faster and focus on what matters.'
  },
  {
    title: 'Marketers',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    desc: 'Boost your marketing workflow with automation and creative assets.'
  },
  {
    title: 'VFX filmmakers',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    desc: 'Create stunning visuals and streamline your VFX pipeline.'
  },
  {
    title: 'Content creators',
    img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    desc: 'Produce engaging content with powerful tools and resources.'
  },
  {
    title: 'Ultra Pro vision',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    desc: 'Tools that work like you do. Streamline your design process with AI-powered tools and high-quality assets that help you work faster and focus on what matters.'
  },
  {
    title: 'Managing',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    desc: 'Boost your marketing workflow with automation and creative assets.'
  },
  {
    title: 'VFX videomakers',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    desc: 'Create stunning visuals and streamline your VFX pipeline.'
  },
  {
    title: 'Content writers',
    img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    desc: 'Produce engaging content with powerful tools and resources.'
  },
  
];

const HoverEffect = () => {
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);
  const detailRefs = useRef([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const handleHover = (idx) => {
    for (let i = 0; i < visibleCount; i++) {
      if (i === idx) {
        gsap.to(cardRefs.current[i], { flex: 3, duration: 0.5, ease: 'power2.out' });
        gsap.to(overlayRefs.current[i], { opacity: 0.7, duration: 0.4 });
        gsap.to(detailRefs.current[i], { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
      } else {
        gsap.to(cardRefs.current[i], { flex: 1, duration: 0.5, ease: 'power2.out' });
        gsap.to(overlayRefs.current[i], { opacity: 0, duration: 0.4 });
        gsap.to(detailRefs.current[i], { opacity: 0, pointerEvents: 'none', duration: 0.4 });
      }
    }
  };

  const handleLeave = () => {
    for (let i = 0; i < visibleCount; i++) {
      gsap.to(cardRefs.current[i], { flex: 1, duration: 0.5, ease: 'power2.out' });
      gsap.to(overlayRefs.current[i], { opacity: 0, duration: 0.4 });
      gsap.to(detailRefs.current[i], { opacity: 0, pointerEvents: 'none', duration: 0.4 });
    }
  };

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - visibleCount));
  };
  const handleNext = () => {
    setStartIndex((prev) => Math.min(cards.length - visibleCount, prev + visibleCount));
  };

  const visibleCards = cards.slice(startIndex, startIndex + visibleCount);

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '40px 0' }}>
      <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: 40, fontSize: 40 }}>
        Boost your professional workflow and productivity
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, maxWidth: 1500, margin: '0 auto' }}>
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          style={{
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 48,
            height: 48,
            fontSize: 28,
            cursor: startIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: startIndex === 0 ? 0.4 : 1,
            marginRight: 8,
          }}
        >
          {'<'}
        </button>
        <div
          style={{
            display: 'flex',
            gap: 32,
            alignItems: 'stretch',
            width: 1400,
            maxWidth: 1400,
            overflow: 'hidden',
          }}
        >
          {visibleCards.map((card, i) => (
            <div
              key={card.title + startIndex}
              ref={el => (cardRefs.current[i] = el)}
              onMouseEnter={() => handleHover(i)}
              onMouseLeave={handleLeave}
              style={{
                flex: 1,
                minWidth: 0,
                background: 'linear-gradient(135deg, #3a5ad7 0%, #a259c6 100%)',
                borderRadius: 24,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.3s',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                height: 480,
                justifyContent: 'flex-end',
                padding: 0,
              }}
            >
              <img
                src={card.img}
                alt={card.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 1,
                }}
              />
              {/* Overlay for dimming effect */}
              <div
                ref={el => (overlayRefs.current[i] = el)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(30,40,90,0.93)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              {/* Title always visible */}
              <div
                style={{
                  position: 'absolute',
                  left: 24,
                  top: 32,
                  color: '#fff',
                  zIndex: 3,
                  fontSize: 28,
                  fontWeight: 700,
                  textShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                {card.title}
              </div>
              {/* Details only on hover */}
              <div
                ref={el => (detailRefs.current[i] = el)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  color: '#fff',
                  opacity: 0,
                  pointerEvents: 'none',
                  padding: 48,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  transition: 'opacity 0.3s',
                  zIndex: 4,
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 18 }}>{card.title}</div>
                <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Tools that work like you do</div>
                <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>{card.desc}</div>
                <button
                  style={{
                    background: '#fff',
                    color: '#2a2a2a',
                    border: 'none',
                    borderRadius: 24,
                    padding: '10px 28px',
                    fontWeight: 600,
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  Sign up
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={startIndex + visibleCount >= cards.length}
          style={{
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 48,
            height: 48,
            fontSize: 28,
            cursor: startIndex + visibleCount >= cards.length ? 'not-allowed' : 'pointer',
            opacity: startIndex + visibleCount >= cards.length ? 0.4 : 1,
            marginLeft: 8,
          }}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default HoverEffect; 