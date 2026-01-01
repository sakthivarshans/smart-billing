'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import type { StoreDetails } from '@/lib/store';

export function StoreDetailsForm() {
  const { storeDetails, updateStoreDetails } = useAdminStore();
  const { toast } = useToast();

  const [formState, setFormState] = useState<StoreDetails>(storeDetails);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="storeName">Store Name</Label>
        <Input
          id="storeName"
          name="storeName"
          value={formState.storeName}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gstin">GSTIN</Label>
        <Input
          id="gstin"
          name="gstin"
          value={formState.gstin}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Store Address</Label>
        <Input
          id="address"
          name="address"
          value={formState.address}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Store Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={formState.phoneNumber}
          onChange={handleInputChange}
        />
      </div>
      <Button
        onClick={handleSaveChanges}
        disabled={isSaving}
        className="w-full mt-6"
      >
        {isSaving ? (
          'Saving...'
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Store Details
          </>
        )}
      </Button>
    </div>
  );
}
