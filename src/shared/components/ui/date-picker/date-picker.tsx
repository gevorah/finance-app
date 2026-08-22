'use client';

import { Ref, useImperativeHandle, useRef } from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  Button,
  DateValue,
  Group,
  ValidationResult,
} from 'react-aria-components';

import { Calendar } from '../calendar';
import { DateInput, DateSegment } from '../date-field';
import { Description, FieldError, Label } from '../field';
import { Popover } from '../popover';
import styles from './date-picker.module.scss';

export interface DatePickerProps<
  T extends DateValue,
> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  inputRef?: Ref<{ focus: () => void }>;
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  inputRef,
  ...props
}: DatePickerProps<T>) {
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
    <AriaDatePicker
      {...props}
      isInvalid={props.isInvalid ?? Boolean(errorMessage)}
      className={styles.root}
    >
      <Label>{label}</Label>
      <Group className={styles.group}>
        <DateInput ref={segments} className={styles.input}>
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <Button>
          <CalendarIcon />
        </Button>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}
