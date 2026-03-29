'use client';

import { useState } from 'react';
import { type Settings, formatPrice, CURRENCY_SYMBOLS, type Currency } from '@/lib/types';
import { type Locale, getTranslations, getCurrency } from '@/lib/i18n';

interface CashFundProps {
  theme: 'boy' | 'girl';
  settings: Settings | null;
  locale: Locale;
  onComplete: (name: string) => void;
}

export default function CashFund({ theme, settings, locale, onComplete }: CashFundProps) {
  const t = getTranslations(locale);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('whatsapp');
  const [dedication, setDedication] = useState('');
  const [guestImage, setGuestImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);

  const isBoy = theme === 'boy';
  const currency = getCurrency(locale);
  const sym = CURRENCY_SYMBOLS[currency as Currency] || currency;
  const presetAmounts = currency === 'CZK' ? [500, 1000, 2000, 5000] : [25, 50, 100, 200];

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 text-gray-800 text-sm transition-colors bg-white";

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
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

  const handleConfirm = async () => {
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
          payment_type: 'cash_fund',
          currency,
          amount: parseFloat(amount),
          items: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetch(`/api/payments/${data.payment_id}/confirm`, { method: 'POST' });
        setShowForm(false);
        setShowPayment(false);
        setAmount('');
        setName('');
        setContact('');
        setDedication('');
        setGuestImage(null);
        onComplete(name);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header strip */}
      <div className={`h-1 ${isBoy ? 'bg-gradient-to-r from-boy-400 to-boy-accent' : 'bg-gradient-to-r from-girl-400 to-girl-accent'}`} />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isBoy ? 'bg-boy-50' : 'bg-girl-50'
          }`}>
            <svg className={`w-5 h-5 ${isBoy ? 'text-boy-500' : 'text-girl-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{t.cashGift}</h3>
            <p className="text-xs text-gray-400">{t.sendAnyAmount}</p>
          </div>
        </div>

        {!showForm ? (
          <div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presetAmounts.map(preset => (
                <button
                  key={preset}
                  onClick={() => { setAmount(String(preset)); setShowForm(true); }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                    isBoy
                      ? 'border-boy-200 text-boy-600 hover:bg-boy-500 hover:text-white hover:border-boy-500'
                      : 'border-girl-200 text-girl-600 hover:bg-girl-500 hover:text-white hover:border-girl-500'
                  }`}
                >
                  {formatPrice(preset, currency)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">{sym}</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-gray-400"
                  placeholder={t.otherAmount}
                />
              </div>
              <button
                onClick={() => { if (amount && parseFloat(amount) > 0) setShowForm(true); }}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors ${
                  isBoy ? 'bg-boy-500 hover:bg-boy-600' : 'bg-girl-500 hover:bg-girl-600'
                }`}
              >
                {t.send}
              </button>
            </div>
          </div>
        ) : !showPayment ? (
          <form onSubmit={handleSubmitInfo} className="space-y-3">
            <div className={`text-center py-2 rounded-lg ${isBoy ? 'bg-boy-50' : 'bg-girl-50'}`}>
              <p className={`text-xl font-bold ${isBoy ? 'text-boy-600' : 'text-girl-600'}`}>
                {formatPrice(parseFloat(amount), currency)}
              </p>
            </div>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder={`${t.yourName} *`} />
            <div className="flex gap-2">
              <select value={contactType} onChange={e => setContactType(e.target.value)}
                className="px-3 py-3 rounded-lg border border-gray-200 text-gray-800 bg-white text-sm">
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
              <input type={contactType === 'email' ? 'email' : 'tel'} required value={contact} onChange={e => setContact(e.target.value)}
                className={`flex-1 ${inputClass}`} placeholder={contactType === 'email' ? 'your@email.com' : '+420 123 456 789'} />
            </div>
            <textarea value={dedication} onChange={e => setDedication(e.target.value)} rows={2}
              className={`${inputClass} resize-none`} placeholder={t.dedicationMessage} />
            {/* Photo */}
            {guestImage ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img src={guestImage} alt="Photo" className="w-full max-h-36 object-contain" />
                <button type="button" onClick={() => setGuestImage(null)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-black/70">&times;</button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                isBoy ? 'border-boy-200 hover:border-boy-400' : 'border-girl-200 hover:border-girl-400'
              }`}>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-[11px] text-gray-400">{uploading
                  ? (locale.endsWith('ES') ? 'Subiendo...' : locale.endsWith('CZ') ? 'Nahrávám...' : 'Uploading...')
                  : (locale.endsWith('ES') ? 'Agregar foto (opcional)' : locale.endsWith('CZ') ? 'Přidat fotku (volitelné)' : 'Add photo (optional)')
                }</span>
              </label>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">{t.back}</button>
              <button type="submit"
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white ${isBoy ? 'bg-boy-500 hover:bg-boy-600' : 'bg-girl-500 hover:bg-girl-600'}`}>
                {t.continue_}</button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className={`text-center py-3 rounded-lg ${isBoy ? 'bg-boy-50' : 'bg-girl-50'}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{t.amount}</p>
              <p className={`text-2xl font-bold ${isBoy ? 'text-boy-600' : 'text-girl-600'}`}>{formatPrice(parseFloat(amount), currency)}</p>
            </div>

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.choosePaymentMethod}</p>

            {/* Payment options grid */}
            <div className="grid grid-cols-2 gap-2">
              {bankAccounts.map((account, i) => {
                const bankName = account.details.replace(/\\n/g, '\n').split('\n')[0].trim();
                const isSelected = selectedBank === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedBank(isSelected ? null : i)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? isBoy ? 'border-boy-500 bg-boy-50' : 'border-girl-500 bg-girl-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <svg className={`w-5 h-5 mx-auto mb-1 ${isSelected ? (isBoy ? 'text-boy-500' : 'text-girl-500') : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>{bankName}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.bankTransfer}</p>
                  </button>
                );
              })}

              {revolutLink && (
                <a href={revolutLink} target="_blank" rel="noopener noreferrer"
                  className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#0075EB] text-center transition-all bg-white">
                  <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-[#0075EB] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.39 6.05L13.06 18.3a1.2 1.2 0 01-2.12 0L3.61 6.05A1.2 1.2 0 014.67 4.2h14.66a1.2 1.2 0 011.06 1.85z"/>
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-600">Revolut</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Card / Apple Pay</p>
                </a>
              )}

              {isEur && settings?.bizum_phone && (
                <a href="https://bizum.es" target="_blank" rel="noopener noreferrer"
                  className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#05C1B2] text-center transition-all bg-white">
                  <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-[#05C1B2] flex items-center justify-center">
                    <span className="text-white font-bold text-[10px]">B</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-600">Bizum</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{settings.bizum_phone}</p>
                </a>
              )}
            </div>

            {/* Expanded bank details */}
            {selectedBank !== null && bankAccounts[selectedBank] && (
              <div className={`border-2 rounded-xl p-3 transition-all ${isBoy ? 'border-boy-200 bg-boy-50/50' : 'border-girl-200 bg-girl-50/50'}`}>
                {bankAccounts[selectedBank].qr && (
                  <div className="flex justify-center mb-2">
                    <img src={bankAccounts[selectedBank].qr} alt="QR Code" className="w-24 h-24 object-contain rounded-lg bg-white p-1" />
                  </div>
                )}
                <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-2.5 rounded-lg mb-2 font-mono">
                  {bankAccounts[selectedBank].details.replace(/\\n/g, '\n')}
                </pre>
                <button onClick={() => copyText(bankAccounts[selectedBank!].details)}
                  className={`w-full py-2 rounded-lg border text-sm font-medium transition-all ${
                    copied ? 'bg-green-50 border-green-300 text-green-600'
                      : isBoy ? 'border-boy-200 text-boy-600 hover:bg-white' : 'border-girl-200 text-girl-600 hover:bg-white'
                  }`}>
                  {copied ? t.copied : t.copyAccountDetails}
                </button>
              </div>
            )}

            <button onClick={handleConfirm} disabled={submitting}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-green-500 hover:bg-green-600 disabled:opacity-50">
              {submitting ? t.processing : t.iHaveSentPayment}
            </button>
            <button onClick={() => setShowPayment(false)} className="w-full py-1.5 text-gray-400 text-xs hover:text-gray-600">{t.back}</button>
          </div>
        )}
      </div>
    </div>
  );
}
