import { CATEGORY_TYPES, CategoryType } from '../model/types';
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

export function getCategoryIcon(
  category: CategoryType | undefined,
  size: number = 20,
): React.ReactNode {
  const IconComponent = category ? CATEGORY_ICONS[category] : ArrowLeftRight;
  return <IconComponent size={size} />;
}
