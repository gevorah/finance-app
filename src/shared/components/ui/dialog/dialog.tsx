'use client';

import clsx from 'clsx';
import {
  DialogTrigger as AriaDialogTrigger,
  Dialog,
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
      <Dialog className={clsx(styles.dialog, className)}>{children}</Dialog>
    </Modal>
  );
}

export function DialogTitle(props: HeadingProps) {
  return <Heading slot="title" className={styles.title} {...props} />;
}
