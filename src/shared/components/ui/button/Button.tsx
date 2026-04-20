import React from 'react';
import './Button.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'medium' | 'large';
  border?: boolean;
  active?: boolean;
}

export function Button({
  children,
  variant,
  size,
  border = false,
  active,
  className,
  ...rest
}: ButtonProps) {
  const btnStyle = `btn btn-${variant} btn-${size} ${border ? 'btn-bordered' : ''} ${active ? 'btn-active' : ''} ${className ?? ''}`;
  return (
    <button className={btnStyle} {...rest}>
      {children}
    </button>
  );
}
