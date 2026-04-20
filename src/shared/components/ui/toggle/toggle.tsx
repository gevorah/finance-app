"use client"

import clsx from 'clsx';
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from "react-aria-components"

import styles from "./toggle.module.scss";

const Toggle = ({ className, ...props }: AriaToggleButtonProps) => (
  <AriaToggleButton
    className={clsx(styles.toggle, className)}
    {...props}
  />
)

const ToggleButtonGroup = ({
  children,
  className,
  ...props
}: AriaToggleButtonGroupProps) => (
  <AriaToggleButtonGroup
    className={clsx(styles.group, className)}
    {...props}
  >
    {children}
  </AriaToggleButtonGroup>
)

export { Toggle, ToggleButtonGroup }
