export interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_currency: string;
  delivery_price: number;
  source_url: string | null;
  image_url: string | null;
  category: string;
  quantity_needed: number;
  quantity_fulfilled: number;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  name: string;
  contact: string;
  contact_type: string;
  created_at: string;
}

export interface Payment {
  id: string;
  guest_id: string;
  payment_type: string;
  amount: number;
  status: string;
  currency: string;
  dedication: string | null;
  guest_image: string | null;
  created_at: string;
  guest_name?: string;
  guest_contact?: string;
  items?: PaymentItem[];
}

export interface PaymentItem {
  id: string;
  payment_id: string;
  item_id: string;
  quantity: number;
  item_name?: string;
  item_price?: number;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface Settings {
  theme: string;
  mom_name: string;
  baby_name: string;
  welcome_message: string;
  bank_details: string;
  bank_accounts_eur: string;
  bank_accounts_czk: string;
  revolut_link_eur: string;
  revolut_link_czk: string;
  bizum_phone: string;
  thank_you_message: string;
  thank_you_message_es: string;
  thank_you_message_cz: string;
  currency: string;
}

export type Currency = 'CZK' | 'EUR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CZK: 'Kč',
  EUR: '\u20AC',
};

const EUR_TO_CZK = 25;

export function convertPrice(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'EUR' && toCurrency === 'CZK') return Math.round(amount * EUR_TO_CZK);
  if (fromCurrency === 'CZK' && toCurrency === 'EUR') return Math.round((amount / EUR_TO_CZK) * 100) / 100;
  return amount;
}

export function formatPrice(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency as Currency] || currency;
  if (currency === 'CZK') {
    return `${amount.toFixed(0)} ${sym}`;
  }
  return `${sym}${amount.toFixed(2)}`;
}
