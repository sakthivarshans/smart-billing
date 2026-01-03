
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
  const { storeDetails, productCatalog } = useAdminStore();
  const { users, isAuthenticated, login, logout, phoneNumber: loggedInPhoneNumber } = useCustomerStore();
  
  const [loginAttempt, setLoginAttempt] = useState({ mobileNumber: '', password: ''});
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
    const user = users.find(u => u.operatorMobileNumber === loginAttempt.mobileNumber);
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'This mobile number is not registered.' });
        return;
    }
    const success = login(loginAttempt.mobileNumber, loginAttempt.password);
    if (success) {
        toast({ title: 'Login Successful', description: `Welcome!` });
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid mobile number or password.' });
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

  if (!isAuthenticated) {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Operator Login</CardTitle>
                    <CardDescription>Enter your credentials to access the billing system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                id="mobileNumber" 
                                type="tel" 
                                placeholder="10-digit mobile number"
                                className="pl-10"
                                maxLength={10}
                                value={loginAttempt.mobileNumber}
                                onChange={(e) => setLoginAttempt(prev => ({...prev, mobileNumber: e.target.value}))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Input 
                                id="password" 
                                type="password"
                                placeholder="Password" 
                                className="pl-10"
                                value={loginAttempt.password}
                                onChange={(e) => setLoginAttempt(prev => ({...prev, password: e.target.value}))}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleLogin}>Login</Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="relative">
          <div className="text-center">
            <CardTitle className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-accent">
              {storeDetails.storeName}
            </CardTitle>
            <CardDescription className="text-lg">
              Smart Billing System
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <div className="flex-grow relative">
                <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
          <div className="border rounded-lg overflow-hidden">
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
                      <TableCell className="text-right flex items-center justify-end"><IndianRupee size={14} className="mr-1"/>{item.price.toFixed(2)}</TableCell>
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
          <div className="flex justify-end items-center gap-4 pt-4 border-t-2 border-dashed">
            <span className="text-2xl font-bold">TOTAL:</span>
            <span className="text-3xl font-bold text-primary flex items-center">
                <IndianRupee size={24} className="mr-1"/>{total.toFixed(2)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center gap-4 bg-muted/50 p-6 rounded-b-lg">
            <div className="w-full sm:w-1/2 relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
