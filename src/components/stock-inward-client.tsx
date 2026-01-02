
'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box, Download, IndianRupee, Upload, Loader2 } from 'lucide-react';
import { RFIDScanner } from './rfid-scanner';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function StockInwardClient() {
  const { stock, addStockItem, productCatalog, setProductCatalog } = useAdminStore();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a valid .csv file.',
      });
      setCsvFile(null);
    }
  };

  const handleFileUpload = () => {
    if (!csvFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV file to upload.',
      });
      return;
    }
    
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows.shift()?.split(',').map(h => h.trim());
        
        if (!headers || !headers.includes('id') || !headers.includes('name') || !headers.includes('price')) {
          throw new Error("CSV must contain 'id', 'name', and 'price' columns.");
        }

        const idIndex = headers.indexOf('id');
        const nameIndex = headers.indexOf('name');
        const priceIndex = headers.indexOf('price');

        const newCatalog = rows.map(row => {
          const values = row.split(',');
          const price = parseFloat(values[priceIndex]);
          return {
            id: values[idIndex]?.trim(),
            name: values[nameIndex]?.trim(),
            price: isNaN(price) ? 0 : price,
          };
        }).filter(p => p.id && p.name);

        setProductCatalog(newCatalog);
        toast({
          title: 'Catalog Uploaded',
          description: `${newCatalog.length} products have been loaded into the catalog.`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to Upload CSV',
          description: error.message || 'An unexpected error occurred during parsing.',
        });
      } finally {
        setCsvFile(null); // Clear the file input
        setIsUploading(false); // End loading state
      }
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the selected file.',
      });
      setIsUploading(false);
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Upload Product Catalog</CardTitle>
                <CardDescription>
                    Upload a CSV file with your product data. The file must contain columns: 'id' (for barcode/RFID), 'name', and 'price'.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
                <Input type="file" accept=".csv" onChange={handleFileChange} className="w-full sm:w-auto flex-grow" disabled={isUploading}/>
                <Button onClick={handleFileUpload} disabled={!csvFile || isUploading}>
                    {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                        <><Upload className="mr-2 h-4 w-4" /> Upload</>
                    )}
                </Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button onClick={handleExportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export Stock to CSV
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
