
'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_TABS = [
    { value: 'dashboard', label: 'Store Details' },
    { value: 'api-keys', label: 'API Keys' },
    { value: 'sales', label: 'Sales' },
    { value: 'stock-inward', label: 'Stock Inward' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'returns', label: 'Returns' },
    { value: 'manager-access', label: 'Manager Access', ownerOnly: true },
    { value: 'developer', label: 'developer', developerOnly: true },
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    if (!isClient) return false; // Don't render tabs on the server
    if (loggedInRole === 'developer') {
        return !tab.ownerOnly;
    }
    if (loggedInRole === 'owner') {
        return !tab.developerOnly;
    }
    if (loggedInRole === 'manager') {
        return managerPermissions.includes(tab.value);
    }
    return false;
  });

  useEffect(() => {
    if (isClient && loggedInRole === 'manager') {
        const canViewCurrentTab = visibleTabs.some(tab => tab.value === activeTab);
        if (!canViewCurrentTab && visibleTabs.length > 0) {
            router.replace(`/admin/${visibleTabs[0].value}`);
        }
    }
  }, [activeTab, loggedInRole, router, visibleTabs, isClient]);
  

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-6xl mx-auto shadow-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage your store settings, sales, and inventory.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Tabs */}
          {isClient && (
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              className="hidden sm:block"
            >
              <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length > 0 ? visibleTabs.length : 1}, minmax(0, 1fr))` }}>
                {visibleTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>
              <div className="pt-4">{children}</div>
            </Tabs>
          )}

          {/* Mobile Select */}
          <div className="sm:hidden">
            {isClient && (
              <Select onValueChange={handleTabChange} value={activeTab}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {visibleTabs.map(tab => (
                    <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="pt-4">{children}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
