import { CATEGORY_TYPES, CategoryType } from './types';

const LEGACY_CATEGORY_IDS: Record<string, CategoryType> = {
  income: CATEGORY_TYPES.SALARY,
  food: CATEGORY_TYPES.FOOD,
  bills: CATEGORY_TYPES.BILLS,
  shopping: CATEGORY_TYPES.SHOPPING,
  health: CATEGORY_TYPES.HEALTH,
  transport: CATEGORY_TYPES.TRANSPORT,
  others: CATEGORY_TYPES.OTHERS,
};

export function migrateLegacyCategory(legacy: unknown): CategoryType {
  return LEGACY_CATEGORY_IDS[String(legacy)] ?? CATEGORY_TYPES.OTHERS;
}
