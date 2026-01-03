
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
import { LogOut, Code, Shield, UserCog } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { DeveloperManagementClient } from './developer-management-client';

const roleDisplayNames: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  developer: 'Developer',
};

const roleIcons: Record<string, React.ElementType> = {
  owner: Shield,
  manager: UserCog,
  developer: Code,
};


export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, role } = useAdminStore();
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

  if (!isAuthenticated || !role) {
    return null; // Render nothing until state is confirmed
  }

  const RoleIcon = roleIcons[role] || UserCog;
  const gridColsClass = role === 'owner' ? 'grid-cols-7' : 'grid-cols-6';
  
  if (role === 'developer') {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-6xl mx-auto shadow-2xl">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            Admin Dashboard
                            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <Code size={14}/> Developer Mode
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Special developer access panel.
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
              <CardTitle className="text-2xl flex items-center gap-2">
                Admin Dashboard 
                {role && (
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <RoleIcon size={14}/> {roleDisplayNames[role]}
                  </span>
                )}
              </CardTitle>
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
            <TabsList className={cn("grid w-full mb-6", gridColsClass)}>
              <TabsTrigger value="dashboard">Store Details</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="stock-inward">Stock Inward</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              {role === 'owner' && <TabsTrigger value="developer">Developer</TabsTrigger>}
            </TabsList>
            {children}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
