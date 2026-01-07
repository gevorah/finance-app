type CurrencyFormatOptions = {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  showSign?: boolean;
};

const DEFAULT_LOCALE = 'es-CO';
const DEFAULT_CURRENCY = 'COP';
const DEFAULT_FRACTION_DIGITS = 0;

export function formatCurrency(
  value: number,
  {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = DEFAULT_FRACTION_DIGITS,
    maximumFractionDigits,
    compact = false,
    showSign = false,
  }: CurrencyFormatOptions = {},
): string {
  if (!Number.isFinite(value)) return '—';

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
    signDisplay: showSign ? 'exceptZero' : 'auto',
  });

  return formatter.format(value);
}
