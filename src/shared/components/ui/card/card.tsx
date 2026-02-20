import './card.scss';

import { ReactNode } from 'react';
import { VariantType } from '@/features/transactions';

interface CardProps {
  children: ReactNode;
  className?: string;
  type?: VariantType;
}

export function Card({ children, className, type = 'secondary' }: CardProps) {
  return (
    <section className={`card card--${type} ${className}`}>{children}</section>
  );
}
