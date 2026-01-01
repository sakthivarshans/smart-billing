import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const SalesDashboardClient = dynamic(() => import('@/components/sales-dashboard-client').then(mod => mod.SalesDashboardClient), {
  ssr: false,
  loading: () => (
    <div className="p-8">
      <Skeleton className="h-96 w-full" />
    </div>
  ),
});

export default function SalesDashboardPage() {
  return <SalesDashboardClient />;
}
