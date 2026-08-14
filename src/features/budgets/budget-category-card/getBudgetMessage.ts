import { CategoryType, CATEGORY_TYPES } from '@/entities/category';
import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

interface BudgetMessage {
  text: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

type RangeKey = 'over' | 'high' | 'mid' | 'low';

const categoryMessages: Partial<Record<CategoryType, Record<RangeKey, string>>> = {
  [CATEGORY_TYPES.FOOD]: {
    over: 'Over budget — try cooking more at home',
    high: 'Getting close — plan your meals this week',
    mid: 'On track, keep it up',
    low: 'Well controlled — great eating habits',
  },
  [CATEGORY_TYPES.TRANSPORT]: {
    over: 'Over budget — consider alternatives this week',
    high: 'Almost at the limit — reduce trips if possible',
    mid: 'Well controlled',
    low: 'Great — very efficient spending',
  },
  [CATEGORY_TYPES.SHOPPING]: {
    over: 'Over budget — consider pausing purchases',
    high: 'Close to the limit — only essentials from here',
    mid: 'On track — be mindful of impulse buys',
    low: 'Well controlled — nice discipline',
  },
  [CATEGORY_TYPES.BILLS]: {
    over: 'Over budget — review recurring services',
    high: 'Normal — some bills still pending this month',
    mid: 'On track — bills are under control',
    low: 'Well below limit — all good',
  },
  [CATEGORY_TYPES.HEALTH]: {
    over: 'Over budget — check if all expenses were necessary',
    high: 'Getting close — prioritize essential appointments',
    mid: 'On track — health spending is balanced',
    low: 'Well controlled — healthy and efficient',
  },
  [CATEGORY_TYPES.OTHERS]: {
    over: 'Over budget — review miscellaneous expenses',
    high: 'Getting close to the limit',
    mid: 'On track with other expenses',
    low: 'Well controlled',
  },
};

function getRange(percentage: number): RangeKey {
  if (percentage > 100) return 'over';
  if (percentage >= 80) return 'high';
  if (percentage >= 50) return 'mid';
  return 'low';
}

function getTone(percentage: number): BudgetMessage['tone'] {
  if (percentage > 100) return 'danger';
  if (percentage >= 80) return 'warning';
  if (percentage >= 50) return 'info';
  return 'success';
}

const fallbackMessages = categoryMessages[CATEGORY_TYPES.OTHERS]!;

export function getBudgetMessage(
  category: CategoryType,
  percentage: number,
  remaining: Money,
): BudgetMessage {
  const range = getRange(percentage);
  const tone = getTone(percentage);

  let text = categoryMessages[category]?.[range] ?? fallbackMessages[range];

  if (range === 'over') {
    const overAmount = formatCurrency(Math.abs(remaining));
    text = `${overAmount} over budget — ${text.split('—')[1]?.trim() ?? 'review your spending'}`;
  } else if (range === 'high' || range === 'mid') {
    text = `${formatCurrency(remaining)} left — ${text.toLowerCase()}`;
  }

  return { text, tone };
}
