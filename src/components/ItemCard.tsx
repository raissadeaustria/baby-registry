'use client';

import { useState } from 'react';
import { type Item, formatPrice, convertPrice } from '@/lib/types';
import { type Locale, getTranslations } from '@/lib/i18n';

interface ItemCardProps {
  item: Item;
  theme: 'boy' | 'girl';
  currency: string;
  locale: Locale;
  onAdd: (item: Item, qty: number) => void;
  cartQuantity: number;
  index: number;
}

export default function ItemCard({ item, theme, currency, locale, onAdd, cartQuantity, index }: ItemCardProps) {
  const t = getTranslations(locale);
  const isBoy = theme === 'boy';
  const remaining = item.quantity_needed - item.quantity_fulfilled;
  const progress = (item.quantity_fulfilled / item.quantity_needed) * 100;
  const displayPrice = convertPrice(item.price, item.price_currency, currency);
  const displayDelivery = convertPrice(item.delivery_price, item.price_currency, currency);
  const inCart = cartQuantity > 0;
  const [selectedQty, setSelectedQty] = useState(1);

  const maxSelectable = remaining;

  const handleAdd = () => {
    onAdd(item, remaining > 1 ? selectedQty : 1);
  };

  const incrementQty = () => {
    setSelectedQty(prev => Math.min(prev + 1, maxSelectable));
  };

  const decrementQty = () => {
    setSelectedQty(prev => Math.max(prev - 1, 1));
  };

  const handleCardClick = () => {
    if (!inCart) handleAdd();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group animate-fade-in flex flex-col ${!inCart ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isBoy ? 'bg-boy-50' : 'bg-girl-50'
          }`}>
            <svg className={`w-12 h-12 ${isBoy ? 'text-boy-200' : 'text-girl-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        )}

        {/* Priority Badge */}
        {item.priority === 'high' && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white ${
            isBoy ? 'bg-boy-500' : 'bg-girl-500'
          }`}>
            {t.topPick}
          </div>
        )}

        {/* Remaining Badge */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
          {remaining} {t.left}
        </div>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
        <h3 className="font-medium text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">{item.description}</p>
        )}

        <div className="mt-auto">
          {/* Price */}
          <p className={`text-lg font-bold ${isBoy ? 'text-boy-600' : 'text-girl-600'}`}>
            {formatPrice(displayPrice, currency)}
          </p>
          {displayDelivery > 0 && (
            <p className="text-[10px] text-gray-400 mb-1">+ {formatPrice(displayDelivery, currency)} {t.delivery}</p>
          )}
          {!displayDelivery && <div className="mb-2" />}

          {/* Progress */}
          {item.quantity_fulfilled > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${isBoy ? 'bg-boy-accent' : 'bg-girl-accent'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {/* Quantity selector - only when more than 1 needed */}
          {remaining > 1 && !inCart && (
            <div className="flex items-center justify-between mb-2 bg-gray-50 rounded-lg px-1 py-1" onClick={e => e.stopPropagation()}>
              <button
                onClick={decrementQty}
                disabled={selectedQty <= 1}
                className="w-9 h-9 sm:w-7 sm:h-7 rounded-md bg-white text-gray-600 flex items-center justify-center text-sm font-bold shadow-sm disabled:opacity-30 disabled:shadow-none transition-opacity"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-sm font-bold text-gray-800">{selectedQty}</span>
                <span className="text-[10px] text-gray-400 ml-1">{t.of} {remaining}</span>
              </div>
              <button
                onClick={incrementQty}
                disabled={selectedQty >= maxSelectable}
                className="w-9 h-9 sm:w-7 sm:h-7 rounded-md bg-white text-gray-600 flex items-center justify-center text-sm font-bold shadow-sm disabled:opacity-30 disabled:shadow-none transition-opacity"
              >
                +
              </button>
            </div>
          )}

          {/* In-cart quantity indicator */}
          {inCart && remaining > 1 && (
            <div className="flex items-center justify-center gap-1.5 mb-2 py-1.5 bg-gray-50 rounded-lg">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-gray-500 font-medium">{cartQuantity} {t.inYourList}</span>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={e => { e.stopPropagation(); handleAdd(); }}
            disabled={inCart}
            className={`w-full py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              inCart
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : isBoy
                  ? 'bg-boy-500 text-white hover:bg-boy-600 active:scale-[0.97] shadow-sm hover:shadow'
                  : 'bg-girl-500 text-white hover:bg-girl-600 active:scale-[0.97] shadow-sm hover:shadow'
            }`}
          >
            {inCart
              ? t.added
              : remaining > 1
                ? `${t.addToList} (${selectedQty})`
                : t.addToList
            }
          </button>
        </div>
      </div>
    </div>
  );
}
