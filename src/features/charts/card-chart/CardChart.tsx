import './CardChart.scss';

interface CardChartProps {
  children?: React.ReactNode;
  title?: string;
  date?: string;
}

export default function CardChart({ children, title, date }: CardChartProps) {
  return (
    <div>
      <div className="chart-header">
        <h3 className="chart-header__title">{title}</h3>
        <span className="chart-header__date">{date}</span>
      </div>
      {children}
    </div>
  );
}
