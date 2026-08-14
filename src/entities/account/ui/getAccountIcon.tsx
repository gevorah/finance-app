import {
  ArrowLeftRight,
  Banknote,
  Car,
  Coffee,
  CreditCard,
  Heart,
  HelpCircle,
  Home,
  Landmark,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { ACCOUNT_KINDS, ACCOUNT_ROOTS, Account } from '../model/types';

const ACCOUNT_ICONS: Record<string, LucideIcon> = {
  'assets-cash': Wallet,
  'income-salary': Wallet,
  'income-other': Banknote,
  'expenses-food': Coffee,
  'expenses-bills': Home,
  'expenses-shopping': ShoppingCart,
  'expenses-health': Heart,
  'expenses-transport': Car,
  'expenses-interest': Receipt,
  'expenses-others': HelpCircle,
};

const KIND_ICONS: Record<string, LucideIcon> = {
  [ACCOUNT_KINDS.CASH]: Wallet,
  [ACCOUNT_KINDS.CHECKING]: Landmark,
  [ACCOUNT_KINDS.SAVINGS]: PiggyBank,
  [ACCOUNT_KINDS.CREDIT_CARD]: CreditCard,
};

const ROOT_ICONS: Record<string, LucideIcon> = {
  [ACCOUNT_ROOTS.ASSETS]: Wallet,
  [ACCOUNT_ROOTS.LIABILITIES]: CreditCard,
  [ACCOUNT_ROOTS.EQUITY]: Landmark,
  [ACCOUNT_ROOTS.INCOME]: Banknote,
  [ACCOUNT_ROOTS.EXPENSES]: HelpCircle,
};

export function getAccountIcon(
  account: Account | undefined,
  size: number = 20,
): React.ReactNode {
  if (!account) return <ArrowLeftRight size={size} />;

  const IconComponent =
    ACCOUNT_ICONS[account.id] ??
    (account.kind && KIND_ICONS[account.kind]) ??
    ROOT_ICONS[account.root] ??
    HelpCircle;

  return <IconComponent size={size} />;
}
