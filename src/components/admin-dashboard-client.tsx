
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Save } from 'lucide-react';
import type { StoreDetails, ApiKeys } from '@/lib/store';

export function AdminDashboardClient({ activeTab = 'store-details' }: { activeTab?: string }) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    logout, 
    storeDetails, 
    updateStoreDetails,
    apiKeys,
    updateApiKeys
  } = useAdminStore();
  const { toast } = useToast();

  const [storeFormState, setStoreFormState] = useState<StoreDetails>(storeDetails);
  const [apiKeysFormState, setApiKeysFormState] = useState<ApiKeys>(apiKeys);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setStoreFormState(storeDetails);
  }, [storeDetails]);

  useEffect(() => {
    setApiKeysFormState(apiKeys);
    }, [apiKeys]);


  const handleStoreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreFormState(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleApiKeysInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeysFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate saving to a backend
    setTimeout(() => {
      updateStoreDetails(storeFormState);
      updateApiKeys(apiKeysFormState);
      toast({
        title: 'Changes Saved',
        description: 'Your settings have been updated.',
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
    router.push('/');
  };

  const handleTabChange = (value: string) => {
    if (value === 'sales-dashboard') {
      router.push('/admin/sales');
    }
    if (value === 'stock-inward') {
      router.push('/admin/stock-inward');
    }
    if(value === 'store-details' || value === 'api-keys') {
        router.push('/admin/dashboard');
    }
  };

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
              <CardDescription>Update your store's information and API keys here.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} value={activeTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="store-details">Store Details</TabsTrigger>
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                    <TabsTrigger value="sales-dashboard">Sales Dashboard</TabsTrigger>
                    <TabsTrigger value="stock-inward">Stock Inward</TabsTrigger>
                </TabsList>
                <TabsContent value="store-details" className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input id="storeName" name="storeName" value={storeFormState.storeName} onChange={handleStoreInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input id="gstin" name="gstin" value={storeFormState.gstin} onChange={handleStoreInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Store Address</Label>
                        <Input id="address" name="address" value={storeFormState.address} onChange={handleStoreInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Store Phone Number</Label>
                        <Input id="phoneNumber" name="phoneNumber" value={storeFormState.phoneNumber} onChange={handleStoreInputChange} />
                    </div>
                    <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full mt-6">
                        {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Store Details</>}
                    </Button>
                </TabsContent>
                <TabsContent value="api-keys" className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="whatsappApiKey">WhatsApp Business API Key</Label>
                        <Input id="whatsappApiKey" name="whatsappApiKey" type="password" value={apiKeysFormState.whatsappApiKey} onChange={handleApiKeysInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                        <Input id="razorpayKeyId" name="razorpayKeyId" value={apiKeysFormState.razorpayKeyId} onChange={handleApiKeysInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                        <Input id="razorpayKeySecret" name="razorpayKeySecret" type="password" value={apiKeysFormState.razorpayKeySecret} onChange={handleApiKeysInputChange} />
                    </div>
                     <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full mt-6">
                        {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save API Keys</>}
                    </Button>
                </TabsContent>
                 <TabsContent value="sales-dashboard">
                    {/* Content is handled by navigation */}
                </TabsContent>
                <TabsContent value="stock-inward">
                    {/* Content is handled by navigation */}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
