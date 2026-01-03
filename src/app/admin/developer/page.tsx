
import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { DeveloperPageClient } from '@/components/developer-page-client';

export default function DeveloperPage() {
  return (
    <AdminDashboardLayout>
        <DeveloperPageClient />
    </AdminDashboardLayout>
  );
}
