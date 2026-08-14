'use client';

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  Button,
  Input,
  ListBoxItemProps,
  ValidationResult,
} from 'react-aria-components';

import { Description, FieldError, Label } from '../field';
import { ListBox, ListBoxItem } from '../list-box';
import { Popover } from '../popover';
import styles from './combo-box.module.scss';

export interface ComboBoxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  placeholder,
  children,
  items,
  className,
  ...props
}: ComboBoxProps<T>) {
  return (
    <AriaComboBox className={clsx(styles.root, className)} {...props}>
      {label && <Label>{label}</Label>}
      <div className={styles.field}>
        <Input className={styles.input} placeholder={placeholder} />
        <Button className={styles.trigger}>
          <ChevronDown aria-hidden="true" />
        </Button>
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className={styles.popover}>
        <ListBox items={items}>{children}</ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />;
}
