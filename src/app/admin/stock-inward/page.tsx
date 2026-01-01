import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { StockInwardClient } from '@/components/stock-inward-client';

export default function StockInwardPage() {
  return (
    <AdminDashboardLayout>
      <StockInwardClient />
    </AdminDashboardLayout>
  );
}
