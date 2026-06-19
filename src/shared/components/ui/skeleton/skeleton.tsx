import clsx from 'clsx';
import { ComponentProps } from 'react';

import styles from './skeleton.module.scss';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={clsx(styles.root, className)}
      {...props}
    />
  );
}
