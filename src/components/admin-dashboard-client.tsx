

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { DeveloperManagementClient } from './developer-management-client';

export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, isDeveloper } = useAdminStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/admin/login');
  };

  const handleTabChange = (value: string) => {
    router.push(`/admin/${value}`);
  };

  const activeTab = pathname.split('/')[2] || 'dashboard';

  if (!isAuthenticated) {
    return null; // Render nothing if not authenticated
  }
  
  if (isDeveloper) {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-2xl">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                        <CardTitle className="text-2xl">Developer Panel</CardTitle>
                        <CardDescription>
                            Manage developer-specific settings.
                        </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DeveloperManagementClient />
                </CardContent>
            </Card>
        </div>
    )
  }


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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="dashboard">Store Details</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="stock-inward">Stock Inward</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              <TabsTrigger value="developer">Developer</TabsTrigger>
            </TabsList>
            {children}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
