
'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box, Download, IndianRupee, Upload, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { StockItem, Product } from '@/lib/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function StockInwardClient() {
  const { stock, addStockItem, productCatalog, setProductCatalog } = useAdminStore();
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  const [idColumn, setIdColumn] = useState('');
  const [nameColumn, setNameColumn] = useState('');
  const [priceColumn, setPriceColumn] = useState('');

  const [popoverOpenId, setPopoverOpenId] = useState(false);
  const [popoverOpenName, setPopoverOpenName] = useState(false);
  const [popoverOpenPrice, setPopoverOpenPrice] = useState(false);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      // Preview headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0];
        const headers = firstLine.split(',').map(h => h.trim());
        setCsvHeaders(headers);
        // Reset mappings
        setIdColumn('');
        setNameColumn('');
        setPriceColumn('');
      };
      reader.readAsText(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a valid .csv file.',
      });
      setCsvFile(null);
      setCsvHeaders([]);
    }
  };

  const handleFileUpload = () => {
    if (!csvFile) {
      toast({ variant: 'destructive', title: 'No File Selected' });
      return;
    }
    if (!idColumn || !nameColumn || !priceColumn) {
      toast({ variant: 'destructive', title: 'Column Mapping Incomplete', description: 'Please map all required fields.' });
      return;
    }
    
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows.shift()?.split(',').map(h => h.trim());
        
        if (!headers) throw new Error("CSV file is empty or invalid.");

        const idIndex = headers.indexOf(idColumn);
        const nameIndex = headers.indexOf(nameColumn);
        const priceIndex = headers.indexOf(priceColumn);

        if (idIndex === -1 || nameIndex === -1 || priceIndex === -1) {
          throw new Error("One or more mapped columns were not found in the file.");
        }

        const newCatalog: Product[] = rows.map(row => {
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
          description: `${newCatalog.length} products have been loaded.`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to Upload CSV',
          description: error.message || 'An unexpected error occurred.',
        });
      } finally {
        setCsvFile(null);
        setCsvHeaders([]);
        const fileInput = document.getElementById('csv-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'File Read Error' });
      setIsUploading(false);
    };
    reader.readAsText(csvFile);
  };
  
  const lastFiveItems = stock.slice(-5).reverse();

  const renderMappingSelector = (
    label: string, 
    value: string, 
    setValue: (val: string) => void, 
    isOpen: boolean, 
    setIsOpen: (open: boolean) => void
  ) => (
    <div className="flex flex-col space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between"
                    disabled={csvHeaders.length === 0}
                >
                    {value ? csvHeaders.find(h => h === value) : "Select column..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search columns..." />
                    <CommandList>
                        <CommandEmpty>No columns found.</CommandEmpty>
                        <CommandGroup>
                            {csvHeaders.map((header) => (
                                <CommandItem
                                    key={header}
                                    value={header}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === header ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {header}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
);


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Upload Product Catalog</CardTitle>
                <CardDescription>
                    Select a CSV file, then map the columns from your file to the required product fields.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input id="csv-upload-input" type="file" accept=".csv" onChange={handleFileChange} className="w-full sm:w-auto flex-grow" disabled={isUploading}/>
                </div>

                {csvHeaders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md animate-in fade-in-0">
                        {renderMappingSelector("Barcode/RFID Column", idColumn, setIdColumn, popoverOpenId, setPopoverOpenId)}
                        {renderMappingSelector("Product Name Column", nameColumn, setNameColumn, popoverOpenName, setPopoverOpenName)}
                        {renderMappingSelector("Price Column", priceColumn, setPriceColumn, popoverOpenPrice, setPopoverOpenPrice)}
                    </div>
                )}
                
                <Button onClick={handleFileUpload} disabled={!csvFile || isUploading || !idColumn || !nameColumn || !priceColumn} className="w-full">
                    {isUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                        <><Upload className="mr-2 h-4 w-4" /> Upload Catalog</>
                    )}
                </Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button onClick={() => {
              if (productCatalog.length === 0) {
                toast({ variant: 'destructive', title: 'Catalog Empty', description: 'Please upload a product catalog first.' });
                return;
              }
              const item = productCatalog[Math.floor(Math.random() * productCatalog.length)];
              addStockItem({ rfid: item.id, name: item.name, price: item.price });
              toast({ title: 'Stock Added', description: `1 unit of ${item.name} added.` });
            }}>
                <Box className="mr-2 h-4 w-4" />
                Simulate Stock Inward
            </Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>RFID</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lastFiveItems.length > 0 ? (
                        lastFiveItems.map((item, index) => (
                            <TableRow key={`${item.rfid}-${stock.length - index}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.rfid}</TableCell>
                                <TableCell className="text-right flex items-center justify-end">
                                    <IndianRupee size={14} className="mr-1"/>{item.price.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Box className="h-8 w-8" />
                                    <span>No recent stock activity.</span>
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
