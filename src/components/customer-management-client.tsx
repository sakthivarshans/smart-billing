'use client';

import { useState } from 'react';
import { useCustomerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Users } from 'lucide-react';
import type { CustomerUser } from '@/lib/store';

export function CustomerManagementClient() {
  const { users, addUser, removeUser } = useCustomerStore();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddUser = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }
    
    if (users.find(u => u.mobileNumber === mobileNumber)) {
        toast({
            variant: 'destructive',
            title: 'Customer Already Exists',
            description: 'This mobile number is already registered.',
        });
        return;
    }

    setIsAdding(true);
    setTimeout(() => {
      addUser(mobileNumber);
      toast({
        title: 'Customer Added',
        description: `${mobileNumber} can now log in with the default password.`,
      });
      setMobileNumber('');
      setIsAdding(false);
    }, 300);
  };
  
  const handleRemoveUser = (numberToRemove: string) => {
    removeUser(numberToRemove);
    toast({
        title: 'Customer Removed',
        description: `${numberToRemove} has been removed and can no longer log in.`,
      });
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddUser();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Customer</CardTitle>
          <CardDescription>
            Add a new customer who is authorized to use the billing application. They will be given a default password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow space-y-2">
            <Label htmlFor="mobile-number" className="sr-only">Mobile Number</Label>
            <Input
              id="mobile-number"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={10}
              disabled={isAdding}
            />
          </div>
          <Button onClick={handleAddUser} disabled={isAdding} className="w-full sm:w-auto">
            {isAdding ? 'Adding...' : <><UserPlus className="mr-2 h-4 w-4" /> Add Customer</>}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Registered Customers</CardTitle>
            <CardDescription>
                List of all customers who have access to the app.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mobile Number</TableHead>
                            <TableHead>Default Password</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.mobileNumber}>
                                    <TableCell className="font-medium">{user.mobileNumber}</TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground italic">{user.passwordHash === 'password' ? 'password' : 'Custom'}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.mobileNumber)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-8 w-8" />
                                        <span>No customers have been added yet.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
