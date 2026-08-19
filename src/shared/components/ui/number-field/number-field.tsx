'use client';

import { Ref } from 'react';
import {
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  Input,
  ValidationResult,
} from 'react-aria-components';

import { Description, FieldError, Label } from '../field';
import styles from './number-field.module.scss';

export interface NumberFieldProps extends Omit<
  AriaNumberFieldProps,
  'value' | 'onChange'
> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  /** Undefined is an empty field; react-aria spells that NaN internally. */
  value?: number;
  onChange?: (value: number | undefined) => void;
  inputRef?: Ref<HTMLInputElement>;
}

export function NumberField({
  label,
  description,
  errorMessage,
  value,
  onChange,
  inputRef,
  ...props
}: NumberFieldProps) {
  return (
    <AriaNumberField
      {...props}
      value={value ?? NaN}
      onChange={(next) => onChange?.(Number.isNaN(next) ? undefined : next)}
      isInvalid={props.isInvalid ?? Boolean(errorMessage)}
      className={styles.root}
    >
      <Label>{label}</Label>
      <Input ref={inputRef} className={styles.input} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
