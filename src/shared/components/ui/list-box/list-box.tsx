'use client';

import clsx from 'clsx';
import {
  Collection as AriaCollection,
  Header as AriaHeader,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxItemProps as AriaListBoxItemProps,
  ListBoxProps as AriaListBoxProps,
  ListBoxSection as AriaListBoxSection,
  composeRenderProps,
  Text,
} from 'react-aria-components';

import styles from './list-box.module.scss';

const ListBoxSection = AriaListBoxSection;

const ListBoxCollection = AriaCollection;

function ListBox<T extends object>({
  className,
  ...props
}: AriaListBoxProps<T>) {
  return <AriaListBox className={clsx(styles.list, className)} {...props} />;
}

const ListBoxItem = <T extends object>({
  className,
  textValue,
  children,
  ...props
}: AriaListBoxItemProps<T>) => {
  return (
    <AriaListBoxItem
      {...props}
      textValue={
        textValue || (typeof children === 'string' ? children : undefined)
      }
      className={clsx(styles.item, className)}
    >
      {composeRenderProps(children, (children) =>
        typeof children === 'string' ? (
          <Text slot="label">{children}</Text>
        ) : (
          children
        ),
      )}
    </AriaListBoxItem>
  );
};

function ListBoxHeader({
  className,
  ...props
}: React.ComponentProps<typeof AriaHeader>) {
  return <AriaHeader className={clsx(styles.header, className)} {...props} />;
}

export {
  ListBox,
  ListBoxItem,
  ListBoxHeader,
  ListBoxSection,
  ListBoxCollection,
};
