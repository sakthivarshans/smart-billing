

import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { DeveloperManagementClient } from '@/components/developer-management-client';

export default function DeveloperPage() {
  return (
    <AdminDashboardLayout>
        <div className="pt-4">
            <DeveloperManagementClient />
        </div>
    </AdminDashboardLayout>
  );
}
