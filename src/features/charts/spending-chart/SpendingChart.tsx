
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

import "./SpendingChart.scss";

import { Legend, Pie, PieChart } from 'recharts';

import CardChart from '../card-chart/CardChart';

const COLORS = [
  '#f06bb8',
  '#b8bac2',
  '#7b76f0',
  '#5fa6f2',
  '#9966ff',
  '#ff9f40',
  '#c9cbcf',
];

interface SpendingChartProps {
  data: Record<string, Money>;
  accountNames: Record<string, string>;
}

export function SpendingChart({
  data: spendingByAccount,
  accountNames,
}: SpendingChartProps) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long' });
  const data = Object.entries(spendingByAccount).map(
    ([accountId, amount], index) => ({
      category: accountNames[accountId] ?? accountId,
      amount,
      fill: COLORS[index % COLORS.length],
    }),
  );

  return (
    <Card className="chart-container">
      <CardChart title="Budget Breakdown" date={today}>
        <PieChart
          accessibilityLayer
          responsive
          style={{
            width: '100%',
            maxWidth: '300px',
            maxHeight: '80vh',
            aspectRatio: 1,
          }}
        >
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            dataKey="amount"
            nameKey="category"
            stroke="none"
          ></Pie>
          <Legend
            align="right"
            layout="vertical"
            verticalAlign="middle"
            content={({ payload }) => (
              <ul>
                {payload?.map((entry, index) => (
                  <li key={index} style={{ color: entry.color }}>
                    <span>{entry.value}</span>
                    <span>{formatCurrency(data[index].amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          />
        </PieChart>
      </CardChart>
    </Card>
  );
}
