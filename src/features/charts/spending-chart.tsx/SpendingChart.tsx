import { Card } from '@/shared/components/ui/card';
import { getSpendingByCategory } from '@/stores/selectors';

import "./SpendingChart.scss";

import { useTransactionStore } from '@/stores/transactionStore';
import { Legend, Pie, PieChart } from 'recharts';

import CardChart from '../card-chart/CardChart';

export function SpendingChart() {
  const COLORS = [
    '#f06bb8',
    '#b8bac2',
    '#7b76f0',
    '#5fa6f2',
    '#9966ff',
    '#ff9f40',
    '#c9cbcf',
  ];
  const { transactions } = useTransactionStore();
  const spendingByCategory = getSpendingByCategory(transactions);
  const today = new Date().toLocaleDateString('en-US', { month: 'long' });
  const data = Object.entries(spendingByCategory).map(
    ([category, amount], index) => ({
      category,
      amount,
      fill: COLORS[index],
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
                    <span>${data[index].amount}</span>
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
