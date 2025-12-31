'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { useCustomerStore } from '@/lib/store';

export default function BillingPage() {
  const router = useRouter();
  const { isAuthenticated } = useCustomerStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return <DashboardClient />;
}
