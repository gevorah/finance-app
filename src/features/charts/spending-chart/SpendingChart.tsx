import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/currency';
import { Money } from '@/shared/lib/money';

import './SpendingChart.scss';

import { Legend, Pie, PieChart, Sector, Tooltip } from 'recharts';

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
  const data = Object.entries(spendingByAccount)
    .sort(([, a], [, b]) => b - a)
    .map(([accountId, amount], index) => ({
      category: accountNames[accountId] ?? accountId,
      amount,
      fill: COLORS[index % COLORS.length],
    }));

  return (
    <Card className="chart-container">
      <CardChart title="Spending breakdown" date={today}>
        <PieChart
          accessibilityLayer
          responsive
          style={{ width: '100%', height: '100%' }}
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
            shape={(props) => (
              <Sector
                {...props}
                outerRadius={
                  props.isActive ? props.outerRadius + 4 : props.outerRadius
                }
              />
            )}
          ></Pie>
          <Tooltip
            contentStyle={{
              background: '#252731',
              border: '1px solid #32343f',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#9295a0' }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend
            position="right"
            itemSorter={null}
            content={({ payload }) => (
              <ul className="spending-legend">
                {payload?.map((entry) => {
                  const slice = entry.payload as (typeof data)[number];
                  return (
                    <li key={entry.value} className="spending-legend__item">
                      <span
                        className="spending-legend__dot"
                        style={{ background: entry.color }}
                      />
                      <span className="spending-legend__label">
                        {entry.value}
                      </span>
                      <span className="spending-legend__value">
                        {formatCurrency(slice.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          />
        </PieChart>
      </CardChart>
    </Card>
  );
}
