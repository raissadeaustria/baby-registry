'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { type Item, type Payment, type Settings, formatPrice } from '@/lib/types';

type Tab = 'items' | 'checklist' | 'contributions' | 'messages' | 'settings';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('items');
  const [items, setItems] = useState<Item[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = useCallback(async () => {
    const [itemsRes, paymentsRes, settingsRes] = await Promise.all([
      fetch('/api/items'),
      fetch('/api/payments'),
      fetch('/api/settings'),
    ]);
    setItems(await itemsRes.json());
    setPayments(await paymentsRes.json());
    setSettings(await settingsRes.json());
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAll();
  }, [fetchAll, isAuthenticated]);

  // Check if already authenticated via session
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_auth');
    if (saved === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        setAuthError(false);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    }
  };

  const copyRegistryLink = () => {
    const link = `${window.location.origin}/registry`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleQr = async () => {
    if (showQr) { setShowQr(false); return; }
    if (!qrDataUrl) {
      const url = `${window.location.origin}/registry`;
      const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#4A3728', light: '#FFFFFF' } });
      setQrDataUrl(dataUrl);
    }
    setShowQr(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBF9F7] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-lg border border-[#F0E8DD] max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C0] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#8B6F5A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-xl font-bold text-[#4A3728] mb-1">Admin Access</h1>
          <p className="text-xs text-[#B8977A] mb-5">Enter your password to manage the registry</p>
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(false); }}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E8D5C0]/60 text-[#4A3728] text-sm bg-white focus:outline-none focus:border-[#D4935A] focus:ring-1 focus:ring-[#D4935A]/30 placeholder-[#C4B09A]"
              placeholder="Password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8977A] hover:text-[#8B6F5A] transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          </div>
          {authError && <p className="text-xs text-red-400 mb-3">Incorrect password</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4935A] to-[#C4834A] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all">
            Enter
          </button>
        </form>
      </div>
    );
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchAll();
  };

  const fulfillItem = async (id: string) => {
    await fetch(`/api/items/${id}/fulfill`, { method: 'POST' });
    fetchAll();
  };

  const unfulfillItem = async (id: string) => {
    await fetch(`/api/items/${id}/fulfill`, { method: 'DELETE' });
    fetchAll();
  };

  const confirmedPayments = payments.filter(p => p.status === 'confirmed');
  const eurPayments = confirmedPayments.filter(p => p.currency === 'EUR');
  const czkPayments = confirmedPayments.filter(p => p.currency !== 'EUR');
  const totalEur = eurPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCzk = czkPayments.reduce((sum, p) => sum + p.amount, 0);
  const searchLower = searchQuery.toLowerCase();
  const matchesSearch = (i: Item) => !searchQuery || i.name.toLowerCase().includes(searchLower) || i.category.toLowerCase().includes(searchLower);
  const fulfilledItems = items.filter(i => i.quantity_fulfilled >= i.quantity_needed && matchesSearch(i));
  const activeItems = items.filter(i => i.quantity_fulfilled < i.quantity_needed && matchesSearch(i));
  const messagesWithDedication = payments.filter(p => p.dedication || p.guest_image);
  const currency = settings?.currency || 'CZK';

  const tabItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'items', label: 'Wishlist', icon: 'gift' },
    { id: 'checklist', label: 'Checklist', icon: 'check' },
    { id: 'contributions', label: 'Gifts', icon: 'heart' },
    { id: 'messages', label: 'Messages', icon: 'mail' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ];

  const tabIcon = (icon: string) => {
    switch (icon) {
      case 'gift': return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
      );
      case 'heart': return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      );
      case 'mail': return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
      );
      case 'check': return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
      );
      case 'gear': return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7]">
      {/* Warm gradient header */}
      <header className="bg-gradient-to-br from-[#F5E6D3] via-[#F8EDE3] to-[#FDF5ED] border-b border-[#E8D5C0]/50">
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8977A] font-medium mb-0.5">Baby Registry</p>
              <h1 className="text-xl font-bold text-[#5C4033]">Hello, Mama</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyRegistryLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs text-[#8B6F5A] font-medium shadow-sm border border-[#E8D5C0]/50 hover:bg-white transition-colors"
              >
                {linkCopied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#6AA66A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Share Link
                  </>
                )}
              </button>
              <button
                onClick={toggleQr}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs text-[#8B6F5A] font-medium shadow-sm border border-[#E8D5C0]/50 hover:bg-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" /></svg>
                QR
              </button>
              <a
                href="/registry"
                target="_blank"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-sm text-xs text-[#8B6F5A] font-medium shadow-sm border border-[#E8D5C0]/50 hover:bg-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Preview
              </a>
            </div>
            {showQr && qrDataUrl && (
              <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-[#E8D5C0]/50 text-center">
                <img src={qrDataUrl} alt="Registry QR Code" className="w-40 h-40 mx-auto mb-2" />
                <p className="text-[10px] text-[#B8977A]">Scan to open registry</p>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = qrDataUrl;
                    a.download = 'registry-qr-code.png';
                    a.click();
                  }}
                  className="mt-2 text-[10px] text-[#D4935A] font-semibold hover:underline"
                >
                  Download QR Code
                </button>
              </div>
            )}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-white/80 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E8F4E8] flex items-center justify-center mx-auto mb-1.5">
                <svg className="w-4 h-4 text-[#6AA66A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-lg font-bold text-[#4A3728]">
                {totalEur > 0 && <span>{formatPrice(totalEur, 'EUR')}</span>}
                {totalEur > 0 && totalCzk > 0 && <br />}
                {totalCzk > 0 && <span>{formatPrice(totalCzk, 'CZK')}</span>}
                {totalEur === 0 && totalCzk === 0 && <span>0</span>}
              </div>
              <p className="text-[10px] text-[#B8977A] font-medium">Received</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-white/80 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E5] flex items-center justify-center mx-auto mb-1.5">
                <svg className="w-4 h-4 text-[#D4935A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <p className="text-lg font-bold text-[#4A3728]">{activeItems.length}</p>
              <p className="text-[10px] text-[#B8977A] font-medium">Remaining</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 text-center border border-white/80 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F0E8F5] flex items-center justify-center mx-auto mb-1.5">
                <svg className="w-4 h-4 text-[#9B7AB8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-lg font-bold text-[#4A3728]">{fulfilledItems.length}</p>
              <p className="text-[10px] text-[#B8977A] font-medium">Fulfilled</p>
            </div>
          </div>

          {/* Progress bar */}
          {items.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-[#8B6F5A] font-medium">Registry Progress</p>
                <p className="text-[11px] text-[#B8977A]">{fulfilledItems.length} of {items.length} fulfilled</p>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#D4935A] to-[#E8B87A] transition-all duration-700"
                  style={{ width: `${items.length > 0 ? (fulfilledItems.length / items.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-0 z-30 bg-[#FBF9F7]/95 backdrop-blur-md border-b border-[#EDE5DB]">
        <div className="max-w-2xl mx-auto px-5">
          <div className="flex">
            {tabItems.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${
                  tab === t.id ? 'text-[#8B6F5A]' : 'text-[#C4B09A] hover:text-[#A08A74]'
                }`}
              >
                {tabIcon(t.icon)}
                <span className="text-[10px] font-semibold uppercase tracking-wider">{t.label}</span>
                {tab === t.id && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#D4935A] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-5 py-5 pb-20">

        {/* ─── ITEMS TAB ─── */}
        {tab === 'items' && (
          <div className="animate-fade-in">
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4B09A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#E8D5C0]/60 text-[#4A3728] text-sm bg-white focus:outline-none focus:border-[#D4935A] focus:ring-1 focus:ring-[#D4935A]/30 placeholder-[#C4B09A] transition-colors"
                />
              </div>
              <button
                onClick={() => { setEditingItem(null); setShowAddItem(true); }}
                className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4935A] to-[#C4834A] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add
              </button>
            </div>

            {showAddItem && (
              <ItemForm
                item={editingItem}
                onSave={() => { setShowAddItem(false); setEditingItem(null); fetchAll(); }}
                onCancel={() => { setShowAddItem(false); setEditingItem(null); }}
              />
            )}

            {/* Active */}
            {activeItems.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#D4935A]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B6F5A]">Active ({activeItems.length})</h3>
                </div>
                <div className="space-y-2.5">
                  {activeItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E8DD]/80 hover:shadow-md transition-shadow group">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#FDF5ED]">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-[#DEC9B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-[#4A3728] text-sm">{item.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] px-2 py-0.5 bg-[#FDF5ED] text-[#B8977A] rounded-full capitalize font-medium">{item.category}</span>
                                {item.priority === 'high' && (
                                  <span className="text-[10px] px-2 py-0.5 bg-[#FFF0E5] text-[#D4935A] rounded-full font-medium">Priority</span>
                                )}
                              </div>
                            </div>
                            <p className="font-bold text-[#4A3728] text-sm">{formatPrice(item.price, item.price_currency)}</p>
                          </div>

                          {/* Progress */}
                          <div className="mt-2.5 flex items-center gap-2">
                            <div className="flex-1 bg-[#F5EDE3] rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-[#D4935A] to-[#E8B87A] transition-all duration-500"
                                style={{ width: `${(item.quantity_fulfilled / item.quantity_needed) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[#B8977A] font-medium whitespace-nowrap">
                              {item.quantity_fulfilled}/{item.quantity_needed}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-[#F5EDE3]">
                        <button
                          onClick={() => fulfillItem(item.id)}
                          className="flex-1 py-2 rounded-xl bg-[#E8F4E8] text-[#6AA66A] text-xs font-semibold hover:bg-[#D4EDD4] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Bought
                        </button>
                        <button
                          onClick={() => { setEditingItem(item); setShowAddItem(true); }}
                          className="py-2 px-3 rounded-xl bg-[#FDF5ED] text-[#8B6F5A] text-xs font-semibold hover:bg-[#F5EDE3] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="py-2 px-3 rounded-xl bg-red-50 text-red-400 text-xs font-semibold hover:bg-red-100 hover:text-red-500 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fulfilled */}
            {fulfilledItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#6AA66A]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6AA66A]">Fulfilled ({fulfilledItems.length})</h3>
                </div>
                <div className="space-y-2">
                  {fulfilledItems.map(item => (
                    <div key={item.id} className="bg-[#F4F9F4] rounded-2xl p-3.5 border border-[#E0EDE0]/80 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4E8] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#6AA66A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#5A7A5A] text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-[#8BAB8B]">{formatPrice(item.price, item.price_currency)}</p>
                      </div>
                      <button
                        onClick={() => unfulfillItem(item.id)}
                        className="text-[10px] text-[#8BAB8B] hover:text-[#5A7A5A] font-medium px-2 py-1 rounded-lg hover:bg-[#E0EDE0] transition-colors flex-shrink-0"
                      >
                        Undo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && !showAddItem && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-[#FDF5ED] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-[#DEC9B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <p className="text-[#8B6F5A] font-medium">No items yet</p>
                <p className="text-xs text-[#B8977A] mt-1">Add your first wishlist item above</p>
              </div>
            )}
          </div>
        )}

        {/* ─── CHECKLIST TAB ─── */}
        {tab === 'checklist' && (
          <BabyChecklist onAddToWishlist={(itemName, category) => {
            setTab('items');
            setEditingItem(null);
            setShowAddItem(true);
            // Pass pre-fill via a small delay so the form mounts first
            setTimeout(() => {
              const nameInput = document.querySelector<HTMLInputElement>('form input[placeholder="Item name *"]');
              if (nameInput) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                nativeInputValueSetter?.call(nameInput, itemName);
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
              const catSelect = document.querySelector<HTMLSelectElement>('form select');
              if (catSelect) {
                catSelect.value = category;
                catSelect.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, 100);
          }} />
        )}

        {/* ─── CONTRIBUTIONS TAB ─── */}
        {tab === 'contributions' && (
          <div className="animate-fade-in">
            {/* Summary */}
            <div className="bg-gradient-to-br from-[#F5E6D3] to-[#FDF5ED] rounded-2xl p-5 mb-5 border border-[#E8D5C0]/30">
              <p className="text-xs text-[#B8977A] uppercase tracking-wider font-medium mb-1">Total Received</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                {totalEur > 0 && <p className="text-3xl font-bold text-[#4A3728]">{formatPrice(totalEur, 'EUR')}</p>}
                {totalCzk > 0 && <p className="text-3xl font-bold text-[#4A3728]">{formatPrice(totalCzk, 'CZK')}</p>}
                {totalEur === 0 && totalCzk === 0 && <p className="text-3xl font-bold text-[#4A3728]">0</p>}
              </div>
              <p className="text-xs text-[#B8977A] mt-1">{confirmedPayments.length} confirmed gifts</p>
              {payments.length > 0 && (
                <DownloadGifts payments={payments} />
              )}
            </div>

            {/* Analytics */}
            {confirmedPayments.length > 0 && (() => {
              const byDay: Record<string, number> = {};
              confirmedPayments.forEach(p => {
                const day = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                byDay[day] = (byDay[day] || 0) + 1;
              });
              const days = Object.entries(byDay).slice(-10);
              const maxCount = Math.max(...days.map(([, c]) => c));
              const byType = { cash: confirmedPayments.filter(p => p.payment_type === 'cash_fund').length, items: confirmedPayments.length - confirmedPayments.filter(p => p.payment_type === 'cash_fund').length };
              return (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white rounded-2xl p-4 border border-[#F0E8DD]/80 shadow-sm">
                    <p className="text-[10px] text-[#B8977A] uppercase tracking-wider font-medium mb-3">Gifts by Day</p>
                    <div className="flex items-end gap-1 h-20">
                      {days.map(([day, count]) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-gradient-to-t from-[#D4935A] to-[#E8B87A] rounded-t-sm transition-all" style={{ height: `${(count / maxCount) * 100}%`, minHeight: 4 }} />
                          <span className="text-[8px] text-[#C4B09A] leading-none">{day.split(' ')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-[#F0E8DD]/80 shadow-sm">
                    <p className="text-[10px] text-[#B8977A] uppercase tracking-wider font-medium mb-3">Gift Types</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-[#8B6F5A] font-medium">Cash Gifts</span>
                          <span className="text-[#B8977A]">{byType.cash}</span>
                        </div>
                        <div className="w-full bg-[#F5EDE3] rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#9B7AB8]" style={{ width: `${confirmedPayments.length > 0 ? (byType.cash / confirmedPayments.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-[#8B6F5A] font-medium">Item Gifts</span>
                          <span className="text-[#B8977A]">{byType.items}</span>
                        </div>
                        <div className="w-full bg-[#F5EDE3] rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#D4935A]" style={{ width: `${confirmedPayments.length > 0 ? (byType.items / confirmedPayments.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {payments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-[#FDF5ED] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-[#DEC9B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <p className="text-[#8B6F5A] font-medium">No gifts yet</p>
                <p className="text-xs text-[#B8977A] mt-1">Share your registry link with family and friends</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {payments.map(payment => (
                  <div key={payment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0E8DD]/80">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8D5C0] to-[#D4935A] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{payment.guest_name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#4A3728] text-sm">{payment.guest_name}</h4>
                            <p className="text-[10px] text-[#B8977A]">{payment.guest_contact}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#4A3728]">{formatPrice(payment.amount, payment.currency || 'CZK')}</p>
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider mt-0.5 ${
                              payment.status === 'confirmed'
                                ? 'bg-[#E8F4E8] text-[#6AA66A]'
                                : 'bg-[#FFF7ED] text-[#D4935A]'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            payment.payment_type === 'cash_fund'
                              ? 'bg-[#F0E8F5] text-[#9B7AB8]'
                              : 'bg-[#FFF0E5] text-[#D4935A]'
                          }`}>
                            {payment.payment_type === 'cash_fund' ? 'Cash Gift' : 'Item Gift'}
                          </span>
                          <span className="text-[10px] text-[#C4B09A]">
                            {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(payment.dedication || payment.guest_image) && (
                      <div className="mt-3 bg-[#FDF5ED] rounded-xl border border-[#F0E8DD] overflow-hidden">
                        {payment.guest_image && (
                          <img src={payment.guest_image} alt={`From ${payment.guest_name}`} className="w-full object-contain max-h-64 bg-gray-50" />
                        )}
                        {payment.dedication && (
                          <p className="p-3 text-xs text-[#8B6F5A] italic leading-relaxed">&ldquo;{payment.dedication}&rdquo;</p>
                        )}
                      </div>
                    )}
                    {payment.guest_contact && (
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`https://wa.me/${payment.guest_contact.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Thank you so much for your generous gift, ${payment.guest_name}! We really appreciate it! 💛`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] text-[10px] font-semibold hover:bg-[#25D366]/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.212l-.252-.149-2.868.852.852-2.868-.149-.252A8 8 0 1112 20z"/></svg>
                          Reply on WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── MESSAGES TAB ─── */}
        {tab === 'messages' && (
          <div className="animate-fade-in">
            {messagesWithDedication.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-[#FDF5ED] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-[#DEC9B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                </div>
                <p className="text-[#8B6F5A] font-medium">No messages yet</p>
                <p className="text-xs text-[#B8977A] mt-1">Dedication letters from guests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Download all */}
                <button
                  onClick={async () => {
                    // Convert images to base64 so they work offline
                    const imageMap: Record<string, string> = {};
                    for (const p of messagesWithDedication) {
                      if (p.guest_image) {
                        try {
                          const res = await fetch(p.guest_image);
                          const blob = await res.blob();
                          const base64 = await new Promise<string>(resolve => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                          });
                          imageMap[p.guest_image] = base64;
                        } catch { /* skip */ }
                      }
                    }

                    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Baby Love Album</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, serif; background: #FBF9F7; color: #4A3728; }
  .cover { text-align: center; padding: 80px 40px; background: linear-gradient(135deg, #F5E6D3, #FDF5ED); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; page-break-after: always; }
  .cover h1 { font-size: 48px; margin-bottom: 12px; }
  .cover p { font-size: 18px; color: #B8977A; }
  .page { page-break-inside: avoid; padding: 40px; max-width: 700px; margin: 0 auto; }
  .card { background: white; border-radius: 16px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); page-break-inside: avoid; }
  .card img { width: 100%; display: block; }
  .card .text { padding: 24px; }
  .card .dedication { font-size: 18px; font-style: italic; line-height: 1.6; margin-bottom: 12px; }
  .card .from { font-size: 13px; color: #B8977A; }
  @media print { body { background: white; } .card { box-shadow: none; border: 1px solid #eee; } }
</style></head><body>
<div class="cover">
  <p style="font-size:64px;margin-bottom:24px;">\u{1F476}</p>
  <h1>With Love</h1>
  <p>Messages &amp; photos from family and friends</p>
</div>
<div class="page">
${messagesWithDedication.map(p => `<div class="card">
  ${p.guest_image && imageMap[p.guest_image] ? `<img src="${imageMap[p.guest_image]}" />` : ''}
  <div class="text">
    ${p.dedication ? `<p class="dedication">&ldquo;${p.dedication}&rdquo;</p>` : ''}
    <p class="from">With love from <strong>${p.guest_name || 'A friend'}</strong> &mdash; ${new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>
</div>`).join('\n')}
</div></body></html>`;
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'baby-love-album.html';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4935A] to-[#C4834A] text-white text-xs font-semibold hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Baby Album
                </button>

                {messagesWithDedication.map(payment => (
                  <div key={payment.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F0E8DD]/80">
                    {payment.guest_image && (
                      <div className="w-full">
                        <img src={payment.guest_image} alt={`From ${payment.guest_name}`} className="w-full object-contain max-h-72 bg-gray-50" />
                      </div>
                    )}
                    {payment.dedication && (
                      <div className="p-4">
                        <p className="text-sm text-[#5C4033] leading-relaxed italic">&ldquo;{payment.dedication}&rdquo;</p>
                      </div>
                    )}
                    <div className="px-4 py-3 bg-[#FDF5ED] border-t border-[#F0E8DD] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8D5C0] to-[#D4935A] flex items-center justify-center">
                          <span className="text-white font-bold text-[9px]">{payment.guest_name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-xs font-medium text-[#8B6F5A]">{payment.guest_name}</span>
                      </div>
                      <span className="text-[10px] text-[#C4B09A]">
                        {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {tab === 'settings' && settings && (
          <div className="animate-fade-in">
            <SettingsForm settings={settings} onSave={fetchAll} />
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-xs w-full mx-4 shadow-2xl text-center animate-fade-in-scale">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-base font-bold text-[#4A3728] mb-1">Delete this item?</h3>
            <p className="text-xs text-[#B8977A] mb-5">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[#E8D5C0]/60 text-sm font-medium text-[#8B6F5A] hover:bg-[#FDF5ED] transition-colors">Cancel</button>
              <button onClick={() => deleteItem(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Item Form ───
function ItemForm({ item, onSave, onCancel }: {
  item: Item | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [deliveryPrice, setDeliveryPrice] = useState(item?.delivery_price?.toString() || '0');
  const [priceCurrency, setPriceCurrency] = useState(item?.price_currency || 'CZK');
  const [sourceUrl, setSourceUrl] = useState(item?.source_url || '');
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [category, setCategory] = useState(item?.category || 'general');
  const [quantityNeeded, setQuantityNeeded] = useState(item?.quantity_needed?.toString() || '1');
  const [priority, setPriority] = useState(item?.priority || 'medium');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#E8D5C0]/60 text-[#4A3728] text-sm bg-white focus:outline-none focus:border-[#D4935A] focus:ring-1 focus:ring-[#D4935A]/30 placeholder-[#C4B09A] transition-colors";

  const handleImportUrl = async () => {
    if (!sourceUrl.trim()) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportStatus({ type: 'error', message: data.error || 'Failed to fetch' });
        return;
      }
      const filled: string[] = [];
      if (data.name) { setName(data.name); filled.push('name'); }
      if (data.description) { setDescription(data.description); filled.push('description'); }
      if (data.price !== null) { setPrice(String(data.price)); filled.push('price'); }
      if (data.delivery_price !== null && data.delivery_price > 0) { setDeliveryPrice(String(data.delivery_price)); filled.push('delivery'); }
      if (data.image_url) { setImageUrl(data.image_url); filled.push('image'); }

      if (filled.length > 0) {
        setImportStatus({ type: 'success', message: `Imported: ${filled.join(', ')}` });
      } else {
        setImportStatus({ type: 'error', message: 'No product data found. This site may require JavaScript. Try copying details manually.' });
      }
    } catch {
      setImportStatus({ type: 'error', message: 'Could not connect to the URL' });
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name, description, price: parseFloat(price), price_currency: priceCurrency, delivery_price: parseFloat(deliveryPrice) || 0,
      source_url: sourceUrl || null, image_url: imageUrl,
      category, quantity_needed: parseInt(quantityNeeded), priority,
    };

    if (item) {
      await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-[#F0E8DD]/80 shadow-sm mb-5 space-y-3 animate-fade-in">
      <h3 className="font-bold text-[#4A3728] text-sm">{item ? 'Edit Item' : 'New Item'}</h3>

      {/* URL Import */}
      <div className="bg-[#FDF5ED] rounded-xl p-3.5 border border-[#E8D5C0]/40">
        <label className="text-[10px] text-[#B8977A] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          Import from Product URL
        </label>
        <div className="flex gap-2">
          <input
            value={sourceUrl}
            onChange={e => setSourceUrl(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#E8D5C0]/60 text-[#4A3728] text-sm bg-white focus:outline-none focus:border-[#D4935A] placeholder-[#C4B09A]"
            placeholder="Paste product link here..."
          />
          <button
            type="button"
            onClick={handleImportUrl}
            disabled={importing || !sourceUrl.trim()}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#D4935A] to-[#C4834A] text-white text-xs font-semibold disabled:opacity-40 transition-all active:scale-[0.97] whitespace-nowrap"
          >
            {importing ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                Fetching...
              </span>
            ) : 'Import'}
          </button>
        </div>
        {importStatus && (
          <div className={`text-[11px] mt-1.5 ${importStatus.type === 'error' ? 'text-red-400' : 'text-[#6AA66A]'}`}>
            <p>{importStatus.type === 'success' && '\u2713 '}{importStatus.message}</p>
            {importStatus.type === 'error' && (
              <p className="text-[10px] text-[#C4B09A] mt-1">
                Tip: Right-click the product image &rarr; &quot;Copy Image Address&quot; and paste it in the Image URL field below
              </p>
            )}
          </div>
        )}
        {!importStatus && <p className="text-[10px] text-[#C4B09A] mt-1.5">Auto-fills name, image, price &amp; delivery from the product page</p>}
      </div>

      {/* Image preview */}
      {imageUrl && (
        <div className="relative rounded-xl overflow-hidden bg-[#FDF5ED] border border-[#E8D5C0]/40">
          <img src={imageUrl} alt="Preview" className="w-full h-40 object-contain" />
          <button
            type="button"
            onClick={() => setImageUrl('')}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      <input required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Item name *" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} resize-none`} placeholder="Description (optional)" rows={2} />
      {/* Currency toggle */}
      <div>
        <label className="text-[10px] text-[#B8977A] font-medium uppercase tracking-wider mb-1.5 block">Price Currency</label>
        <div className="flex bg-[#F5EDE3] rounded-xl p-0.5 w-fit">
          <button type="button" onClick={() => setPriceCurrency('CZK')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${priceCurrency === 'CZK' ? 'bg-white text-[#4A3728] shadow-sm' : 'text-[#B8977A]'}`}>
            Kč CZK
          </button>
          <button type="button" onClick={() => setPriceCurrency('EUR')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${priceCurrency === 'EUR' ? 'bg-white text-[#4A3728] shadow-sm' : 'text-[#B8977A]'}`}>
            &euro; EUR
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Price ({priceCurrency}) *</label>
          <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="0" />
        </div>
        <div>
          <label className="text-[10px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Delivery ({priceCurrency})</label>
          <input type="number" step="0.01" min="0" value={deliveryPrice} onChange={e => setDeliveryPrice(e.target.value)} className={inputClass} placeholder="0" />
        </div>
        <div>
          <label className="text-[10px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Qty Needed</label>
          <input type="number" min="1" value={quantityNeeded} onChange={e => setQuantityNeeded(e.target.value)} className={inputClass} placeholder="1" />
        </div>
      </div>
      <div className="flex gap-3 items-start">
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={`${inputClass} flex-1`} placeholder="Image URL (optional)" />
        {imageUrl && (
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#E8D5C0]/60 bg-[#FDF5ED]">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
          <option value="general">General</option>
          <option value="clothing">Clothing</option>
          <option value="nursery">Nursery</option>
          <option value="feeding">Feeding</option>
          <option value="toys">Toys</option>
          <option value="essentials">Essentials</option>
          <option value="travel">Travel</option>
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} className={inputClass}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium</option>
          <option value="high">High Priority</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-[#E8D5C0] text-[#8B6F5A] text-sm font-medium hover:bg-[#FDF5ED] transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4935A] to-[#C4834A] text-white text-sm font-semibold hover:shadow-md transition-all active:scale-[0.98]">
          {item ? 'Update' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}

// ─── Baby Checklist ───
const CHECKLIST_DATA: { category: string; emoji: string; dbCategory: string; items: string[] }[] = [
  {
    category: 'During Pregnancy',
    emoji: '\u{1F930}',
    dbCategory: 'essentials',
    items: [
      'Maternity pillow',
      'Prenatal vitamins',
      'Stretch mark cream/oil',
      'Maternity clothes',
      'Pregnancy journal/book',
      'Belly band/support belt',
      'Comfortable bras (nursing-ready)',
    ],
  },
  {
    category: 'Hospital Bag - Mom',
    emoji: '\u{1F3E5}',
    dbCategory: 'essentials',
    items: [
      'Comfortable robe & slippers',
      'Nursing nightgown',
      'Toiletries & lip balm',
      'Phone charger (long cable)',
      'Snacks & water bottle',
      'Going-home outfit',
      'Nursing pads',
      'Postpartum underwear',
      'Perineal care items',
    ],
  },
  {
    category: 'Hospital Bag - Baby',
    emoji: '\u{1F476}',
    dbCategory: 'clothing',
    items: [
      'Going-home outfit (newborn size)',
      'Onesies (2-3)',
      'Socks & mittens',
      'Swaddle blanket',
      'Baby hat/beanie',
      'Car seat (installed & ready)',
      'Diapers (newborn size)',
    ],
  },
  {
    category: 'Nursery',
    emoji: '\u{1F6CF}\u{FE0F}',
    dbCategory: 'nursery',
    items: [
      'Crib or bassinet',
      'Firm mattress',
      'Fitted crib sheets (2-3)',
      'Baby monitor',
      'Blackout curtains',
      'Night light',
      'Dresser/changing table',
      'Changing pad & covers',
      'Diaper pail',
      'Rocking chair/glider',
      'Storage baskets/bins',
      'Mobile or wall decor',
    ],
  },
  {
    category: 'Feeding',
    emoji: '\u{1F37C}',
    dbCategory: 'feeding',
    items: [
      'Breast pump',
      'Nursing pillow',
      'Bottles (various sizes)',
      'Bottle brush',
      'Bottle sterilizer',
      'Burp cloths (6-8)',
      'Bibs',
      'Formula (if needed)',
      'Breast milk storage bags',
      'Nursing cover',
      'High chair (for later)',
    ],
  },
  {
    category: 'Clothing (0-3 months)',
    emoji: '\u{1F455}',
    dbCategory: 'clothing',
    items: [
      'Bodysuits/onesies (8-10)',
      'Sleepers/footie pajamas (4-6)',
      'Socks (6-8 pairs)',
      'Hats (2-3)',
      'Mittens (2-3 pairs)',
      'Light jacket/cardigan',
      'Swaddle wraps (3-4)',
    ],
  },
  {
    category: 'Bath & Hygiene',
    emoji: '\u{1F6C1}',
    dbCategory: 'essentials',
    items: [
      'Baby bathtub',
      'Hooded towels (2-3)',
      'Washcloths (6-8)',
      'Baby shampoo & body wash',
      'Baby lotion',
      'Nail clippers/file',
      'Soft brush & comb',
      'Diaper cream',
      'Baby thermometer',
      'Nasal aspirator',
    ],
  },
  {
    category: 'Travel & Outings',
    emoji: '\u{1F6D2}',
    dbCategory: 'travel',
    items: [
      'Stroller',
      'Car seat',
      'Baby carrier/wrap',
      'Diaper bag',
      'Portable changing pad',
      'Stroller rain cover',
      'Sun shade for stroller',
      'Car mirror (rear-facing)',
    ],
  },
  {
    category: 'Toys & Development',
    emoji: '\u{1F9F8}',
    dbCategory: 'toys',
    items: [
      'Soft rattles',
      'Play mat/activity gym',
      'Black & white contrast cards',
      'Soft plush toy',
      'Teething toys',
      'Board books',
      'Musical toy',
      'Bouncer/swing',
    ],
  },
  {
    category: 'Safety & Health',
    emoji: '\u{1F6E1}\u{FE0F}',
    dbCategory: 'essentials',
    items: [
      'Baby first aid kit',
      'Baby-safe detergent',
      'Outlet covers',
      'Cabinet locks',
      'Corner protectors',
      'Baby gate (for later)',
      'Smoke & CO detectors',
      'Emergency contacts list',
    ],
  },
  {
    category: 'Mom Recovery (After Birth)',
    emoji: '\u{1F49C}',
    dbCategory: 'essentials',
    items: [
      'Postpartum pads (heavy flow)',
      'Peri bottle',
      'Witch hazel pads / cooling pads',
      'Nipple cream (lanolin)',
      'Postpartum belly wrap',
      'Stool softener',
      'Comfortable high-waist underwear',
      'Nursing bras (2-3)',
      'Heating pad',
      'Healthy snacks & meal prep',
      'Water bottle (large, one-handed)',
      'Dry shampoo',
      'Sitz bath',
    ],
  },
  {
    category: 'Mom Mental Health',
    emoji: '\u{1F9D8}\u{200D}\u{2640}\u{FE0F}',
    dbCategory: 'essentials',
    items: [
      'Journal / gratitude notebook',
      'Postpartum support book',
      'Therapist / counselor contact',
      'Relaxation essentials (candles, tea)',
      'Noise-cancelling earbuds',
      'Eye mask for naps',
      'Postpartum doula (research)',
    ],
  },
  {
    category: 'Baby 3-6 Months',
    emoji: '\u{1F423}',
    dbCategory: 'general',
    items: [
      'Clothing size 62-68',
      'Sleep sack / wearable blanket',
      'Teething rings',
      'Playmat / activity gym',
      'Bumbo seat or sit-up support',
      'Soft-soled shoes',
      'Sun hat',
      'Baby sunscreen',
      'Sippy cup (intro)',
      'Larger bottles (if bottle-feeding)',
    ],
  },
  {
    category: 'Baby 6-12 Months',
    emoji: '\u{1F476}\u{1F3FB}',
    dbCategory: 'general',
    items: [
      'High chair',
      'Baby-led weaning supplies (plates, spoons)',
      'Food processor / blender',
      'Snack cups',
      'Clothing size 68-80',
      'Crawling knee pads',
      'Baby-proofing kit (full house)',
      'Push walker / activity table',
      'Board books',
      'Stacking toys / shape sorter',
      'Swim diaper & swimsuit',
      'First shoes (soft sole)',
      'Toothbrush & baby toothpaste',
    ],
  },
  {
    category: 'Baby 1 Year+',
    emoji: '\u{1F382}',
    dbCategory: 'general',
    items: [
      'Toddler car seat (forward-facing)',
      'Toddler bed or crib conversion kit',
      'Potty training seat',
      'Toddler tableware set',
      'Sippy cup / straw cup',
      'Clothing size 80-92',
      'Rain boots & rain jacket',
      'Winter snowsuit',
      'Ride-on toys',
      'Crayons & art supplies',
      'Backpack (toddler size)',
      'Night light (toddler room)',
    ],
  },
];

function BabyChecklist({ onAddToWishlist }: { onAddToWishlist: (name: string, category: string) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('baby-checklist');
        return saved ? JSON.parse(saved) : {};
      } catch { return {}; }
    }
    return {};
  });

  const [customItems, setCustomItems] = useState<{ name: string; id: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('baby-checklist-custom');
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    return [];
  });

  const [newItem, setNewItem] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(CHECKLIST_DATA[0].category);

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('baby-checklist', JSON.stringify(next));
      return next;
    });
  };

  const addCustomItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const item = { name: trimmed, id: `custom-${Date.now()}` };
    const next = [...customItems, item];
    setCustomItems(next);
    localStorage.setItem('baby-checklist-custom', JSON.stringify(next));
    setNewItem('');
  };

  const removeCustomItem = (id: string) => {
    const next = customItems.filter(i => i.id !== id);
    setCustomItems(next);
    localStorage.setItem('baby-checklist-custom', JSON.stringify(next));
    // Also remove its checked state
    setChecked(prev => {
      const updated = { ...prev };
      delete updated[id];
      localStorage.setItem('baby-checklist', JSON.stringify(updated));
      return updated;
    });
  };

  const totalItems = CHECKLIST_DATA.reduce((s, c) => s + c.items.length, 0) + customItems.length;
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progress = totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;

  return (
    <div className="animate-fade-in">
      {/* Progress overview */}
      <div className="bg-gradient-to-br from-[#F5E6D3] to-[#FDF5ED] rounded-2xl p-5 mb-5 border border-[#E8D5C0]/30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-[#B8977A] uppercase tracking-wider font-medium">Preparation Progress</p>
            <p className="text-2xl font-bold text-[#4A3728]">{totalChecked} <span className="text-sm font-normal text-[#B8977A]">of {totalItems} items</span></p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-[#E8D5C0] flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#D4935A" strokeWidth="4" strokeDasharray={`${progress * 1.508} 150.8`} strokeLinecap="round" />
            </svg>
            <span className="text-xs font-bold text-[#4A3728]">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <div className="h-2 rounded-full bg-gradient-to-r from-[#D4935A] to-[#E8B87A] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px] text-[#C4B09A] mt-2">Check items off as you prepare. Tap the + button to add an item to your gift wishlist.</p>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        {CHECKLIST_DATA.map(cat => {
          const catChecked = cat.items.filter((_, i) => checked[`${cat.category}-${i}`]).length;
          const isOpen = expandedCat === cat.category;

          return (
            <div key={cat.category} className="bg-white rounded-2xl border border-[#F0E8DD]/80 shadow-sm overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => setExpandedCat(isOpen ? null : cat.category)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#4A3728] text-sm">{cat.category}</h4>
                  <p className="text-[10px] text-[#B8977A]">{catChecked}/{cat.items.length} done</p>
                </div>
                {/* Mini progress */}
                <div className="w-12 bg-[#F5EDE3] rounded-full h-1.5 mr-2">
                  <div
                    className="h-1.5 rounded-full bg-[#D4935A] transition-all duration-300"
                    style={{ width: `${cat.items.length > 0 ? (catChecked / cat.items.length) * 100 : 0}%` }}
                  />
                </div>
                <svg className={`w-4 h-4 text-[#C4B09A] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Items */}
              {isOpen && (
                <div className="border-t border-[#F5EDE3] px-4 pb-2">
                  {cat.items.map((itemName, i) => {
                    const key = `${cat.category}-${i}`;
                    const isChecked = !!checked[key];
                    return (
                      <div key={key} className="flex items-center gap-3 py-2.5 border-b border-[#FAF5F0] last:border-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggle(key)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isChecked
                              ? 'bg-[#6AA66A] border-[#6AA66A]'
                              : 'border-[#DEC9B0] hover:border-[#D4935A]'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                        {/* Label */}
                        <span className={`flex-1 text-sm transition-colors ${
                          isChecked ? 'text-[#C4B09A] line-through' : 'text-[#5C4033]'
                        }`}>
                          {itemName}
                        </span>
                        {/* Add to wishlist */}
                        <button
                          onClick={() => onAddToWishlist(itemName, cat.dbCategory)}
                          className="w-7 h-7 rounded-lg bg-[#FDF5ED] text-[#D4935A] flex items-center justify-center hover:bg-[#F5EDE3] transition-colors flex-shrink-0"
                          title="Add to wishlist"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ─── My Custom Items ─── */}
        <div className="bg-white rounded-2xl border border-[#F0E8DD]/80 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedCat(expandedCat === '_custom' ? null : '_custom')}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="text-lg">{'\u{270F}\u{FE0F}'}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#4A3728] text-sm">My Custom Items</h4>
              <p className="text-[10px] text-[#B8977A]">
                {customItems.filter(ci => checked[ci.id]).length}/{customItems.length} done
              </p>
            </div>
            {customItems.length > 0 && (
              <div className="w-12 bg-[#F5EDE3] rounded-full h-1.5 mr-2">
                <div
                  className="h-1.5 rounded-full bg-[#9B7AB8] transition-all duration-300"
                  style={{ width: `${customItems.length > 0 ? (customItems.filter(ci => checked[ci.id]).length / customItems.length) * 100 : 0}%` }}
                />
              </div>
            )}
            <svg className={`w-4 h-4 text-[#C4B09A] transition-transform duration-200 ${expandedCat === '_custom' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedCat === '_custom' && (
            <div className="border-t border-[#F5EDE3] px-4 pb-3">
              {/* Add new item input */}
              <div className="flex gap-2 py-3 border-b border-[#FAF5F0]">
                <input
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(); } }}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#E8D5C0]/60 text-sm text-[#4A3728] placeholder-[#C4B09A] focus:outline-none focus:border-[#D4935A] bg-white"
                  placeholder="Add your own item..."
                />
                <button
                  onClick={addCustomItem}
                  disabled={!newItem.trim()}
                  className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#9B7AB8] to-[#8A6AA8] text-white text-xs font-semibold disabled:opacity-40 transition-all active:scale-[0.97]"
                >
                  Add
                </button>
              </div>

              {/* Custom items list */}
              {customItems.length === 0 ? (
                <p className="text-xs text-[#C4B09A] text-center py-4">
                  Add items that aren&apos;t in the lists above
                </p>
              ) : (
                customItems.map(ci => {
                  const isChecked = !!checked[ci.id];
                  return (
                    <div key={ci.id} className="flex items-center gap-3 py-2.5 border-b border-[#FAF5F0] last:border-0">
                      <button
                        onClick={() => toggle(ci.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked
                            ? 'bg-[#6AA66A] border-[#6AA66A]'
                            : 'border-[#DEC9B0] hover:border-[#D4935A]'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm transition-colors ${
                        isChecked ? 'text-[#C4B09A] line-through' : 'text-[#5C4033]'
                      }`}>
                        {ci.name}
                      </span>
                      <button
                        onClick={() => onAddToWishlist(ci.name, 'general')}
                        className="w-7 h-7 rounded-lg bg-[#FDF5ED] text-[#D4935A] flex items-center justify-center hover:bg-[#F5EDE3] transition-colors flex-shrink-0"
                        title="Add to wishlist"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                      <button
                        onClick={() => removeCustomItem(ci.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-300 flex items-center justify-center hover:bg-red-100 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Download Gifts ───
function DownloadGifts({ payments }: { payments: Payment[] }) {
  const [open, setOpen] = useState(false);

  const download = (filter: 'all' | 'eur' | 'czk' | 'cash' | 'items' | 'confirmed' | 'pending') => {
    let filtered = payments;
    let filename = 'gifts';

    switch (filter) {
      case 'eur': filtered = payments.filter(p => p.currency === 'EUR'); filename = 'gifts-eur'; break;
      case 'czk': filtered = payments.filter(p => p.currency !== 'EUR'); filename = 'gifts-czk'; break;
      case 'cash': filtered = payments.filter(p => p.payment_type === 'cash_fund'); filename = 'gifts-cash'; break;
      case 'items': filtered = payments.filter(p => p.payment_type !== 'cash_fund'); filename = 'gifts-items'; break;
      case 'confirmed': filtered = payments.filter(p => p.status === 'confirmed'); filename = 'gifts-confirmed'; break;
      case 'pending': filtered = payments.filter(p => p.status === 'pending'); filename = 'gifts-pending'; break;
    }

    if (filtered.length === 0) return;

    const rows = ['Name,Contact,Type,Amount,Currency,Status,Date,Dedication'];
    filtered.forEach(p => {
      rows.push([
        `"${p.guest_name || ''}"`,
        `"${p.guest_contact || ''}"`,
        p.payment_type === 'cash_fund' ? 'Cash' : 'Items',
        p.amount,
        p.currency || 'CZK',
        p.status,
        new Date(p.created_at).toLocaleDateString(),
        `"${(p.dedication || '').replace(/"/g, '""')}"`,
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const filters: { key: 'all' | 'eur' | 'czk' | 'cash' | 'items' | 'confirmed' | 'pending'; label: string; count: number }[] = [
    { key: 'all', label: 'All Gifts', count: payments.length },
    { key: 'confirmed', label: 'Confirmed Only', count: payments.filter(p => p.status === 'confirmed').length },
    { key: 'pending', label: 'Pending Only', count: payments.filter(p => p.status === 'pending').length },
    { key: 'eur', label: 'EUR Payments', count: payments.filter(p => p.currency === 'EUR').length },
    { key: 'czk', label: 'CZK Payments', count: payments.filter(p => p.currency !== 'EUR').length },
    { key: 'cash', label: 'Cash Gifts', count: payments.filter(p => p.payment_type === 'cash_fund').length },
    { key: 'items', label: 'Item Gifts', count: payments.filter(p => p.payment_type !== 'cash_fund').length },
  ];

  return (
    <div className="mt-3 relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-2.5 rounded-xl bg-white/70 text-[#8B6F5A] text-xs font-semibold border border-[#E8D5C0]/50 hover:bg-white transition-colors flex items-center justify-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Download List
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => download(f.key)}
                disabled={f.count === 0}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#FDF5ED] transition-colors disabled:opacity-30 disabled:cursor-default"
              >
                <span className="text-sm text-[#4A3728]">{f.label}</span>
                <span className="text-[10px] text-[#B8977A] bg-[#F5EDE3] px-2 py-0.5 rounded-full">{f.count}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Bank Account List ───
function BankAccountList({ accounts, onChange, placeholder, label }: {
  accounts: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}) {
  // Support both old format (string[]) and new format ({details,qr}[])
  let parsed: { details: string; qr: string }[] = [];
  try {
    const raw = JSON.parse(accounts);
    if (Array.isArray(raw)) {
      parsed = raw.map((item: string | { details: string; qr: string }) =>
        typeof item === 'string' ? { details: item, qr: '' } : item
      );
    }
  } catch { parsed = []; }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#E8D5C0]/60 text-[#4A3728] text-sm bg-white focus:outline-none focus:border-[#D4935A] focus:ring-1 focus:ring-[#D4935A]/30 placeholder-[#C4B09A] transition-colors";

  const updateAccount = (index: number, field: 'details' | 'qr', value: string) => {
    const next = [...parsed];
    next[index] = { ...next[index], [field]: value };
    onChange(JSON.stringify(next));
  };

  const addAccount = () => {
    onChange(JSON.stringify([...parsed, { details: '', qr: '' }]));
  };

  const removeAccount = (index: number) => {
    const next = parsed.filter((_, i) => i !== index);
    onChange(JSON.stringify(next));
  };

  const handleQrUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { compressImage } = await import('@/lib/imageUtils');
    const compressed = await compressImage(file, 400, 0.8);
    const formData = new FormData();
    formData.append('file', compressed);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      updateAccount(index, 'qr', data.url);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider">
          Bank Accounts ({label})
        </label>
        <span className="text-[10px] text-[#C4B09A]">{parsed.length} account{parsed.length !== 1 ? 's' : ''}</span>
      </div>

      {parsed.map((account, i) => (
        <div key={i} className="bg-[#FDF5ED]/50 rounded-xl p-3 border border-[#E8D5C0]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#B8977A] font-medium">Account {i + 1}</span>
            <button type="button" onClick={() => removeAccount(i)}
              className="text-[10px] text-red-300 hover:text-red-500 transition-colors">Remove</button>
          </div>
          <textarea
            value={account.details}
            onChange={e => updateAccount(i, 'details', e.target.value)}
            className={`${inputClass} resize-none font-mono mb-2`}
            rows={3}
            placeholder={placeholder}
          />
          {/* QR Code */}
          <div>
            <label className="text-[10px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">QR Code</label>
            {account.qr ? (
              <div className="flex items-start gap-2">
                <img src={account.qr} alt="QR Code" className="w-20 h-20 object-contain rounded-lg border border-[#E8D5C0]/50 bg-white" />
                <button type="button" onClick={() => updateAccount(i, 'qr', '')}
                  className="text-[10px] text-red-300 hover:text-red-500 transition-colors mt-1">Remove</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed border-[#E8D5C0] cursor-pointer hover:border-[#D4935A] transition-colors">
                <input type="file" accept="image/*" onChange={e => handleQrUpload(i, e)} className="hidden" />
                <svg className="w-4 h-4 text-[#C4B09A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="text-[11px] text-[#C4B09A]">Upload QR code image</span>
              </label>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addAccount}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E8D5C0] text-[#B8977A] text-xs font-semibold hover:border-[#D4935A] hover:text-[#D4935A] transition-colors flex items-center justify-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Bank Account
      </button>
    </div>
  );
}

// ─── Settings Form ───
function SettingsForm({ settings, onSave }: { settings: Settings; onSave: () => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#E8D5C0]/60 text-[#4A3728] text-sm bg-white focus:outline-none focus:border-[#D4935A] focus:ring-1 focus:ring-[#D4935A]/30 placeholder-[#C4B09A] transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave();
  };

  const update = (key: keyof Settings, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Registry Info */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0E8DD]/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#FDF5ED] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#D4935A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h3 className="font-bold text-[#4A3728] text-sm">Registry Info</h3>
        </div>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Your Name</label>
          <input value={form.mom_name} onChange={e => update('mom_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Baby&apos;s Name</label>
          <input value={form.baby_name} onChange={e => update('baby_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Welcome Message</label>
          <textarea value={form.welcome_message} onChange={e => update('welcome_message', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Theme</label>
            <select value={form.theme} onChange={e => update('theme', e.target.value)} className={inputClass}>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment - EUR */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0E8DD]/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0FA] flex items-center justify-center">
            <span className="text-sm">{'\u{1F1EA}\u{1F1FA}'}</span>
          </div>
          <div>
            <h3 className="font-bold text-[#4A3728] text-sm">EUR Payment</h3>
            <p className="text-[10px] text-[#C4B09A]">Shown to EUR-EN and EUR-ES guests</p>
          </div>
        </div>
        <BankAccountList
          accounts={form.bank_accounts_eur}
          onChange={(val) => update('bank_accounts_eur', val)}
          placeholder="IBAN: ES00 0000 0000 0000&#10;Bank: ...&#10;BIC/SWIFT: ..."
          label="EUR"
        />
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Revolut Link</label>
          <input value={form.revolut_link_eur} onChange={e => update('revolut_link_eur', e.target.value)}
            className={inputClass} placeholder="https://revolut.me/yourname" />
        </div>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            Bizum Phone Number
            <span className="text-[9px] font-normal normal-case text-[#C4B09A]">(Spain)</span>
          </label>
          <input value={form.bizum_phone} onChange={e => update('bizum_phone', e.target.value)}
            className={inputClass} placeholder="+34 600 000 000" />
        </div>
      </div>

      {/* Payment - CZK */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0E8DD]/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#E8F4E8] flex items-center justify-center">
            <span className="text-sm">{'\u{1F1E8}\u{1F1FF}'}</span>
          </div>
          <div>
            <h3 className="font-bold text-[#4A3728] text-sm">CZK Payment</h3>
            <p className="text-[10px] text-[#C4B09A]">Shown to CZK-EN and CZK-CZ guests</p>
          </div>
        </div>
        <BankAccountList
          accounts={form.bank_accounts_czk}
          onChange={(val) => update('bank_accounts_czk', val)}
          placeholder="Číslo účtu: 0000000000/0000&#10;Banka: ...&#10;IBAN: CZ00 0000 0000 0000"
          label="CZK"
        />
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 block">Revolut Link</label>
          <input value={form.revolut_link_czk} onChange={e => update('revolut_link_czk', e.target.value)}
            className={inputClass} placeholder="https://revolut.me/yourname" />
        </div>
      </div>

      {/* Thank You Messages */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0E8DD]/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#F0E8F5] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#9B7AB8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h3 className="font-bold text-[#4A3728] text-sm">Thank You Messages</h3>
        </div>
        <p className="text-[10px] text-[#C4B09A]">Shown after a guest confirms payment. Each language gets its own message.</p>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>{'\u{1F1EC}\u{1F1E7}'}</span> English
          </label>
          <textarea value={form.thank_you_message} onChange={e => update('thank_you_message', e.target.value)}
            className={`${inputClass} resize-none`} rows={2} />
        </div>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>{'\u{1F1EA}\u{1F1F8}'}</span> Español
          </label>
          <textarea value={form.thank_you_message_es} onChange={e => update('thank_you_message_es', e.target.value)}
            className={`${inputClass} resize-none`} rows={2} />
        </div>
        <div>
          <label className="text-[11px] text-[#B8977A] font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>{'\u{1F1E8}\u{1F1FF}'}</span> Česky
          </label>
          <textarea value={form.thank_you_message_cz} onChange={e => update('thank_you_message_cz', e.target.value)}
            className={`${inputClass} resize-none`} rows={2} />
        </div>
      </div>

      <button type="submit" disabled={saving}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
          saved
            ? 'bg-[#6AA66A] text-white'
            : 'bg-gradient-to-r from-[#D4935A] to-[#C4834A] text-white shadow-md hover:shadow-lg'
        }`}>
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </form>
  );
}
