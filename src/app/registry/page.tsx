'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Item, Settings, CartItem } from '@/lib/types';
import { type Locale, getTranslations, getCurrency } from '@/lib/i18n';
import LocalePicker from '@/components/LocalePicker';
import ItemCard from '@/components/ItemCard';
import Cart from '@/components/Cart';
import CheckoutModal from '@/components/CheckoutModal';
import CashFund from '@/components/CashFund';
import ThankYouModal from '@/components/ThankYouModal';

export default function GuestPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [theme, setTheme] = useState<'boy' | 'girl'>('boy');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouName, setThankYouName] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('CZK-EN');

  const t = getTranslations(locale);
  const currency = getCurrency(locale);

  const fetchData = useCallback(async () => {
    const [itemsRes, settingsRes] = await Promise.all([
      fetch('/api/items'),
      fetch('/api/settings'),
    ]);
    const itemsData = await itemsRes.json();
    const settingsData = await settingsRes.json();
    setItems(itemsData);
    setSettings(settingsData);
    if (settingsData.theme) setTheme(settingsData.theme as 'boy' | 'girl');
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const availableItems = items.filter(i => i.quantity_fulfilled < i.quantity_needed);
  const fulfilledCount = items.filter(i => i.quantity_fulfilled >= i.quantity_needed).length;

  const addToCart = (item: Item, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      const maxQty = item.quantity_needed - item.quantity_fulfilled;
      if (existing) {
        const newQty = Math.min(qty, maxQty);
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: newQty } : c);
      }
      return [...prev, { item, quantity: Math.min(qty, maxQty) }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity } : c));
  };

  const handleCheckoutComplete = (guestName: string) => {
    setCart([]);
    setShowCheckout(false);
    setThankYouName(guestName);
    setShowThankYou(true);
    fetchData();
  };

  const isBoy = theme === 'boy';
  const categories = [...new Set(availableItems.map(i => i.category))];
  const filteredItems = activeCategory
    ? availableItems.filter(i => i.category === activeCategory)
    : availableItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 ${isBoy ? 'bg-gradient-to-r from-boy-500 to-boy-600' : 'bg-gradient-to-r from-girl-500 to-girl-600'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-white font-semibold text-lg tracking-tight">
            {settings?.baby_name || 'Baby'}&apos;s {t.registry}
          </h1>
          <LocalePicker locale={locale} onChange={setLocale} />
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
        <div className={`absolute inset-0 ${
          isBoy
            ? 'bg-gradient-to-br from-boy-300 via-boy-400 to-boy-600'
            : 'bg-gradient-to-br from-girl-300 via-girl-400 to-girl-600'
        }`} />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full opacity-5 bg-white" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-6 text-center max-w-lg">
            <p className="text-sm uppercase tracking-[0.25em] opacity-80 mb-2">{t.welcomeTo}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
              {settings?.baby_name || 'Baby'}&apos;s {t.giftRegistry}
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-4">
              {settings?.welcome_message || 'Welcome to our Baby Registry!'}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold">{items.length}</p>
                <p className="opacity-75">{t.wishes}</p>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-bold">{fulfilledCount}</p>
                <p className="opacity-75">{t.fulfilled}</p>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-bold">{availableItems.length}</p>
                <p className="opacity-75">{t.available}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs opacity-60">{t.hostedBy} {settings?.mom_name || 'Mom'}</p>
        </div>
      </section>

      {/* Category Filter Bar */}
      {categories.length > 1 && (
        <div className="sticky top-14 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 py-2.5 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === null
                    ? isBoy ? 'bg-boy-500 text-white shadow-md' : 'bg-girl-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.allItems}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-all ${
                    activeCategory === cat
                      ? isBoy ? 'bg-boy-500 text-white shadow-md' : 'bg-girl-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        <CashFund theme={theme} settings={settings} locale={locale} onComplete={(name) => { setThankYouName(name); setShowThankYou(true); }} />

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {t.showing} <span className="font-semibold text-gray-700">{filteredItems.length}</span> {t.items}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4M12 4v16" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-400">{t.noItems}</p>
            <p className="text-sm text-gray-300 mt-1">{t.checkBackSoon}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredItems.map((item, i) => (
              <ItemCard key={item.id} item={item} theme={theme} currency={currency} locale={locale} onAdd={addToCart} cartQuantity={cart.find(c => c.item.id === item.id)?.quantity || 0} index={i} />
            ))}
          </div>
        )}
      </main>

      {cart.length > 0 && (
        <Cart cart={cart} theme={theme} currency={currency} locale={locale} onRemove={removeFromCart} onUpdateQuantity={updateCartQuantity} onCheckout={() => setShowCheckout(true)} />
      )}

      {showCheckout && (
        <CheckoutModal cart={cart} theme={theme} settings={settings} locale={locale} onClose={() => setShowCheckout(false)} onComplete={handleCheckoutComplete} />
      )}

      {showThankYou && (
        <ThankYouModal guestName={thankYouName} theme={theme} locale={locale} message={
          locale === 'EUR-ES' ? (settings?.thank_you_message_es || 'Muchas gracias por tu generoso regalo.')
          : locale === 'CZK-CZ' ? (settings?.thank_you_message_cz || 'Děkujeme za váš štědrý dárek!')
          : (settings?.thank_you_message || 'Thank you for your generous gift!')
        } onClose={() => setShowThankYou(false)} />
      )}
    </div>
  );
}
