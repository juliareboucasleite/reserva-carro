export function formatBookingDate(date: Date, lang: 'pt' | 'en') {
  const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatBookingDateShort(date: Date, lang: 'pt' | 'en') {
  const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export function formatMoney(value: number, lang: 'pt' | 'en') {
  const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
  return `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function formatSearchPeriod(
  pickupDate: Date,
  returnDate: Date,
  pickupTime: string,
  returnTime: string,
  lang: 'pt' | 'en',
) {
  return `${formatBookingDateShort(pickupDate, lang)}, ${pickupTime} - ${formatBookingDateShort(returnDate, lang)}, ${returnTime}`;
}
