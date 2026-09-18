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
          style={{ width: '100%', height: '100%' }}
          responsive
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          maxBarSize={24}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#32343f"
            vertical={false}
          />
          <XAxis
            dataKey="monthText"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9295a0', fontSize: 12 }}
          />
          <YAxis
            width="auto"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9295a0', fontSize: 12 }}
            tickFormatter={(value: Money) =>
              formatCurrency(value, { compact: true, minimumFractionDigits: 0 })
            }
          />
          <Tooltip
            cursor={{
              fill: 'rgba(50, 52, 63, 0.4)',
            }}
            contentStyle={{
              background: '#252731',
              border: '1px solid #32343f',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#9295a0' }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend iconType="circle" iconSize={12} />
          <Bar
            dataKey="income"
            name="Income"
            fill="#66b5f4"
            activeBar={{ fill: 'pink', stroke: 'blue' }}
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#f472c2"
            activeBar={{ fill: 'gold', stroke: 'purple' }}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </CardChart>
    </Card>
  );
}
