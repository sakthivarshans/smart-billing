
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  // Render a loading state or null while redirecting
  return null;
}
