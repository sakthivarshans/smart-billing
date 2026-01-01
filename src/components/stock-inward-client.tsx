
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Box, Download, ScanLine } from 'lucide-react';
import { RFIDScanner } from './rfid-scanner';
import { useToast } from '@/hooks/use-toast';
import { mockItems } from '@/components/dashboard-client';

export function StockInwardClient() {
  const router = useRouter();
  const { isAuthenticated, stock, addStockItem } = useAdminStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  const handleItemScanned = (rfid: string) => {
    const item = mockItems.find(i => i.id === rfid.trim());
    if (item) {
        addStockItem({ rfid: item.id, name: item.name, price: item.price });
        toast({
            title: 'Stock Added',
            description: `1 unit of ${item.name} has been added to the inventory.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Unknown Item',
            description: `No item found with RFID tag: ${rfid}`,
        });
    }
  };

  const handleExportToCSV = () => {
    if (stock.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Stock to Export',
            description: 'Your inventory is currently empty.',
        });
        return;
    }

    const headers = ['Item Name', 'Quantity', 'Price', 'RFID'];
    const csvContent = [
        headers.join(','),
        ...stock.map(item => [item.name, item.quantity, item.price, item.rfid].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'stock_inventory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
        title: 'Export Successful',
        description: 'Your stock inventory has been downloaded as a CSV file.',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div>
                    <CardTitle className="text-2xl">Stock Inward</CardTitle>
                    <CardDescription>Scan new items to add them to your inventory.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex justify-end gap-2">
                <Button onClick={handleExportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                </Button>
                <RFIDScanner onScan={handleItemScanned} />
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="text-right">Quantity in Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stock.length > 0 ? (
                            stock.map((item) => (
                                <TableRow key={item.rfid}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Box className="h-8 w-8" />
                                        <span>No items in stock. Scan to begin.</span>
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
