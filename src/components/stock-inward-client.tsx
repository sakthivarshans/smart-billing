
'use client';

import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box, Download, IndianRupee } from 'lucide-react';
import { RFIDScanner } from './rfid-scanner';
import { useToast } from '@/hooks/use-toast';

export function StockInwardClient() {
  const { stock, addStockItem, productCatalog } = useAdminStore();
  const { toast } = useToast();

  const handleItemScanned = (rfid: string) => {
    const item = productCatalog.find(p => p.id === rfid.trim());
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
            description: `No item found in product catalog with ID: ${rfid}`,
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

  return (
    <div className="space-y-6">
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
                        <TableHead>RFID</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stock.length > 0 ? (
                        stock.map((item) => (
                            <TableRow key={item.rfid}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.rfid}</TableCell>
                                <TableCell className="text-right flex items-center justify-end">
                                    <IndianRupee size={14} className="mr-1"/>{item.price.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
    </div>
  );
}
