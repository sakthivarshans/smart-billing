
'use client';

import { CustomerManagementClient } from '@/components/customer-management-client';
import { DeveloperManagementClient } from '@/components/developer-management-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DeveloperPageClient() {
  return (
    <Tabs defaultValue="developers" className="pt-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customers">Customer Logins</TabsTrigger>
        <TabsTrigger value="developers">Developer Logins</TabsTrigger>
      </TabsList>
      <TabsContent value="customers">
        <CustomerManagementClient />
      </TabsContent>
      <TabsContent value="developers">
        <DeveloperManagementClient />
      </TabsContent>
    </Tabs>
  );
}
