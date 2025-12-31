'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScanLine, Usb, XCircle } from 'lucide-react';

type RFIDScannerProps = {
  onScan: (rfid: string) => void;
};

export function RFIDScanner({ onScan }: RFIDScannerProps) {
  const { toast } = useToast();
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<string> | null>(null);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (reader) {
        reader.cancel();
        setIsReading(false);
      }
      if (port && port.readable) {
        port.close();
      }
    };
  }, [reader, port]);

  async function connectToSerial() {
    if (!('serial' in navigator)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'The Web Serial API is not supported in this browser. Please use Chrome or Edge.',
      });
      return;
    }

    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 9600 });
      setPort(serialPort);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
      const newReader = textDecoder.readable.getReader();
      setReader(newReader);
      setIsReading(true);

      toast({
        title: 'Scanner Connected',
        description: 'RFID scanner is ready.',
      });

      // Listen for data from the port
      while (true) {
        const { value, done } = await newReader.read();
        if (done) {
          newReader.releaseLock();
          break;
        }
        if (value) {
          onScan(value);
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error.message || 'Could not connect to the serial device.',
      });
    }
  }

  async function disconnectFromSerial() {
    if (reader) {
      try {
        await reader.cancel();
      } catch (error) {
        // Ignore cancel error
      } finally {
        setReader(null);
        setIsReading(false);
      }
    }
    if (port) {
        try {
            if (port.readable) {
                // The port might have been closed by the device being unplugged.
                await port.close();
            }
        } catch (error) {
            // Ignore close error
        } finally {
            setPort(null);
            toast({
                title: 'Scanner Disconnected',
            });
        }
    }
  }

  return (
    <div>
      {!port ? (
        <Button onClick={connectToSerial}>
          <Usb className="mr-2 h-4 w-4" />
          Connect Scanner
        </Button>
      ) : (
        <Button onClick={disconnectFromSerial} variant="outline">
          {isReading ? 
            <ScanLine className="mr-2 h-4 w-4 animate-pulse" /> : 
            <XCircle className="mr-2 h-4 w-4" />}
          {isReading ? 'Scanner Active' : 'Disconnect'}
        </Button>
      )}
    </div>
  );
}
