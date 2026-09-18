/**
 * Dates carry month names, so they follow the interface language. Amounts are
 * numerals and keep the currency's own conventions, which is why currency.ts
 * formats with a different locale.
 */
const DEFAULT_LOCALE = 'en-GB';

const SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
};

const LONG_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
};

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, SHORT_OPTIONS).format(
    new Date(date),
  );
}

export function formatDateLong(date: string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, LONG_OPTIONS).format(
    new Date(date),
  );
}

const MONTH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  year: 'numeric',
};

export function formatMonthsAhead(from: Date, months: number): string {
  const day = 1;
  const month = new Date(from.getFullYear(), from.getMonth() + months, day);

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, MONTH_YEAR_OPTIONS).format(
    month,
  );
}

export function daysLeftInMonth(date: Date): number {
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  return lastDay - date.getDate();
}
