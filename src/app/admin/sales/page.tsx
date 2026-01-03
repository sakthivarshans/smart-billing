import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { SalesDashboardClient } from '@/components/sales-dashboard-client';

export default function SalesPage() {
  return (
    <AdminDashboardLayout>
      <SalesDashboardClient />
    </AdminDashboardLayout>
  );
}
