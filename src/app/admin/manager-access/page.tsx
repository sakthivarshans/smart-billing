
import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { ManagerAccessClient } from '@/components/manager-access-client';

export default function ManagerAccessPage() {
  return (
    <AdminDashboardLayout>
      <ManagerAccessClient />
    </AdminDashboardLayout>
  );
}
