

'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminStore } from '@/lib/store';

export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDeveloper } = useAdminStore();

  const handleTabChange = (value: string) => {
    router.push(`/admin/${value}`);
  };

  const activeTab = pathname.split('/')[2] || 'dashboard';

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-6xl mx-auto shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage your store settings, sales, and inventory.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className={`grid w-full ${isDeveloper ? 'grid-cols-7' : 'grid-cols-6'}`}>
              <TabsTrigger value="dashboard">Store Details</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="stock-inward">Stock Inward</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              {isDeveloper && <TabsTrigger value="developer">Developer</TabsTrigger>}
            </TabsList>
            {children}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
