import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { CustomerManagementClient } from '@/components/customer-management-client';

export default function CustomersPage() {
  return (
    <AdminDashboardLayout>
      <CustomerManagementClient />
    </AdminDashboardLayout>
  );
}
