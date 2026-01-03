
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
  
  const [shopName, setShopName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [operatorMobile, setOperatorMobile] = useState('');
  const [operatorPassword, setOperatorPassword] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleAddUser = () => {
    if (!shopName) {
      toast({ variant: 'destructive', title: 'Shop Name Required', description: 'Please enter a shop name.' });
      return;
    }
    if (!emailId || !/^\S+@\S+\.\S+$/.test(emailId)) {
        toast({ variant: 'destructive', title: 'Invalid Email ID', description: 'Please enter a valid email address.' });
        return;
    }
    if (!/^\d{10}$/.test(operatorMobile)) {
      toast({ variant: 'destructive', title: 'Invalid Operator Mobile', description: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    if (operatorPassword.length < 4) {
      toast({ variant: 'destructive', title: 'Operator Password Too Short', description: 'Password must be at least 4 characters long.' });
      return;
    }
    if (!/^\d{10}$/.test(adminMobile)) {
        toast({ variant: 'destructive', title: 'Invalid Admin Mobile', description: 'Please enter a valid 10-digit mobile number.' });
        return;
    }
    if (adminPassword.length < 4) {
        toast({ variant: 'destructive', title: 'Admin Password Too Short', description: 'Password must be at least 4 characters long.' });
        return;
    }

    addUser(shopName, emailId, operatorMobile, operatorPassword, adminMobile, adminPassword);
    toast({
      title: 'User Added',
      description: `User for ${shopName} has been added.`,
    });
    setShopName('');
    setEmailId('');
    setOperatorMobile('');
    setOperatorPassword('');
    setAdminMobile('');
    setAdminPassword('');
  };

  const handleRemoveUser = (numberToRemove: string) => {
    removeUser(numberToRemove);
    toast({
      title: 'User Removed',
      description: `User with operator mobile ${numberToRemove} has been removed.`,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="new-shop-name">Shop Name</Label>
            <Input id="new-shop-name" type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop Name" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="new-email-id">Email ID</Label>
            <Input id="new-email-id" type="email" value={emailId} onChange={(e) => setEmailId(e.target.value)} placeholder="Email ID" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="new-operator-mobile">Operator Number</Label>
            <Input id="new-operator-mobile" type="tel" value={operatorMobile} onChange={(e) => setOperatorMobile(e.target.value)} placeholder="10-digit number" maxLength={10} />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="new-operator-password">Operator Password</Label>
            <Input id="new-operator-password" type="password" value={operatorPassword} onChange={(e) => setOperatorPassword(e.target.value)} placeholder="Min. 4 chars" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="new-admin-mobile">Admin Number</Label>
            <Input id="new-admin-mobile" type="tel" value={adminMobile} onChange={(e) => setAdminMobile(e.target.value)} placeholder="10-digit number" maxLength={10} />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <Label htmlFor="new-admin-password">Admin Password</Label>
            <Input id="new-admin-password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Min. 4 chars" />
          </div>
          <div className="self-end">
            <Button onClick={handleAddUser} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Email ID</TableHead>
                <TableHead>Operator Number</TableHead>
                <TableHead>Operator Password</TableHead>
                <TableHead>Admin Number</TableHead>
                <TableHead>Admin Password</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow key={`${user.operatorMobileNumber}-${index}`}>
                    <TableCell>{user.shopName}</TableCell>
                    <TableCell>{user.emailId}</TableCell>
                    <TableCell className="font-mono">{user.operatorMobileNumber}</TableCell>
                    <TableCell className="font-mono">{user.operatorPassword}</TableCell>
                    <TableCell className="font-mono">{user.adminMobileNumber}</TableCell>
                    <TableCell className="font-mono">{user.adminPassword}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" disabled={user.operatorMobileNumber === '9999999999'}>
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the user with operator number{' '}
                              <span className="font-semibold">{user.operatorMobileNumber}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveUser(user.operatorMobileNumber)}>
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
