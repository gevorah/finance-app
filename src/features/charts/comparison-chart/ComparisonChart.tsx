import { Card } from '@/shared/components/ui/card';
import { getmonthIncomeExpense } from '@/stores/selectors';

import './ComparisonChart.scss';

import { useTransactionStore } from '@/stores/transactionStore';
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

export function ComparisonChart() {
  const { transactions } = useTransactionStore();

  const incomevsExpenses = getmonthIncomeExpense(transactions, new Date(), 6);

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
        data={incomevsExpenses}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthText" />
        <YAxis width="auto" />
        <Tooltip />
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
