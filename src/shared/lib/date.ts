const DEFAULT_LOCALE = 'es-CO';

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
