'use client';

import { useState } from 'react';
import { type CartItem, type Settings, formatPrice, convertPrice } from '@/lib/types';
import { type Locale, getTranslations, getCurrency } from '@/lib/i18n';

interface CheckoutModalProps {
  cart: CartItem[];
  theme: 'boy' | 'girl';
  settings: Settings | null;
  locale: Locale;
  onClose: () => void;
  onComplete: (guestName: string) => void;
}

export default function CheckoutModal({ cart, theme, settings, locale, onClose, onComplete }: CheckoutModalProps) {
  const t = getTranslations(locale);
  const [step, setStep] = useState<'info' | 'summary' | 'payment'>('info');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('whatsapp');
  const [dedication, setDedication] = useState('');
  const [guestImage, setGuestImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBoy = theme === 'boy';
  const currency = getCurrency(locale);
  const total = cart.reduce((sum, c) => sum + convertPrice(c.item.price, c.item.price_currency, currency) * c.quantity, 0);
  const steps = ['info', 'summary', 'payment'] as const;
  const stepIndex = steps.indexOf(step);

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('summary');
  };

  const isEur = currency === 'EUR';
  const bankAccountsRaw = isEur ? settings?.bank_accounts_eur : settings?.bank_accounts_czk;
  let bankAccounts: { details: string; qr: string }[] = [];
  try {
    const raw = JSON.parse(bankAccountsRaw || '[]');
    bankAccounts = (raw as (string | { details: string; qr: string })[]).map(a =>
      typeof a === 'string' ? { details: a, qr: '' } : a
    ).filter(a => a.details.trim());
  } catch { bankAccounts = []; }
  const revolutLink = isEur ? settings?.revolut_link_eur : settings?.revolut_link_czk;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\\n/g, '\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { compressImage } = await import('@/lib/imageUtils');
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setGuestImage(data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: name,
          guest_contact: contact,
          contact_type: contactType,
          dedication,
          guest_image: guestImage,
          payment_type: 'bank_transfer',
          currency,
          amount: total,
          items: cart.map(c => ({ item_id: c.item.id, quantity: c.quantity })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetch(`/api/payments/${data.payment_id}/confirm`, { method: 'POST' });
        onComplete(name);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 text-gray-800 text-sm transition-colors bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-hidden shadow-2xl animate-slide-up sm:animate-fade-in-scale flex flex-col">

        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {step === 'info' && t.yourDetails}
              {step === 'summary' && t.orderSummary}
              {step === 'payment' && t.payment}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= stepIndex
                    ? isBoy ? 'bg-boy-500' : 'bg-girl-500'
                    : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-5">
          {/* Step 1: Guest Info */}
          {step === 'info' && (
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{t.yourName} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  placeholder={t.enterFullName}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{t.contact} *</label>
                <div className="flex gap-2">
                  <select
                    value={contactType}
                    onChange={e => setContactType(e.target.value)}
                    className="px-3 py-3 rounded-lg border border-gray-200 text-gray-800 bg-white text-sm focus:outline-none focus:border-gray-400"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    required
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className={`flex-1 ${inputClass}`}
                    placeholder={contactType === 'email' ? 'your@email.com' : '+420 123 456 789'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{t.dedicationLetter}</label>
                <textarea
                  value={dedication}
                  onChange={e => setDedication(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder={t.writeSpecialMessage}
                />
              </div>
              {/* Photo upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  {locale.endsWith('ES') ? 'Agregar una foto' : locale.endsWith('CZ') ? 'Přidat fotku' : 'Add a photo'} <span className="font-normal normal-case text-gray-300">{locale.endsWith('ES') ? '(opcional)' : locale.endsWith('CZ') ? '(volitelné)' : '(optional)'}</span>
                </label>
                {guestImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={guestImage} alt="Your photo" className="w-full max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => setGuestImage(null)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    isBoy ? 'border-boy-200 hover:border-boy-400 hover:bg-boy-50' : 'border-girl-200 hover:border-girl-400 hover:bg-girl-50'
                  }`}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {uploading ? (
                      <span className="text-xs text-gray-400">{locale.endsWith('ES') ? 'Subiendo...' : locale.endsWith('CZ') ? 'Nahrávám...' : 'Uploading...'}</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400">
                          {locale.endsWith('ES') ? 'Toca para subir foto' : locale.endsWith('CZ') ? 'Klepněte pro nahrání fotky' : 'Tap to upload a photo'}
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold text-sm text-white uppercase tracking-wider transition-all active:scale-[0.98] ${
                  isBoy ? 'bg-boy-500 hover:bg-boy-600' : 'bg-girl-500 hover:bg-girl-600'
                }`}
              >
                {t.continue_}
              </button>
            </form>
          )}

          {/* Step 2: Summary */}
          {step === 'summary' && (
            <div>
              <div className="space-y-0 mb-4">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50">
                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden ${
                      item.image_url ? '' : isBoy ? 'bg-boy-50' : 'bg-girl-50'
                    }`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isBoy ? 'text-boy-200' : 'text-girl-200'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{formatPrice(convertPrice(item.price, item.price_currency, currency) * quantity, currency)}</p>
                  </div>
                ))}
              </div>

              <div className={`flex justify-between items-center py-3 border-t-2 ${isBoy ? 'border-boy-100' : 'border-girl-100'}`}>
                <span className="font-bold text-gray-800">{t.total}</span>
                <span className={`text-xl font-bold ${isBoy ? 'text-boy-600' : 'text-girl-600'}`}>{formatPrice(total, currency)}</span>
              </div>

              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">{t.from}:</span> {name}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">{t.contact}:</span> {contact}</p>
                {dedication && <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">{t.message}:</span> {dedication}</p>}
              </div>

              <button
                onClick={() => setStep('payment')}
                className={`w-full py-3 rounded-lg font-semibold text-sm text-white uppercase tracking-wider transition-all active:scale-[0.98] mt-4 ${
                  isBoy ? 'bg-boy-500 hover:bg-boy-600' : 'bg-girl-500 hover:bg-girl-600'
                }`}
              >
                {t.payNow}
              </button>
              <button onClick={() => setStep('info')} className="w-full py-2 text-gray-400 text-xs mt-1 hover:text-gray-600">
                {t.back}
              </button>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className={`text-center py-4 rounded-xl ${isBoy ? 'bg-boy-50' : 'bg-girl-50'}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.amountToPay}</p>
                <p className={`text-3xl font-bold ${isBoy ? 'text-boy-600' : 'text-girl-600'}`}>{formatPrice(total, currency)}</p>
              </div>

              {/* Bank Transfer */}
              {/* Bank Accounts */}
              {bankAccounts.map((account, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {t.bankTransfer} ({isEur ? 'EUR' : 'CZK'}){bankAccounts.length > 1 ? ` #${i + 1}` : ''}
                    </h3>
                  </div>
                  {account.qr && (
                    <div className="flex justify-center mb-3">
                      <img src={account.qr} alt="QR Code" className="w-32 h-32 object-contain rounded-lg" />
                    </div>
                  )}
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mb-3 font-mono">
                    {account.details.replace(/\\n/g, '\n')}
                  </pre>
                  <button
                    onClick={() => copyText(account.details)}
                    className={`w-full py-2.5 rounded-lg border font-medium text-sm transition-all ${
                      copied
                        ? 'bg-green-50 border-green-300 text-green-600'
                        : isBoy
                          ? 'border-boy-200 text-boy-600 hover:bg-boy-50'
                          : 'border-girl-200 text-girl-600 hover:bg-girl-50'
                    }`}
                  >
                    {copied ? t.copied : t.copyAccountDetails}
                  </button>
                </div>
              ))}

              {/* Revolut */}
              {revolutLink && (
                <a
                  href={revolutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0075EB] text-white font-semibold text-sm hover:bg-[#0066CC] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.39 6.05L13.06 18.3a1.2 1.2 0 01-2.12 0L3.61 6.05A1.2 1.2 0 014.67 4.2h14.66a1.2 1.2 0 011.06 1.85z"/>
                  </svg>
                  {t.payWithRevolut}
                </a>
              )}

              {/* Bizum - EUR only */}
              {isEur && settings?.bizum_phone && (
                <a
                  href="https://bizum.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#05C1B2] text-white font-semibold text-sm hover:bg-[#04AEA0] transition-colors"
                >
                  <span className="text-lg font-bold">B</span>
                  Bizum: {settings.bizum_phone}
                </a>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-green-500 hover:bg-green-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {submitting ? t.processing : t.iHaveSentPayment}
              </button>
              <button onClick={() => setStep('summary')} className="w-full py-2 text-gray-400 text-xs hover:text-gray-600">
                {t.back}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
