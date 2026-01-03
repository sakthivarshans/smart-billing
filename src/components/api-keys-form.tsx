

'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import type { ApiKeys } from '@/lib/store';

export function ApiKeysForm() {
  const { apiKeys, updateApiKeys } = useAdminStore();
  const { toast } = useToast();

  const [formState, setFormState] = useState<ApiKeys>(apiKeys);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    updateApiKeys(formState);
    toast({
      title: 'Changes Saved',
      description: 'Your API keys have been updated.',
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="whatsappApiUrl">WhatsApp API URL</Label>
        <Input
          id="whatsappApiUrl"
          name="whatsappApiUrl"
          type="text"
          value={formState.whatsappApiUrl}
          onChange={handleInputChange}
          placeholder="e.g., https://api.botbee.ai/v1/messages"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
        <Input
          id="whatsappApiKey"
          name="whatsappApiKey"
          type="password"
          value={formState.whatsappApiKey}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emailApiUrl">Email API URL</Label>
        <Input
          id="emailApiUrl"
          name="emailApiUrl"
          type="text"
          value={formState.emailApiUrl}
          onChange={handleInputChange}
          placeholder="e.g., https://api.sendgrid.com/v3/mail/send"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emailApiKey">Email API Key</Label>
        <Input
          id="emailApiKey"
          name="emailApiKey"
          type="password"
          value={formState.emailApiKey}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
        <Input
          id="razorpayKeyId"
          name="razorpayKeyId"
          value={formState.razorpayKeyId}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
        <Input
          id="razorpayKeySecret"
          name="razorpayKeySecret"
          type="password"
          value={formState.razorpayKeySecret}
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
            <Save className="mr-2 h-4 w-4" /> Save API Keys
          </>
        )}
      </Button>
    </div>
  );
}
