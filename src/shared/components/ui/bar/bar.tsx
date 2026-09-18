import './bar.scss';

type BarTone = 'primary' | 'danger';

interface BarProps {
  percentage: number;
  tone?: BarTone;
}

export default function Bar({ percentage, tone = 'primary' }: BarProps) {
  return (
    <div className="bar-container">
      <div
        className={`bar-fill bar-fill--${tone}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
