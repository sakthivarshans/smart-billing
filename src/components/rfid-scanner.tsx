'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';

type RFIDScannerProps = {
  onScan: (rfid: string) => void;
};

const mockRfids = [
    'rfid-tshirt-001',
    'rfid-jeans-002',
    'rfid-jacket-003',
    'rfid-socks-004',
    'rfid-cap-005',
];

export function RFIDScanner({ onScan }: RFIDScannerProps) {
  const [scanIndex, setScanIndex] = useState(0);

  const handleSimulatedScan = () => {
    const rfid = mockRfids[scanIndex];
    onScan(rfid);
    setScanIndex((prevIndex) => (prevIndex + 1) % mockRfids.length);
  };

  return (
    <Button onClick={handleSimulatedScan}>
      <ScanLine className="mr-2 h-4 w-4" />
      Scan Item
    </Button>
  );
}
