import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import "./page.scss"

export default function Home() {
  return (
    <main className='page-container'>
      <h1>finance-app</h1>
      <Button type={'secondary'} size={'large'} border={true}>
        Cancel
      </Button>
      <Button type={'primary'} size={'large'}>
        Save Transaction
      </Button>
      <Card
        title={'total balance'}
        description={'$24.500,80'}
        type={'primary'}
        stats={[
          { icon: 'income', label: 'Income', value: '+$8,450.00' },
          { icon: 'expense', label: 'Expenses', value: '-$3,280.50' },
        ]}
      ></Card>
      <Card
        title={'Monthly Expenses'}
        description={'$3,280'}
        type={'secondary'}
        stats={[{icon: 'expense', label: '12% Last month', value: ''}]}
      ></Card>
    </main>
  );
}
