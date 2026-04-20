import {
  Coffee,
  Home,
  Wallet,
  Car,
  ShoppingCart,
  Heart,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';
import { CATEGORY_TYPES } from '../types';

const CATEGORY_ICONS: Record<CATEGORY_TYPES, LucideIcon>={
    [CATEGORY_TYPES.Food]: Coffee,
    [CATEGORY_TYPES.Bills]: Home,
    [CATEGORY_TYPES.Income]: Wallet,
    [CATEGORY_TYPES.Shopping]: ShoppingCart,
    [CATEGORY_TYPES.Health]: Heart,
    [CATEGORY_TYPES.Transport]: Car,
    [CATEGORY_TYPES.Others]: HelpCircle
}

export function getCategoryIcon(category:CATEGORY_TYPES, size: number= 20): React.ReactNode{
    const IconComponent = CATEGORY_ICONS[category];
    return <IconComponent size={size}/>;
}