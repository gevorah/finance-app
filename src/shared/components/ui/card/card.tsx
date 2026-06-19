import './card.scss';

import { ReactNode } from 'react';

type CardVariant = 'primary' | 'secondary' | 'tertiary';

interface CardProps {
  children: ReactNode;
  className?: string;
  type?: CardVariant;
}

export function Card({ children, className, type = 'secondary' }: CardProps) {
  return (
    <section className={`card card--${type} ${className}`}>{children}</section>
  );
}
