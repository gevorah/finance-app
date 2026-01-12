import { Input } from '@/shared/components/ui/input';

export default function Home() {
  return (
    <main>
      <h1>finance-app</h1>
      <Input id="name" label="Name" hint="Write your name" required />
    </main>
  );
}
