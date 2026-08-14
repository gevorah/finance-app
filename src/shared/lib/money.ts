export type Money = number;

export const MINOR_UNITS_PER_MAJOR = 100;

export function toMinorUnits(major: number): Money {
  return Math.round(major * MINOR_UNITS_PER_MAJOR);
}

export function toMajorUnits(minor: Money): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}

export function isMoney(value: unknown): value is Money {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
