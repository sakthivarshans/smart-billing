
import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { ReturnsClient } from '@/components/returns-client';

export default function ReturnsPage() {
  return (
    <AdminDashboardLayout>
      <ReturnsClient />
    </AdminDashboardLayout>
  );
}
