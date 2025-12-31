'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScanLine, IndianRupee, ShoppingCart, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockItems = [
  { name: 'Modern T-Shirt', price: 499 },
  { name: 'Slim Fit Jeans', price: 1299 },
  { name: 'Denim Jacket', price: 2499 },
  { name: 'Crew Socks (3-pack)', price: 299 },
  { name: 'Baseball Cap', price: 399 },
];

export function DashboardClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, total, whatsappNumber, addItem, setWhatsappNumber } = useBillStore();
  const [lastScannedIndex, setLastScannedIndex] = useState(-1);

  const handleScanItem = () => {
    const nextIndex = (lastScannedIndex + 1) % mockItems.length;
    addItem(mockItems[nextIndex]);
    setLastScannedIndex(nextIndex);
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
    if (!whatsappNumber || !/^\d{10}$/.test(whatsappNumber)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Number',
        description: 'Please enter a valid 10-digit WhatsApp number.',
      });
      return;
    }
    router.push('/payment');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-accent">
            ABC CLOTHINGS
          </CardTitle>
          <CardDescription className="text-lg">
            Smart Billing System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleScanItem}>
              <ScanLine className="mr-2 h-4 w-4" />
              Simulate Item Scan
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
                    placeholder="Enter 10-digit WhatsApp Number"
                    className="pl-10"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
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
