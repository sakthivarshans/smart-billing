import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { InventoryClient } from '@/components/inventory-client';

export default function InventoryPage() {
  return (
    <AdminDashboardLayout>
      <InventoryClient />
    </AdminDashboardLayout>
  );
}
