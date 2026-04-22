import { CATEGORY_TYPES, CategoryType } from '@/entities/category';
import {
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
  [CATEGORY_TYPES.FOOD]: Coffee,
  [CATEGORY_TYPES.BILLS]: Home,
  [CATEGORY_TYPES.INCOME]: Wallet,
  [CATEGORY_TYPES.SHOPPING]: ShoppingCart,
  [CATEGORY_TYPES.HEALTH]: Heart,
  [CATEGORY_TYPES.TRANSPORT]: Car,
  [CATEGORY_TYPES.OTHERS]: HelpCircle,
};

export function getCategoryIcon(
  category: CategoryType,
  size: number = 20,
): React.ReactNode {
  const IconComponent = CATEGORY_ICONS[category];
  return <IconComponent size={size} />;
}
