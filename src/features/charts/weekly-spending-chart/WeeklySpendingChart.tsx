import { Card } from '@/shared/components/ui/card';
import { getWeeklySpending } from '@/stores/selectors';

import './WeeklySpendingChart.scss';

import { useTransactionStore } from '@/stores/transactionStore';
import { Area, AreaChart, XAxis } from 'recharts';

import CardChart from '../card-chart/CardChart';

export function WeeklySpendingChart() {
  const { transactions } = useTransactionStore();
  const weeklySpending = getWeeklySpending(transactions, new Date());

  return (
    <Card className="chart-container">
      <CardChart title="Weekly Spending" date="Last 7 days">
        <AreaChart
          style={{
            width: '100%',
            maxWidth: '300px',
            maxHeight: '100px',
            aspectRatio: 1.618,
          }}
          responsive
          data={weeklySpending}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="shortDayName" />
          <Area
            type="monotone"
            dataKey="dayTransactions"
            stroke="#8884d8"
            fill="#8884d8"
            dot
          />
        </AreaChart>
      </CardChart>
    </Card>
  );
}
