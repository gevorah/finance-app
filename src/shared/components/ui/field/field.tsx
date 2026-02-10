import {
  FieldError as AriaFieldError,
  Label as AriaLabel,
  FieldErrorProps,
  LabelProps,
  Text,
  TextProps,
} from 'react-aria-components';

import styles from './field.module.scss';

export function Label(props: LabelProps) {
  return <AriaLabel className={styles.label} {...props} />;
}

export function Description(props: TextProps) {
  return <Text slot="description" className={styles.description} {...props} />;
}

export function FieldError(props: FieldErrorProps) {
  return <AriaFieldError className={styles.error} {...props} />;
}
