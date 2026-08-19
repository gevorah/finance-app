'use client';

import {
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  Input,
  ValidationResult,
} from 'react-aria-components';

import { Description, FieldError, Label } from '../field';
import styles from './text-field.module.scss';

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      isInvalid={props.isInvalid ?? Boolean(errorMessage)}
      className={styles.root}
    >
      <Label>{label}</Label>
      <Input className={styles.input} placeholder={placeholder} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
