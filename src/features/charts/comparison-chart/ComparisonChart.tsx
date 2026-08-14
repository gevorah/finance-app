import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

import './ComparisonChart.scss';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CardChart from '../card-chart/CardChart';

interface ComparisonChartProps {
  data: { monthText: string; income: Money; expenses: Money }[];
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <Card className="chart-container">
        <CardChart title="Income vs Expenses" date="6 months">
      <BarChart
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '70vh',
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthText" />
        <YAxis
          width="auto"
          tickFormatter={(value: Money) =>
            formatCurrency(value, { compact: true, minimumFractionDigits: 0 })
          }
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
        <Bar
          dataKey="income"
          fill="#5fa6f2"
          activeBar={{ fill: 'pink', stroke: 'blue' }}
          radius={[10, 10, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          fill="#f06bb8"
          activeBar={{ fill: 'gold', stroke: 'purple' }}
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
      </CardChart>
    </Card>
  );
}
