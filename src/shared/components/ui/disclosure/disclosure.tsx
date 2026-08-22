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
} from 'react-aria-components';

import styles from './disclosure.module.scss';

interface DisclosureSectionProps extends Omit<DisclosureProps, 'children'> {
  title: string;
  description?: string;
  /** Match the surrounding outline so headings stay in order. */
  headingLevel?: number;
  children: React.ReactNode;
}

export function Disclosure({
  title,
  description,
  headingLevel = 3,
  children,
  className,
  ...props
}: DisclosureSectionProps) {
  return (
    <AriaDisclosure className={clsx(styles.root, className)} {...props}>
      <Heading level={headingLevel} className={styles.heading}>
        <Button slot="trigger" className={styles.trigger}>
          <span className={styles.label}>
            {title}
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </span>
          <ChevronDown aria-hidden="true" className={styles.chevron} />
        </Button>
      </Heading>
      <DisclosurePanel>{children}</DisclosurePanel>
    </AriaDisclosure>
  );
}

export function DisclosurePanel({ className, ...props }: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel className={clsx(styles.panel, className)} {...props} />
  );
}
