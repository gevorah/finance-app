import { Button } from '@/shared/components/ui/button';

export default function Home() {
  return (
    <main>
      <h1>finance-app</h1>
      <Button type={'secondary'} size={'large'} border={true}>
        Cancel
      </Button>
      <Button type={'primary'} size={'large'}>
        Save Transaction
      </Button>
    </main>
  );
}
