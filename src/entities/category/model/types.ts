export const CATEGORY_TYPES = {
  FOOD: 'food',
  BILLS: 'bills',
  INCOME: 'income',
  SHOPPING: 'shopping',
  HEALTH: 'health',
  TRANSPORT: 'transport',
  OTHERS: 'others',
} as const;

export type CategoryType = (typeof CATEGORY_TYPES)[keyof typeof CATEGORY_TYPES];

export const CATEGORY_OPTIONS = [
  { id: CATEGORY_TYPES.FOOD, label: 'Food & Drinks' },
  { id: CATEGORY_TYPES.BILLS, label: 'Bills' },
  { id: CATEGORY_TYPES.INCOME, label: 'Income' },
  { id: CATEGORY_TYPES.SHOPPING, label: 'Shopping' },
  { id: CATEGORY_TYPES.HEALTH, label: 'Health' },
  { id: CATEGORY_TYPES.TRANSPORT, label: 'Transport' },
  { id: CATEGORY_TYPES.OTHERS, label: 'Others' },
] as const;
