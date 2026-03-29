'use client';

import { useState } from 'react';
import { type Locale, LOCALE_LABELS } from '@/lib/i18n';

interface LocalePickerProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

const FLAGS: Record<Locale, string> = {
  'EUR-EN': '\u{1F1EA}\u{1F1FA}',
  'EUR-ES': '\u{1F1EA}\u{1F1F8}',
  'CZK-EN': '\u{1F1EC}\u{1F1E7}',
  'CZK-CZ': '\u{1F1E8}\u{1F1FF}',
};

export default function LocalePicker({ locale, onChange }: LocalePickerProps) {
  const [open, setOpen] = useState(false);
  const locales = Object.keys(LOCALE_LABELS) as Locale[];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors"
      >
        <span className="text-sm">{FLAGS[locale]}</span>
        <span>{locale.split('-')[0]}</span>
        <svg className={`w-3 h-3 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[170px] animate-fade-in">
            {locales.map(l => (
              <button
                key={l}
                onClick={() => { onChange(l); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors ${
                  l === locale
                    ? 'bg-gray-50 text-gray-800 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{FLAGS[l]}</span>
                <span>{LOCALE_LABELS[l]}</span>
                {l === locale && (
                  <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
