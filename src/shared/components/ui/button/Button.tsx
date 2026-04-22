import clsx from 'clsx';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';

import styles from './Button.module.scss';

interface ButtonProps extends AriaButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  border?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  border = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      data-variant={variant}
      data-size={size}
      data-border={border}
      className={clsx(styles.button, className)}
      {...props}
    >
      {children}
    </AriaButton>
  );
}
