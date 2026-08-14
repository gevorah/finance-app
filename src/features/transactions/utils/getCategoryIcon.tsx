import { CATEGORY_TYPES, CategoryType } from '@/entities/category';
import {
  ArrowLeftRight,
  Banknote,
  Car,
  Coffee,
  Heart,
  HelpCircle,
  Home,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

const CATEGORY_ICONS: Record<CategoryType, LucideIcon> = {
  [CATEGORY_TYPES.SALARY]: Wallet,
  [CATEGORY_TYPES.OTHER_INCOME]: Banknote,
  [CATEGORY_TYPES.FOOD]: Coffee,
  [CATEGORY_TYPES.BILLS]: Home,
  [CATEGORY_TYPES.SHOPPING]: ShoppingCart,
  [CATEGORY_TYPES.HEALTH]: Heart,
  [CATEGORY_TYPES.TRANSPORT]: Car,
  [CATEGORY_TYPES.OTHERS]: HelpCircle,
};

/** Transfers have no category, so they get the transfer icon instead. */
export function getCategoryIcon(
  category: CategoryType | undefined,
  size: number = 20,
): React.ReactNode {
  const IconComponent = category ? CATEGORY_ICONS[category] : ArrowLeftRight;
  return <IconComponent size={size} />;
}
