'use client';

import { useState } from 'react';
import { type CartItem, formatPrice, convertPrice } from '@/lib/types';
import { type Locale, getTranslations } from '@/lib/i18n';

interface CartProps {
  cart: CartItem[];
  theme: 'boy' | 'girl';
  currency: string;
  locale: Locale;
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, qty: number) => void;
  onCheckout: () => void;
}

export default function Cart({ cart, theme, currency, locale, onRemove, onUpdateQuantity, onCheckout }: CartProps) {
  const [expanded, setExpanded] = useState(false);
  const isBoy = theme === 'boy';
  const t = getTranslations(locale);
  const total = cart.reduce((sum, c) => sum + convertPrice(c.item.price, c.item.price_currency, currency) * c.quantity, 0);
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Backdrop */}
      {expanded && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setExpanded(false)} />
      )}

      {/* Expanded cart panel */}
      {expanded && (
        <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col animate-slide-up">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{t.yourGiftList}</h3>
                <p className="text-xs text-gray-400">{itemCount} {t.itemsSelected}</p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-5">
            {cart.map(({ item, quantity }) => (
              <div key={item.id} className="flex items-center gap-3 py-4 border-b border-gray-50">
                {/* Thumbnail */}
                <div className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${
                  item.image_url ? '' : isBoy ? 'bg-boy-50' : 'bg-girl-50'
                }`}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className={`w-6 h-6 ${isBoy ? 'text-boy-200' : 'text-girl-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{formatPrice(convertPrice(item.price, item.price_currency, currency), currency)}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                    className="w-7 h-7 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-medium"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-gray-700">{quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                    className="w-7 h-7 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-medium"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemove(item.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Cart total in panel */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{t.total}</span>
              <span className={`text-xl font-bold ${isBoy ? 'text-boy-600' : 'text-girl-600'}`}>
                {formatPrice(total, currency)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className={`w-full py-3 rounded-xl font-semibold text-sm uppercase tracking-wider text-white transition-all active:scale-[0.98] ${
                isBoy ? 'bg-boy-500 hover:bg-boy-600' : 'bg-girl-500 hover:bg-girl-600'
              }`}
            >
              {t.proceedToCheckout}
            </button>
          </div>
        </div>
      )}

      {/* Floating cart bar */}
      {!expanded && (
        <div className="px-4 pb-4">
          <div
            className={`max-w-lg mx-auto rounded-2xl shadow-xl ${
              isBoy ? 'bg-boy-600' : 'bg-girl-600'
            } text-white overflow-hidden`}
          >
            <button
              onClick={() => setExpanded(true)}
              className="w-full px-5 py-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {itemCount}
                </span>
                <span className="font-medium text-sm">{t.viewGiftList}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatPrice(total, currency)}</span>
                <span className="bg-white text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t.checkout}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
