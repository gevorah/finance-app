'use client';

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
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
  return (
    <AriaDatePicker {...props} className={styles.root}>
      <Label>{label}</Label>
      <Group className={styles.group}>
        <DateInput className={styles.input}>
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
