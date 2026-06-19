import Link from 'next/link';
import { ReactNode } from 'react';

import styles from './fab.module.scss';

interface FabProps {
  href: string;
  label: string;
  icon: ReactNode;
}

export function Fab({ href, label, icon }: FabProps) {
  return (
    <Link href={href} className={styles.root} aria-label={label}>
      {icon}
    </Link>
  );
}
