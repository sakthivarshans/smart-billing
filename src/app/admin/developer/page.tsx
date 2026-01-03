

import { AdminDashboardLayout } from '@/components/admin-dashboard-client';
import { CustomerManagementClient } from '@/components/customer-management-client';
import { DeveloperManagementClient } from '@/components/developer-management-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function DeveloperPage() {
  return (
    <AdminDashboardLayout>
      <Tabs defaultValue="customer-list">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer-list">Customer List</TabsTrigger>
            <TabsTrigger value="developer-list">Developer List</TabsTrigger>
        </TabsList>
        <TabsContent value="customer-list">
            <CustomerManagementClient />
        </TabsContent>
        <TabsContent value="developer-list">
            <DeveloperManagementClient />
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}
