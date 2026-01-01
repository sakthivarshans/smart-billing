import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { ApiKeysForm } from '@/components/api-keys-form';

export default function ApiKeysPage() {
  return (
    <AdminDashboardLayout>
      <ApiKeysForm />
    </AdminDashboardLayout>
  );
}
