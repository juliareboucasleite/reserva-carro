export function formatBookingDate(date: Date, lang: 'pt' | 'en') {
  const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}
