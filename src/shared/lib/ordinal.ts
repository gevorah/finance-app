const SUFFIXES: Record<Intl.LDMLPluralRule, string> = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
  zero: 'th',
  many: 'th',
};

const rules = new Intl.PluralRules('en-US', { type: 'ordinal' });

export function ordinal(day: number): string {
  return `${day}${SUFFIXES[rules.select(day)]}`;
}
