import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

import './WeeklySpendingChart.scss';

import { Area, AreaChart, Tooltip, XAxis } from 'recharts';

import CardChart from '../card-chart/CardChart';

interface WeeklySpendingChartProps {
  data: { day: number; shortDayName: string; dayTransactions: Money }[];
}

export function WeeklySpendingChart({ data }: WeeklySpendingChartProps) {
  return (
    <Card className="chart-container">
      <CardChart title="Weekly Spending" date="Last 7 days">
        <AreaChart
          style={{ width: '100%', height: '100%' }}
          responsive
          data={data}
          margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="weeklySpendingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8387f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8387f6" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="shortDayName"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9295a0', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <Tooltip
            cursor={{ stroke: '#32343f' }}
            contentStyle={{
              background: '#252731',
              border: '1px solid #32343f',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#9295a0' }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Area
            type="monotone"
            dataKey="dayTransactions"
            name="Spent"
            stroke="#8387f6"
            strokeWidth={2.5}
            fill="url(#weeklySpendingFill)"
            dot={{ r: 3, fill: '#8387f6', fillOpacity: 1 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </CardChart>
    </Card>
  );
}
