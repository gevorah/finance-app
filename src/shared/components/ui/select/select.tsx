'use client';

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Button,
  ListBoxItemProps,
  SelectValue,
  ValidationResult,
} from 'react-aria-components';

import { Description, FieldError, Label } from '../field';
import { ListBox, ListBoxItem } from '../list-box';
import { Popover } from '../popover';
import styles from './select.module.scss';

export interface SelectProps<
  T extends object,
  M extends 'single' | 'multiple',
> extends Omit<AriaSelectProps<T, M>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<
  T extends object,
  M extends 'single' | 'multiple' = 'single',
>({
  label,
  description,
  errorMessage,
  children,
  items,
  className,
  ...props
}: SelectProps<T, M>) {
  return (
    <AriaSelect
      className={clsx(styles.root, className)}
      {...props}
      isInvalid={props.isInvalid ?? Boolean(errorMessage)}
    >
      {label && <Label>{label}</Label>}
      <Button className={styles.trigger}>
        <SelectValue className={styles.value} />
        <ChevronDown aria-hidden="true" />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className={styles.popover}>
        <ListBox items={items}>{children}</ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />;
}
