
'use client';

import { useState } from 'react';
import { useCustomerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trash2, UserPlus, Users } from 'lucide-react';

export function CustomerManagementClient() {
  const { toast } = useToast();
  const { users, addUser, removeUser } = useCustomerStore();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleAddUser = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }
    if (password.length < 4) {
        toast({
          variant: 'destructive',
          title: 'Password Too Short',
          description: 'Password must be at least 4 characters long.',
        });
        return;
    }
    addUser(mobileNumber, password);
    toast({
      title: 'User Added',
      description: `User with mobile number ${mobileNumber} has been added.`,
    });
    setMobileNumber('');
    setPassword('');
  };

  const handleRemoveUser = (numberToRemove: string) => {
    removeUser(numberToRemove);
    toast({
      title: 'User Removed',
      description: `User with mobile number ${numberToRemove} has been removed.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Customer Logins</CardTitle>
        <CardDescription>
          Add or remove mobile numbers that are allowed to use the operator login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow space-y-2">
            <Label htmlFor="new-mobile-number">New Mobile Number</Label>
            <Input
              id="new-mobile-number"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>
          <div className="flex-grow space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 4 characters"
            />
          </div>
          <div className="flex-shrink-0 self-end">
            <Button onClick={handleAddUser} className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.mobileNumber}>
                    <TableCell className="font-mono">{user.mobileNumber}</TableCell>
                    <TableCell className="font-mono">{user.passwordHash}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" disabled={user.mobileNumber === '9999999999'}>
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the user{' '}
                              <span className="font-semibold">{user.mobileNumber}</span> and they will no longer be able to log in.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveUser(user.mobileNumber)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8" />
                      <span>No customers found.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
