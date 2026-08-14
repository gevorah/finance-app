export type CategoryKind = 'income' | 'expense';

export const CATEGORY_TYPES = {
  SALARY: 'salary',
  OTHER_INCOME: 'other_income',
  FOOD: 'food',
  BILLS: 'bills',
  SHOPPING: 'shopping',
  HEALTH: 'health',
  TRANSPORT: 'transport',
  OTHERS: 'others',
} as const;

export type CategoryType = (typeof CATEGORY_TYPES)[keyof typeof CATEGORY_TYPES];

export interface Category {
  id: CategoryType;
  label: string;
  kind: CategoryKind;
}

export const CATEGORIES: readonly Category[] = [
  { id: CATEGORY_TYPES.SALARY, label: 'Salary', kind: 'income' },
  { id: CATEGORY_TYPES.OTHER_INCOME, label: 'Other income', kind: 'income' },
  { id: CATEGORY_TYPES.FOOD, label: 'Food & Drinks', kind: 'expense' },
  { id: CATEGORY_TYPES.BILLS, label: 'Bills', kind: 'expense' },
  { id: CATEGORY_TYPES.SHOPPING, label: 'Shopping', kind: 'expense' },
  { id: CATEGORY_TYPES.HEALTH, label: 'Health', kind: 'expense' },
  { id: CATEGORY_TYPES.TRANSPORT, label: 'Transport', kind: 'expense' },
  { id: CATEGORY_TYPES.OTHERS, label: 'Others', kind: 'expense' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (category) => category.kind === 'expense',
);

export const INCOME_CATEGORIES = CATEGORIES.filter(
  (category) => category.kind === 'income',
);

export function getCategoriesByKind(kind: CategoryKind): Category[] {
  return kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryLabel(id: CategoryType): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function getCategoryKind(id: CategoryType): CategoryKind {
  return CATEGORIES.find((category) => category.id === id)?.kind ?? 'expense';
}
