'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Save } from 'lucide-react';
import type { StoreDetails } from '@/lib/store';

export function AdminDashboardClient() {
  const router = useRouter();
  const { isAuthenticated, logout, storeDetails, updateStoreDetails } = useAdminStore();
  const { toast } = useToast();

  const [formState, setFormState] = useState<StoreDetails>(storeDetails);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to login page.
    // This provides client-side protection.
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Keep form in sync if global state changes
    setFormState(storeDetails);
  }, [storeDetails]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate saving to a backend
    setTimeout(() => {
      updateStoreDetails(formState);
      toast({
        title: 'Changes Saved',
        description: 'Your store details have been updated.',
      });
      setIsSaving(false);
    }, 500);
  };

  const handleLogout = () => {
    logout();
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    router.push('/admin/login');
  };

  // Render a loading state or null while checking for authentication
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>Update your store's information here.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input id="storeName" name="storeName" value={formState.storeName} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" name="gstin" value={formState.gstin} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Store Address</Label>
            <Input id="address" name="address" value={formState.address} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Store Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" value={formState.phoneNumber} onChange={handleInputChange} />
          </div>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
            {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
