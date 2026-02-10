'use client';

import { getLocalTimeZone, today } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  CalendarProps as AriaCalendarProps,
  Button,
  CalendarCellProps,
  CalendarGridProps,
  DateValue,
  Heading,
  Text,
} from 'react-aria-components';

import styles from './calendar.module.scss';

export function CalendarGrid(props: CalendarGridProps) {
  return <AriaCalendarGrid {...props} className={styles.grid} />;
}

export function CalendarCell(props: CalendarCellProps) {
  const isToday = props.date.compare(today(getLocalTimeZone())) === 0;

  return (
    <AriaCalendarCell
      {...props}
      className={styles.cell}
      data-today={isToday || undefined}
    />
  );
}

export interface CalendarProps<
  T extends DateValue,
> extends AriaCalendarProps<T> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>({
  errorMessage,
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={styles.root}>
      <header className={styles.header}>
        <Button slot="previous" className={styles.button}>
          <ChevronLeft />
        </Button>
        <Heading className={styles.heading} />
        <Button slot="next" className={styles.button}>
          <ChevronRight />
        </Button>
      </header>
      <CalendarGrid className={styles.grid}>
        {(date) => <CalendarCell date={date} />}
      </CalendarGrid>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaCalendar>
  );
}
