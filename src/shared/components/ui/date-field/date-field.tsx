'use client';

import { Ref, RefAttributes, useImperativeHandle, useRef } from 'react';
import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  DateInputProps,
  DateSegmentProps,
  DateValue,
  ValidationResult,
} from 'react-aria-components';

import { Description, FieldError, Label } from '../field';
import styles from './date-field.module.scss';

export function DateSegment(props: DateSegmentProps) {
  return <AriaDateSegment className={styles.segment} {...props} />;
}

export function DateInput(
  props: DateInputProps & RefAttributes<HTMLDivElement>,
) {
  return <AriaDateInput className={styles.input} {...props} />;
}

export interface DateFieldProps<
  T extends DateValue,
> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  inputRef?: Ref<{ focus: () => void }>;
}

export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  inputRef,
  ...props
}: DateFieldProps<T>) {
  const segments = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    inputRef,
    () => ({
      focus: () =>
        segments.current
          ?.querySelector<HTMLElement>('[role="spinbutton"]')
          ?.focus(),
    }),
    [],
  );

  return (
    <AriaDateField
      {...props}
      isInvalid={props.isInvalid ?? Boolean(errorMessage)}
      className={styles.root}
    >
      <Label>{label}</Label>
      <DateInput ref={segments}>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}
