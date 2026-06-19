'use client';

import { CategoryType } from '@/entities/category';
import { getCategoryIcon } from '@/features/transactions/utils/getCategoryIcon';
import clsx from 'clsx';
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Button,
  DialogTriggerProps,
  Heading,
  HeadingProps,
  Modal,
  ModalOverlay,
  ModalOverlayProps,
  type DialogProps as AriaDialogProps,
} from 'react-aria-components';

import styles from './dialog.module.scss';

export function DialogTrigger(props: DialogTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

export function DialogOverlay({
  className,
  isDismissable = true,
  ...props
}: ModalOverlayProps) {
  return (
    <ModalOverlay
      isDismissable={isDismissable}
      className={clsx(styles.overlay, className)}
      {...props}
    />
  );
}

interface DialogContentProps extends Omit<
  React.ComponentProps<typeof Modal>,
  'children'
> {
  children?: AriaDialogProps['children'];
}

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <Modal className={clsx(styles.modal, className)} {...props}>
      <AriaDialog className={clsx(styles.dialog, className)}>
        {children}
      </AriaDialog>
    </Modal>
  );
}

export function DialogTitle(props: HeadingProps) {
  return <Heading slot="title" className={styles.title} {...props} />;
}

interface DialogProps {
  category: CategoryType;
  trigger: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function Dialog({
  category,
  trigger,
  title,
  description,
  children,
}: DialogProps) {
  return (
    <DialogTrigger>
      {trigger}
      <DialogOverlay>
        <DialogContent>
          <div className={styles.header}>
            <div className="transaction-icon">
              {getCategoryIcon(category, 24)}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            {children}
          </div>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  );
}
