
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore, useAdminStore, useCustomerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, ShoppingCart, Smartphone, Trash2, ScanLine, LogOut, KeyRound, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RFIDScanner } from './rfid-scanner';
import { Label } from './ui/label';

export function DashboardClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, total, addItem, setPhoneNumber: setBillPhoneNumber, resetBill, phoneNumber: billPhoneNumber } = useBillStore();
  const { storeDetails, productCatalog, login: adminLogin, developers } = useAdminStore();
  const { users, isAuthenticated, login, logout, phoneNumber: loggedInPhoneNumber } = useCustomerStore();
  
  const [loginAttemptMobile, setLoginAttemptMobile] = useState('');
  const [password, setPassword] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(billPhoneNumber);
  const [rfidInput, setRfidInput] = useState('');
  const rfidInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
        setCurrentPhoneNumber(loggedInPhoneNumber);
        setBillPhoneNumber(loggedInPhoneNumber);
    }
  }, [isAuthenticated, loggedInPhoneNumber, setBillPhoneNumber]);
  
  useEffect(() => {
    if(isAuthenticated) {
      rfidInputRef.current?.focus();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // Standard login for all users. Developer status grants access via key icon.
    const success = login(loginAttemptMobile);
    if (success) {
        const isDeveloper = developers.some(d => d.mobileNumber === loginAttemptMobile);
        if (isDeveloper) {
            toast({ title: 'Developer Login Successful', description: `Welcome, Developer!` });
        } else {
            toast({ title: 'Login Successful', description: `Welcome!` });
        }
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'This mobile number is not registered.' });
    }
  }

  const handleLogout = () => {
    logout();
    resetBill();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  }

  const handleItemScanned = (scannedId: string) => {
    if (!scannedId) return;
    const item = productCatalog.find(p => p.id === scannedId.trim());
    if (item) {
        addItem({ rfid: item.id, name: item.name, price: item.price, optional1: item.optional1, optional2: item.optional2 });
        toast({
            title: 'Item Added',
            description: `${item.name} has been added to the bill.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Unknown Item',
            description: `No item found with ID: ${scannedId}`,
        });
    }
    setRfidInput('');
  };

  const handleRfidKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleItemScanned(rfidInput);
    }
  };

  const handleProceedToPayment = () => {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Cart',
        description: 'Please scan at least one item before proceeding.',
      });
      return;
    }
    
    if (!/^\d{10}$/.test(currentPhoneNumber)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Mobile Number',
            description: 'Please enter a valid 10-digit mobile number for the receipt.',
        });
        return;
    }

    setBillPhoneNumber(currentPhoneNumber);
    router.push('/payment');
  };

  const handleClearBill = () => {
    resetBill();
    setCurrentPhoneNumber(loggedInPhoneNumber);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from the bill.',
    });
  }

  const handleAdminLoginClick = () => {
    const isDeveloper = developers.some(d => d.mobileNumber === loggedInPhoneNumber);
    if (isDeveloper) {
      const success = adminLogin('developer');
      if (success) {
        toast({ title: 'Developer Access Granted', description: 'Welcome, developer!' });
        router.push('/admin/dashboard');
      }
    } else {
      router.push('/admin/login');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="relative">
          <div className="text-center">
            <CardTitle className="text-4xl font-bold tracking-tight text-accent md:text-5xl">
              {storeDetails.storeName}
            </CardTitle>
            <CardDescription className="text-lg">
              Smart Billing System
            </CardDescription>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleAdminLoginClick}>
                <KeyRound className="h-5 w-5" />
                <span className="sr-only">Admin Login</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <div className="relative flex-grow">
                <ScanLine className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={rfidInputRef}
                    type="text"
                    placeholder="Scan or Enter Barcode..."
                    className="pl-10"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    onKeyPress={handleRfidKeyPress}
                />
            </div>
            <RFIDScanner onScan={handleItemScanned} />
            <Button variant="destructive" onClick={handleClearBill} disabled={items.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">S.No</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Grams/Size</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Date and Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id} className="animate-in fade-in-0 slide-in-from-top-4 duration-300">
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.optional1 || ''}</TableCell>
                      <TableCell className="flex items-center justify-end text-right"><IndianRupee size={14} className="mr-1"/>{item.price.toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.timestamp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-8 w-8" />
                        <span>Scan an item to begin</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end gap-4 border-t-2 border-dashed pt-4">
            <span className="text-xl font-bold sm:text-2xl">TOTAL:</span>
            <span className="flex items-center text-2xl font-bold text-primary sm:text-3xl">
                <IndianRupee size={24} className="mr-1"/>{total.toFixed(2)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4 rounded-b-lg bg-muted/50 p-6 sm:flex-row">
            <div className="relative w-full sm:w-1/2">
                <Smartphone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="tel"
                    placeholder="Customer's WhatsApp Number"
                    className="pl-10"
                    value={currentPhoneNumber}
                    onChange={(e) => setCurrentPhoneNumber(e.target.value)}
                    maxLength={10}
                />
            </div>
            <Button size="lg" className="w-full sm:w-1/2" onClick={handleProceedToPayment}>
                Proceed to Payment
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
