
'use client';

import { useEffect } from 'react';
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
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ALL_TABS = [
    { value: 'dashboard', label: 'Store Details' },
    { value: 'api-keys', label: 'API Keys' },
    { value: 'sales', label: 'Sales' },
    { value: 'stock-inward', label: 'Stock Inward' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'returns', label: 'Returns' },
    { value: 'manager-access', label: 'Manager Access', ownerOnly: true },
    { value: 'developer', label: 'Developers', developerOnly: true },
];

export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loggedInRole, managerPermissions, logout } = useAdminStore();
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    router.push(`/admin/${value}`);
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/admin/login');
  };

  const activeTab = pathname.split('/')[2] || 'dashboard';

  const visibleTabs = ALL_TABS.filter(tab => {
    if (tab.value === 'developer') {
        return loggedInRole === 'developer';
    }
    if (tab.ownerOnly) {
        return loggedInRole === 'owner';
    }
    if (loggedInRole === 'manager') {
        return managerPermissions.includes(tab.value);
    }
    // Default for owner
    return loggedInRole === 'owner';
  });


  useEffect(() => {
    // If the user is a manager and their current tab is not in their list of visible tabs,
    // redirect them to the first tab they DO have permission for.
    if (loggedInRole === 'manager') {
        const canViewCurrentTab = visibleTabs.some(tab => tab.value === activeTab);
        if (!canViewCurrentTab && visibleTabs.length > 0) {
            router.replace(`/admin/${visibleTabs[0].value}`);
        }
    }
  }, [activeTab, loggedInRole, router, visibleTabs]);
  

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
            <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}>
              {visibleTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            {children}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
