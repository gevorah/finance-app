import clsx from 'clsx';
import { Popover as AriaPopover, PopoverProps } from 'react-aria-components';

import styles from './popover.module.scss';

export function Popover({ className, offset = 4, ...props }: PopoverProps) {
  return (
    <AriaPopover
      offset={offset}
      className={clsx(styles.root, className)}
      {...props}
    />
  );
}
