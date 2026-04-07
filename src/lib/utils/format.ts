export function formatCurrency(
  amount: number,
  currency: string = "MAD",
  locale: string = "fr-MA",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  locale: string = "fr-MA",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatNumber(num: number, locale: string = "fr-MA"): string {
  return new Intl.NumberFormat(locale).format(num);
}
