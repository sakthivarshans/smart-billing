
'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const ALL_MANAGER_TABS = [
    { id: 'dashboard', label: 'Store Details' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'sales', label: 'Sales' },
    { id: 'stock-inward', label: 'Stock Inward' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'returns', label: 'Returns' },
];

export function ManagerAccessClient() {
  const { toast } = useToast();
  const { managerPermissions, setManagerPermissions } = useAdminStore();
  
  const [currentPermissions, setCurrentPermissions] = useState<string[]>(managerPermissions);

  const handlePermissionChange = (tabId: string, checked: boolean) => {
    setCurrentPermissions(prev => {
        if (checked) {
            return [...prev, tabId];
        } else {
            return prev.filter(id => id !== tabId);
        }
    });
  };

  const handleSaveChanges = () => {
    setManagerPermissions(currentPermissions);
    toast({
        title: 'Permissions Updated',
        description: "The manager's access rights have been saved.",
    });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Manager Access Control</CardTitle>
            <CardDescription>
                Select the pages that users with the "Manager" role are allowed to access.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md">
                {ALL_MANAGER_TABS.map(tab => (
                    <div key={tab.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`perm-${tab.id}`}
                            checked={currentPermissions.includes(tab.id)}
                            onCheckedChange={(checked) => handlePermissionChange(tab.id, !!checked)}
                        />
                        <Label htmlFor={`perm-${tab.id}`} className="font-normal leading-tight">{tab.label}</Label>
                    </div>
                ))}
            </div>
            <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
        </CardContent>
    </Card>
  );
}
