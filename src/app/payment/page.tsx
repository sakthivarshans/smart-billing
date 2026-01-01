'use client';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PaymentClient = dynamic(
  () =>
    import('@/components/payment-client').then((mod) => mod.PaymentClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Skeleton className="h-[500px] w-full max-w-sm" />
      </div>
    ),
  }
);

export default function PaymentPage() {
  return <PaymentClient />;
}
