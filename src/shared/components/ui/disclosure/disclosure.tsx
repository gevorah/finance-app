'use client';

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  Button,
  DisclosurePanelProps,
  DisclosureProps,
  Heading,
  HeadingProps,
} from 'react-aria-components';

import styles from './disclosure.module.scss';

export function Disclosure({ className, ...props }: DisclosureProps) {
  return <AriaDisclosure className={clsx(styles.root, className)} {...props} />;
}

export function DisclosureHeader({
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Heading className={styles.heading} {...props}>
      <Button slot="trigger" className={clsx(styles.trigger, className)}>
        <span className={styles.label}>{children}</span>
        <ChevronDown aria-hidden="true" className={styles.chevron} />
      </Button>
    </Heading>
  );
}

export function DisclosurePanel({ className, ...props }: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel className={clsx(styles.panel, className)} {...props} />
  );
}
