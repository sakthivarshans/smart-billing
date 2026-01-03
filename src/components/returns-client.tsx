
'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, History, Undo, Info, Package, IndianRupee, Calendar, Phone } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { Sale, BillItem } from '@/lib/store';

interface FoundSale {
  sale: Sale;
  item: BillItem;
}

export function ReturnsClient() {
  const { toast } = useToast();
  const { sales, processReturn } = useAdminStore();
  
  const [rfid, setRfid] = useState('');
  const [foundSale, setFoundSale] = useState<FoundSale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = () => {
    if (!rfid) {
      toast({ variant: 'destructive', title: 'Barcode Required', description: 'Please enter a barcode/RFID to search.' });
      return;
    }
    
    setSearchPerformed(true);
    setFoundSale(null);

    for (const sale of sales) {
      const item = sale.items.find(i => i.rfid === rfid);
      if (item) {
        setFoundSale({ sale, item });
        return;
      }
    }
  };

  const handleReturn = () => {
    if (!foundSale) return;
    setIsProcessing(true);
    processReturn(foundSale.sale.id, foundSale.item.id);
    toast({
      title: 'Return Processed',
      description: `Item '${foundSale.item.name}' has been marked as returned.`,
    });
    // Update the local state to reflect the change
    setFoundSale(prev => {
        if (!prev) return null;
        return {
            ...prev,
            item: { ...prev.item, status: 'returned' }
        };
    });
    setIsProcessing(false);
  };
  
  const recentReturns = useMemo(() => {
    return sales
      .flatMap(sale => sale.items.map(item => ({ ...item, saleDate: sale.date, saleId: sale.id })))
      .filter(item => item.status === 'returned')
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5);
  }, [sales]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Return Management</CardTitle>
          <CardDescription>Scan a product's barcode to find its sale history and process a return.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              id="rfid-search"
              type="text"
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Scan or enter Barcode/RFID"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Find Sale
            </Button>
          </div>

          {searchPerformed && (
            <div className="pt-4">
              {foundSale ? (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-xl">Sale Found!</CardTitle>
                    <CardDescription>Details of the original transaction for this item.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2"><Package size={16} /> <strong>Product:</strong> {foundSale.item.name}</div>
                        <div className="flex items-center gap-2"><IndianRupee size={16} /> <strong>Sold Price:</strong> {foundSale.item.price.toFixed(2)}</div>
                        <div className="flex items-center gap-2"><Calendar size={16} /> <strong>Sale Date:</strong> {new Date(foundSale.sale.date).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><Phone size={16} /> <strong>Customer:</strong> {foundSale.sale.phoneNumber}</div>
                        <div className="flex items-center gap-2 col-span-2"><Info size={16} /> <strong>Payment ID:</strong> {foundSale.sale.id}</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {foundSale.item.status === 'returned' ? (
                        <Button variant="outline" disabled>
                            <Undo className="mr-2 h-4 w-4" /> Already Returned
                        </Button>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isProcessing}>
                                    <Undo className="mr-2 h-4 w-4" /> Process Return
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Return</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to mark this item ({foundSale.item.name}) as returned? This action will update the sale record.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReturn}>
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                  <History className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-semibold">No Sale History Found</p>
                  <p className="text-sm text-muted-foreground">This barcode does not match any item in the sales records.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
            <CardDescription>A list of the most recently processed returns.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Barcode/RFID</TableHead>
                        <TableHead>Original Sale Date</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentReturns.length > 0 ? (
                        recentReturns.map(item => (
                            <TableRow key={`${item.saleId}-${item.id}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.rfid}</TableCell>
                                <TableCell>{new Date(item.saleDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No recent returns found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
