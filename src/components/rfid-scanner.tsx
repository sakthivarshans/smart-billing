
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';
import { useAdminStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

type RFIDScannerProps = {
  onScan: (rfid: string) => void;
};

export function RFIDScanner({ onScan }: RFIDScannerProps) {
  const { productCatalog } = useAdminStore();
  const { toast } = useToast();
  const [scanIndex, setScanIndex] = useState(0);

  const handleSimulatedScan = () => {
    if (productCatalog.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Product Catalog is Empty',
        description: 'Please upload a CSV to populate the product catalog before scanning.',
      })
      onScan('unknown-item'); // Trigger unknown item toast if catalog is empty
      return;
    }
    const rfid = productCatalog[scanIndex].id;
    onScan(rfid);
    setScanIndex((prevIndex) => (prevIndex + 1) % productCatalog.length);
  };

  return (
    <Button onClick={handleSimulatedScan}>
      <ScanLine className="mr-2 h-4 w-4" />
      Simulate Scan
    </Button>
  );
}
