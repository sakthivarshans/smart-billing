
'use client';

import { useMemo, useState } from 'react';
import { useAdminStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, PackageSearch, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import type { Product } from '@/lib/store';

interface InventoryItem extends Product {
  stockIn: number;
  stockOut: number;
  available: number;
}

export function InventoryClient() {
  const { toast } = useToast();
  const {
    stock,
    sales,
    productCatalog,
    columnMapping,
    clearInventory,
  } = useAdminStore((state) => ({
    stock: state.stock,
    sales: state.sales,
    productCatalog: state.productCatalog,
    columnMapping: state.columnMapping,
    clearInventory: state.clearInventory,
  }));
  const [isClearing, setIsClearing] = useState(false);

  const inventoryData = useMemo(() => {
    const inventoryMap = new Map<string, InventoryItem>();

    // Initialize with all products from the catalog
    productCatalog.forEach((product) => {
      inventoryMap.set(product.id, {
        ...product,
        stockIn: 0,
        stockOut: 0,
        available: 0,
      });
    });

    // Calculate stock in
    stock.forEach((item) => {
      const entry = inventoryMap.get(item.rfid);
      if (entry) {
        entry.stockIn += 1;
      }
    });

    // Calculate stock out from successful sales
    sales.forEach((sale) => {
      if (sale.status === 'success') {
        sale.items.forEach((item) => {
          const entry = inventoryMap.get(item.rfid);
          if (entry) {
            entry.stockOut += 1;
          }
        });
      }
    });

    // Calculate available stock
    inventoryMap.forEach((entry) => {
      entry.available = entry.stockIn - entry.stockOut;
    });

    return Array.from(inventoryMap.values());
  }, [stock, sales, productCatalog]);

  const handleDownloadInventory = () => {
    if (inventoryData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Inventory Data',
        description:
          'There is no inventory to export. Upload a product catalog first.',
      });
      return;
    }

    const headers = [
      columnMapping.idColumn || 'Barcode/RFID',
      columnMapping.nameColumn || 'Product Name',
      columnMapping.priceColumn || 'Price',
    ];
    if (columnMapping.optionalColumn1)
      headers.push(columnMapping.optionalColumn1);
    if (columnMapping.optionalColumn2)
      headers.push(columnMapping.optionalColumn2);
    headers.push('Stock In', 'Sold', 'Available');

    const csvContent = [
      headers.join(','),
      ...inventoryData.map((item) => {
        const row: (string | number)[] = [item.id, item.name, item.price];
        if (columnMapping.optionalColumn1) row.push(item.optional1 || '');
        if (columnMapping.optionalColumn2) row.push(item.optional2 || '');
        row.push(item.stockIn, item.stockOut, item.available);
        return row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download Started',
      description: 'Your inventory report is being downloaded.',
    });
  };

  const handleClearInventory = () => {
    setIsClearing(true);
    clearInventory();
    toast({
      title: 'Inventory Cleared',
      description: 'All product catalog and stock records have been erased. Sales data remains.',
    });
    setIsClearing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Inventory</CardTitle>
        <CardDescription>
          Download a real-time overview of your product stock levels. The
          columns will reflect your selections from the 'Stock Inward' tab.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center p-12">
        {inventoryData.length > 0 || stock.length > 0 ? (
          <>
            <PackageSearch className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              Your inventory report is ready to be downloaded.
            </p>
            <Button onClick={handleDownloadInventory}>
              <Download className="mr-2 h-4 w-4" />
              Download Inventory Report
            </Button>
          </>
        ) : (
          <>
            <PackageSearch className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="font-semibold">No inventory data found.</p>
            <p className="text-sm text-muted-foreground">
              Upload a product catalog in the 'Stock Inward' tab to get
              started.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end bg-muted/50 p-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isClearing}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear Inventory'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                product catalog and all stock inward records. Your sales and payment logs will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearInventory}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
