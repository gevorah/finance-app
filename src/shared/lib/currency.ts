import { Money, toMajorUnits } from './money';

interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  showSign?: boolean;
}

const DEFAULT_LOCALE = 'es-CO';
const DEFAULT_CURRENCY = 'COP';
const DEFAULT_FRACTION_DIGITS = 2;

export function formatCurrency(
  value: Money,
  {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = DEFAULT_FRACTION_DIGITS,
    maximumFractionDigits = DEFAULT_FRACTION_DIGITS,
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

  return formatter.format(toMajorUnits(value));
}
