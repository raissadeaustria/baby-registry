'use client';

import { useEffect, useState } from 'react';
import { type Locale, getTranslations } from '@/lib/i18n';

interface ThankYouModalProps {
  guestName: string;
  theme: 'boy' | 'girl';
  locale: Locale;
  message: string;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  type: 'confetti' | 'sparkle' | 'heart';
  rotation: number;
  drift: number;
}

interface Dot {
  w: number; h: number; left: number; top: number;
}

interface Star {
  left: number; top: number; delay: number; size: number;
}

function generateDots(): Dot[] {
  return Array.from({ length: 30 }, () => {
    const s = 3 + Math.random() * 6;
    return { w: s, h: s, left: Math.random() * 100, top: Math.random() * 100 };
  });
}

function generateStars(): Star[] {
  return Array.from({ length: 8 }, () => ({
    left: 10 + Math.random() * 80,
    top: 10 + Math.random() * 80,
    delay: Math.random() * 3,
    size: 12 + Math.random() * 16,
  }));
}

function generateParticles(isBoy: boolean): Particle[] {
  const boyColors = ['#4A9FD8', '#3B82F6', '#60A5FA', '#38BDF8', '#FFD700', '#FCD34D', '#F59E0B', '#FF6B6B'];
  const girlColors = ['#EE7DA5', '#F472B6', '#EC4899', '#E879F9', '#FFD700', '#FCD34D', '#F59E0B', '#FF6B6B'];
  const colors = isBoy ? boyColors : girlColors;
  const particles: Particle[] = [];

  for (let i = 0; i < 80; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 8 + Math.random() * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      type: Math.random() > 0.7 ? 'heart' : Math.random() > 0.4 ? 'sparkle' : 'confetti',
      rotation: Math.random() * 360,
      drift: -30 + Math.random() * 60,
    });
  }
  return particles;
}

export default function ThankYouModal({ guestName, theme, locale, message, onClose }: ThankYouModalProps) {
  const isBoy = theme === 'boy';
  const t = getTranslations(locale);
  const [particles] = useState(() => generateParticles(isBoy));
  const [dots] = useState(() => generateDots());
  const [stars] = useState(() => generateStars());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Confetti / sparkle particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
              '--rotation': `${p.rotation}deg`,
            } as React.CSSProperties}
          >
            {p.type === 'heart' ? (
              <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : p.type === 'sparkle' ? (
              <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
              </svg>
            ) : (
              <div
                style={{
                  width: p.size,
                  height: p.size * 0.6,
                  backgroundColor: p.color,
                  borderRadius: '2px',
                  transform: `rotate(${p.rotation}deg)`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal card */}
      <div
        className={`relative w-full max-w-2xl mx-4 rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
        }`}
        style={{ boxShadow: `0 25px 60px -12px ${isBoy ? 'rgba(124,185,232,0.4)' : 'rgba(244,194,194,0.4)'}` }}
      >
        {/* Header with decorative pattern */}
        <div
          className={`relative text-white py-20 text-center overflow-hidden ${
            isBoy
              ? 'bg-gradient-to-br from-boy-300 via-boy-400 to-boy-500'
              : 'bg-gradient-to-br from-girl-300 via-girl-400 to-girl-500'
          }`}
        >
          {/* Decorative dots pattern */}
          <div className="absolute inset-0 opacity-[0.12]">
            {dots.map((d, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{ width: d.w, height: d.h, left: `${d.left}%`, top: `${d.top}%` }}
              />
            ))}
          </div>

          {/* Decorative star shapes */}
          <div className="absolute inset-0 opacity-[0.08]">
            {stars.map((s, i) => (
              <svg
                key={i}
                className="absolute animate-twinkle"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  animationDelay: `${s.delay}s`,
                  width: s.size,
                  height: s.size,
                }}
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
              </svg>
            ))}
          </div>

          {/* Floating heart icon */}
          <div className="relative z-10">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 animate-float ring-4 ring-white/10">
              <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center">
                <svg className="w-12 h-12 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
            <h2 className="text-6xl font-bold tracking-wide drop-shadow-sm">{t.thankYou}</h2>
            <p className="text-white/80 text-2xl mt-2 font-medium">{guestName}!</p>
          </div>

          {/* Bottom curve */}
          <div className="absolute -bottom-1 left-0 right-0">
            <svg viewBox="0 0 400 30" className="w-full" preserveAspectRatio="none">
              <path d="M0 30 Q200 0 400 30 L400 30 L0 30 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-12 pb-10 pt-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`h-px w-12 ${isBoy ? 'bg-boy-200' : 'bg-girl-200'}`} />
            <svg
              className={`w-5 h-5 ${isBoy ? 'text-boy-300' : 'text-girl-300'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
            <div className={`h-px w-12 ${isBoy ? 'bg-boy-200' : 'bg-girl-200'}`} />
          </div>

          <p className="text-gray-600 text-base leading-relaxed mb-3">{message}</p>
          <p className="text-gray-400 text-sm mb-10">{t.giftRecorded}</p>

          <button
            onClick={onClose}
            className={`w-full py-4 rounded-xl font-semibold text-base text-white uppercase tracking-wider transition-all duration-300 active:scale-[0.97] shadow-lg ${
              isBoy
                ? 'bg-gradient-to-r from-boy-400 to-boy-500 hover:from-boy-500 hover:to-boy-600 shadow-boy-200'
                : 'bg-gradient-to-r from-girl-400 to-girl-500 hover:from-girl-500 hover:to-girl-600 shadow-girl-200'
            }`}
          >
            {t.done}
          </button>
        </div>
      </div>

    </div>
  );
}
