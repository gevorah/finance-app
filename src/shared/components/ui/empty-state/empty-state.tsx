import { ReactNode } from 'react';

import styles from './empty-state.module.scss';

interface EmptyStateProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  icon,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.root}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
