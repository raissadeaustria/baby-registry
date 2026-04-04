export type Locale = 'EUR-EN' | 'EUR-ES' | 'CZK-EN' | 'CZK-CZ';

export interface Translations {
  // Header & Hero
  registry: string;
  welcomeTo: string;
  giftRegistry: string;
  hostedBy: string;
  wishes: string;
  fulfilled: string;
  available: string;
  // Items
  allItems: string;
  showing: string;
  items: string;
  left: string;
  topPick: string;
  addToList: string;
  added: string;
  inYourList: string;
  of: string;
  delivery: string;
  noItems: string;
  checkBackSoon: string;
  // Cash fund
  cashGift: string;
  sendAnyAmount: string;
  otherAmount: string;
  send: string;
  yourName: string;
  contact: string;
  dedicationMessage: string;
  back: string;
  continue_: string;
  amount: string;
  bankTransfer: string;
  payWithQr: string;
  orBankTransfer: string;
  copyAccountDetails: string;
  copied: string;
  choosePaymentMethod: string;
  payWithRevolut: string;
  iHaveSentPayment: string;
  processing: string;
  // Cart
  yourGiftList: string;
  itemsSelected: string;
  viewGiftList: string;
  checkout: string;
  proceedToCheckout: string;
  total: string;
  remove: string;
  each: string;
  // Checkout
  yourDetails: string;
  orderSummary: string;
  payment: string;
  enterFullName: string;
  whatsapp: string;
  email: string;
  dedicationLetter: string;
  writeSpecialMessage: string;
  payNow: string;
  amountToPay: string;
  bankDetailsNotConfigured: string;
  from: string;
  message: string;
  // Thank you
  thankYou: string;
  giftRecorded: string;
  done: string;
}

const en: Translations = {
  registry: 'Registry',
  welcomeTo: 'Welcome to',
  giftRegistry: 'Gift Registry',
  hostedBy: 'Hosted by',
  wishes: 'Wishes',
  fulfilled: 'Fulfilled',
  available: 'Available',
  allItems: 'All Items',
  showing: 'Showing',
  items: 'items',
  left: 'left',
  topPick: 'Top Pick',
  addToList: 'Add to List',
  added: 'Added',
  inYourList: 'in your list',
  of: 'of',
  delivery: 'delivery',
  noItems: 'No items available',
  checkBackSoon: 'Check back soon for updates!',
  cashGift: 'Cash Gift',
  sendAnyAmount: 'Send any amount directly',
  otherAmount: 'Other amount',
  send: 'Send',
  yourName: 'Your Name',
  contact: 'Contact',
  dedicationMessage: 'Dedication message (optional)',
  back: 'Back',
  continue_: 'Continue',
  amount: 'Amount',
  bankTransfer: 'Bank Transfer',
  payWithQr: 'Pay with QR Code',
  orBankTransfer: 'Or send via Bank Transfer',
  copyAccountDetails: 'Copy Account Details',
  copied: 'Copied!',
  choosePaymentMethod: 'Choose payment method',
  payWithRevolut: 'Pay with Revolut',
  iHaveSentPayment: 'I Have Sent the Payment',
  processing: 'Processing...',
  yourGiftList: 'Your Gift List',
  itemsSelected: 'items selected',
  viewGiftList: 'View Gift List',
  checkout: 'Checkout',
  proceedToCheckout: 'Proceed to Checkout',
  total: 'Total',
  remove: 'Remove',
  each: 'each',
  yourDetails: 'Your Details',
  orderSummary: 'Order Summary',
  payment: 'Payment',
  enterFullName: 'Enter your full name',
  whatsapp: 'WhatsApp',
  email: 'Email',
  dedicationLetter: 'Dedication Letter',
  writeSpecialMessage: 'Write a special message for the baby and family...',
  payNow: 'Pay Now',
  amountToPay: 'Amount to Pay',
  bankDetailsNotConfigured: 'Bank details not configured',
  from: 'From',
  message: 'Message',
  thankYou: 'Thank You',
  giftRecorded: 'Your gift has been recorded and items have been marked as fulfilled.',
  done: "You're Welcome",
};

const es: Translations = {
  registry: 'Registro',
  welcomeTo: 'Bienvenido a',
  giftRegistry: 'Registro de Regalos',
  hostedBy: 'Organizado por',
  wishes: 'Deseos',
  fulfilled: 'Cumplidos',
  available: 'Disponibles',
  allItems: 'Todos',
  showing: 'Mostrando',
  items: 'artículos',
  left: 'quedan',
  topPick: 'Favorito',
  addToList: 'Agregar',
  added: 'Agregado',
  inYourList: 'en tu lista',
  of: 'de',
  delivery: 'envío',
  noItems: 'No hay artículos disponibles',
  checkBackSoon: '¡Vuelve pronto para ver novedades!',
  cashGift: 'Regalo en Efectivo',
  sendAnyAmount: 'Envía cualquier cantidad directamente',
  otherAmount: 'Otra cantidad',
  send: 'Enviar',
  yourName: 'Tu Nombre',
  contact: 'Contacto',
  dedicationMessage: 'Mensaje de dedicatoria (opcional)',
  back: 'Atrás',
  continue_: 'Continuar',
  amount: 'Cantidad',
  bankTransfer: 'Transferencia Bancaria',
  payWithQr: 'Paga con Código QR',
  orBankTransfer: 'O envía por Transferencia Bancaria',
  copyAccountDetails: 'Copiar Datos Bancarios',
  copied: '¡Copiado!',
  choosePaymentMethod: 'Elige método de pago',
  payWithRevolut: 'Pagar con Revolut',
  iHaveSentPayment: 'Ya Envié el Pago',
  processing: 'Procesando...',
  yourGiftList: 'Tu Lista de Regalos',
  itemsSelected: 'artículos seleccionados',
  viewGiftList: 'Ver Lista de Regalos',
  checkout: 'Pagar',
  proceedToCheckout: 'Proceder al Pago',
  total: 'Total',
  remove: 'Eliminar',
  each: 'c/u',
  yourDetails: 'Tus Datos',
  orderSummary: 'Resumen del Pedido',
  payment: 'Pago',
  enterFullName: 'Ingresa tu nombre completo',
  whatsapp: 'WhatsApp',
  email: 'Email',
  dedicationLetter: 'Carta de Dedicatoria',
  writeSpecialMessage: 'Escribe un mensaje especial para el bebé y la familia...',
  payNow: 'Pagar Ahora',
  amountToPay: 'Monto a Pagar',
  bankDetailsNotConfigured: 'Datos bancarios no configurados',
  from: 'De',
  message: 'Mensaje',
  thankYou: 'Gracias',
  giftRecorded: 'Tu regalo ha sido registrado y los artículos han sido marcados como cumplidos.',
  done: 'De Nada',
};

const cz: Translations = {
  registry: 'Seznam',
  welcomeTo: 'Vítejte v',
  giftRegistry: 'Seznamu Dárků',
  hostedBy: 'Od',
  wishes: 'Přání',
  fulfilled: 'Splněno',
  available: 'Dostupné',
  allItems: 'Vše',
  showing: 'Zobrazeno',
  items: 'položek',
  left: 'zbývá',
  topPick: 'Tip',
  addToList: 'Přidat',
  added: 'Přidáno',
  inYourList: 've vašem seznamu',
  of: 'z',
  delivery: 'doručení',
  noItems: 'Žádné dostupné položky',
  checkBackSoon: 'Zkuste to znovu později!',
  cashGift: 'Peněžní Dar',
  sendAnyAmount: 'Pošlete jakoukoli částku přímo',
  otherAmount: 'Jiná částka',
  send: 'Odeslat',
  yourName: 'Vaše Jméno',
  contact: 'Kontakt',
  dedicationMessage: 'Věnování (volitelné)',
  back: 'Zpět',
  continue_: 'Pokračovat',
  amount: 'Částka',
  bankTransfer: 'Bankovní Převod',
  payWithQr: 'Zaplatit QR Kódem',
  orBankTransfer: 'Nebo pošlete Bankovním Převodem',
  copyAccountDetails: 'Kopírovat Údaje Účtu',
  copied: 'Zkopírováno!',
  choosePaymentMethod: 'Vyberte způsob platby',
  payWithRevolut: 'Zaplatit přes Revolut',
  iHaveSentPayment: 'Platbu Jsem Odeslal/a',
  processing: 'Zpracovávám...',
  yourGiftList: 'Váš Seznam Dárků',
  itemsSelected: 'vybraných položek',
  viewGiftList: 'Zobrazit Seznam',
  checkout: 'Zaplatit',
  proceedToCheckout: 'Přejít k Platbě',
  total: 'Celkem',
  remove: 'Odebrat',
  each: 'ks',
  yourDetails: 'Vaše Údaje',
  orderSummary: 'Souhrn Objednávky',
  payment: 'Platba',
  enterFullName: 'Zadejte celé jméno',
  whatsapp: 'WhatsApp',
  email: 'Email',
  dedicationLetter: 'Věnování',
  writeSpecialMessage: 'Napište zvláštní vzkaz pro miminko a rodinu...',
  payNow: 'Zaplatit',
  amountToPay: 'Částka k Úhradě',
  bankDetailsNotConfigured: 'Bankovní údaje nejsou nastaveny',
  from: 'Od',
  message: 'Zpráva',
  thankYou: 'Děkujeme',
  giftRecorded: 'Váš dárek byl zaznamenán a položky byly označeny jako splněné.',
  done: 'Není Zač',
};

const TRANSLATIONS: Record<Locale, Translations> = {
  'EUR-EN': en,
  'EUR-ES': es,
  'CZK-EN': en,
  'CZK-CZ': cz,
};

export function getTranslations(locale: Locale): Translations {
  return TRANSLATIONS[locale];
}

export function getCurrency(locale: Locale): string {
  return locale.startsWith('EUR') ? 'EUR' : 'CZK';
}

export const LOCALE_LABELS: Record<Locale, string> = {
  'EUR-EN': 'EUR - English',
  'EUR-ES': 'EUR - Español',
  'CZK-EN': 'CZK - English',
  'CZK-CZ': 'CZK - Česky',
};
