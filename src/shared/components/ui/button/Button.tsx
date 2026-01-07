import './button.scss';

interface ButtonProps {
  children: React.ReactNode;
  type: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'medium' | 'large';
  border?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  type,
  size,
  border = false,
  onClick,
  active,
  disabled,
}: ButtonProps) {
  const btnStyle = `btn btn-${type} btn-${size} ${border ? 'btn-bordered' : ''} ${active ? 'btn-active' : ''}`;
  return (
    <button className={btnStyle} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
