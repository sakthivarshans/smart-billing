'use client';

import { useMemo } from 'react';
import { useAdminStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PackageSearch } from 'lucide-react';
import type { Product } from '@/lib/store';

interface InventoryItem extends Product {
  stockIn: number;
  stockOut: number;
  available: number;
}

export function InventoryClient() {
  const { stock, sales, productCatalog } = useAdminStore((state) => ({
    stock: state.stock,
    sales: state.sales,
    productCatalog: state.productCatalog,
  }));

  const inventoryData = useMemo(() => {
    const inventoryMap = new Map<string, InventoryItem>();

    // Initialize with all products from the catalog
    productCatalog.forEach(product => {
      inventoryMap.set(product.id, {
        ...product,
        stockIn: 0,
        stockOut: 0,
        available: 0,
      });
    });

    // Calculate stock in
    stock.forEach(item => {
      const entry = inventoryMap.get(item.rfid);
      if (entry) {
        entry.stockIn += 1;
      }
    });

    // Calculate stock out from successful sales
    sales.forEach(sale => {
      if (sale.status === 'success') {
        sale.items.forEach(item => {
          const entry = inventoryMap.get(item.rfid);
          if (entry) {
            entry.stockOut += 1;
          }
        });
      }
    });

    // Calculate available stock
    inventoryMap.forEach(entry => {
      entry.available = entry.stockIn - entry.stockOut;
    });

    return Array.from(inventoryMap.values());
  }, [stock, sales, productCatalog]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Inventory</CardTitle>
        <CardDescription>
          A real-time overview of your product stock levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Barcode/RFID</TableHead>
                <TableHead className="text-center">Stock In</TableHead>
                <TableHead className="text-center">Sold</TableHead>
                <TableHead className="text-center font-bold">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.length > 0 ? (
                inventoryData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="text-center">{item.stockIn}</TableCell>
                    <TableCell className="text-center">{item.stockOut}</TableCell>
                    <TableCell className="text-center font-bold">{item.available}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <PackageSearch className="h-8 w-8" />
                        <span>No inventory data found.</span>
                        <span className="text-xs">Upload a product catalog in the 'Stock Inward' tab to get started.</span>
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
