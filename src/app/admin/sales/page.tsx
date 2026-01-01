import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { SalesDashboardDynamic } from '@/components/sales-dashboard-dynamic';

export default function SalesPage() {
  return (
    <AdminDashboardLayout>
      <SalesDashboardDynamic />
    </AdminDashboardLayout>
  );
}
