import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { StoreDetailsForm } from '@/components/store-details-form';

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout>
      <StoreDetailsForm />
    </AdminDashboardLayout>
  );
}
