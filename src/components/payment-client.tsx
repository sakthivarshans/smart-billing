'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/lib/store';
import { sendWhatsAppReceipt } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentClientProps = {
  qrCodeImageUrl: string;
};

export function PaymentClient({ qrCodeImageUrl }: PaymentClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { total, items, whatsappNumber, resetBill } = useBillStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async () => {
    if (total === 0) {
        router.push('/');
        return;
    }
    
    setIsProcessing(true);
    try {
      await sendWhatsAppReceipt(whatsappNumber, items, total);

      toast({
        title: "Payment Successful!",
        description: "A receipt has been sent via WhatsApp.",
        action: <CheckCircle className="text-green-500" />,
      });
      
      resetBill();
      
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error("Payment processing failed:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Could not process payment. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-sm text-center shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
          <CardDescription>
            Total Amount Due
          </CardDescription>
          <div className="text-5xl font-bold text-primary pt-2 flex items-center justify-center">
            <IndianRupee size={40} className="mr-1" />
            {total.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="p-2 bg-white rounded-lg">
                <Image
                    src={qrCodeImageUrl}
                    alt="Payment QR Code"
                    width={250}
                    height={250}
                    data-ai-hint="qr code"
                    className="rounded-md"
                    priority
                />
            </div>
          <p className="text-muted-foreground text-sm font-medium">
            Scan and Pay using PhonePe / UPI
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handlePaymentSuccess}
            disabled={isProcessing}
          >
            {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? 'Processing...' : 'Simulate Successful Payment'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
