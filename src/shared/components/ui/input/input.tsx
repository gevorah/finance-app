'use client';

import { ComponentPropsWithoutRef, forwardRef, useId } from 'react';

import styles from './input.module.scss';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const {
      id: propId,
      label,
      name,
      error,
      hint,
      disabled,
      readOnly,
      required,
      className,
      ...inputProps
    } = props;

    const generatedId = useId();
    const id = propId || generatedId;

    const stylesRoot = [styles.root, className].filter(Boolean).join(' ');

    return (
      <div
        className={stylesRoot}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        data-error={error ? '' : undefined}
      >
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.field}>
          <input
            ref={ref}
            id={id}
            name={name}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={styles.input}
            {...inputProps}
          />
        </div>
        {hint && !error && <p className={styles.hint}>{hint}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  },
);
