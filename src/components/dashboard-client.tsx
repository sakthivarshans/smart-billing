
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBillStore, useAdminStore, useCustomerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, ShoppingCart, Smartphone, Trash2, UserCog, LogOut, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RFIDScanner } from './rfid-scanner';

export function DashboardClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, total, addItem, setPhoneNumber, resetBill, phoneNumber } = useBillStore();
  const { phoneNumber: customerPhoneNumber, logout: customerLogout } = useCustomerStore();
  const { storeDetails, productCatalog } = useAdminStore();
  
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(phoneNumber || customerPhoneNumber);
  const [rfidInput, setRfidInput] = useState('');
  const rfidInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Sync phone number from customer store to bill store when component mounts
    if (customerPhoneNumber) {
        setCurrentPhoneNumber(customerPhoneNumber);
        setPhoneNumber(customerPhoneNumber);
    }
  }, [customerPhoneNumber, setPhoneNumber]);
  
  useEffect(() => {
    // Auto-focus the RFID input field on component mount
    rfidInputRef.current?.focus();
  }, []);


  const handleItemScanned = (scannedId: string) => {
    if (!scannedId) return;
    const item = productCatalog.find(p => p.id === scannedId.trim());
    if (item) {
        addItem({ rfid: item.id, name: item.name, price: item.price });
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
    // Clear input for next scan
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

    setPhoneNumber(currentPhoneNumber);
    router.push('/payment');
  };

  const handleClearBill = () => {
    resetBill();
    setCurrentPhoneNumber(customerPhoneNumber); // Reset to logged in user's number
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from the bill.',
    });
  }

  const handleLogout = () => {
    customerLogout();
    resetBill(); // This clears the phoneNumber from the bill store
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
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
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Link href="/admin/login" passHref>
                <Button variant="ghost" size="icon" aria-label="Admin Login">
                    <UserCog className="h-6 w-6" />
                </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <div className="relative w-full sm:w-auto">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={rfidInputRef}
                type="text"
                placeholder="Scan Barcode or RFID..."
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
                      <TableCell className="text-right flex items-center justify-end"><IndianRupee size={14} className="mr-1"/>{item.price.toFixed(2)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.timestamp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
