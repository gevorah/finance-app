import { Money, toMinorUnits } from './money';

export type PersistedRecord = Record<string, unknown>;

export function readPersistedList(
  persisted: unknown,
  key: string,
): PersistedRecord[] {
  const list = (persisted as PersistedRecord | undefined)?.[key];
  return Array.isArray(list) ? (list as PersistedRecord[]) : [];
}

export function readPersistedMoney(value: unknown): Money {
  return toMinorUnits(Number(value) || 0);
}
