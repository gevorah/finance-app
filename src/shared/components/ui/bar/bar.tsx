import './bar.scss';

interface BarProps {
  percentage: number;
}

export default function Bar({ percentage }: BarProps) {
  return (
    <div className="bar-container">
      <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}
