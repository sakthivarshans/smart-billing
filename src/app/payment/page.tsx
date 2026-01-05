'use client';
import dynamic from 'next/dynamic';

const PaymentClient = dynamic(
  () =>
    import('@/components/payment-client').then((mod) => mod.PaymentClient),
  {
    ssr: false,
  }
);

export default function PaymentPage() {
  return <PaymentClient />;
}
