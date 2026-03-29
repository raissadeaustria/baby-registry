'use client';

import { type Locale, getTranslations } from '@/lib/i18n';

interface ThankYouModalProps {
  guestName: string;
  theme: 'boy' | 'girl';
  locale: Locale;
  message: string;
  onClose: () => void;
}

export default function ThankYouModal({ guestName, theme, locale, message, onClose }: ThankYouModalProps) {
  const isBoy = theme === 'boy';
  const t = getTranslations(locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
        <div className={`${isBoy ? 'bg-gradient-to-br from-boy-400 to-boy-600' : 'bg-gradient-to-br from-girl-400 to-girl-600'} text-white py-10 text-center`}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">{t.thankYou}, {guestName}!</h2>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 text-sm leading-relaxed mb-2">{message}</p>
          <p className="text-gray-400 text-xs mb-6">{t.giftRecorded}</p>
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg font-semibold text-sm text-white uppercase tracking-wider transition-all active:scale-[0.98] ${
              isBoy ? 'bg-boy-500 hover:bg-boy-600' : 'bg-girl-500 hover:bg-girl-600'
            }`}
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
}
