'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/lib/store';
import { sendSmsReceipt } from '@/lib/messaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiatePhonePePayment } from '@/ai/flows/phonepe-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function PaymentClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { total, items, phoneNumber, resetBill } = useBillStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const qrCodePlaceholder = PlaceHolderImages.find(img => img.id === 'qr-code');


  useEffect(() => {
    if (total === 0) {
      router.push('/');
      return;
    }

    const startPayment = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await initiatePhonePePayment({
          amount: total,
          merchantTransactionId: `TXN_${Date.now()}`,
          customerPhoneNumber: phoneNumber,
        });

        if (result.success && result.redirectUrl) {
          // In a real scenario, you'd redirect the user to this URL.
          // For simulation, we'll just confirm we received it and enable the success button.
          console.log('PhonePe Redirect URL:', result.redirectUrl);
          setPaymentUrl(result.redirectUrl);
        } else {
          throw new Error(result.message || 'Failed to initiate payment.');
        }
      } catch (err: any) {
        console.error("Failed to initiate payment:", err);
        setError(err.message || 'Could not connect to payment gateway.');
        toast({
          variant: "destructive",
          title: "Payment Gateway Error",
          description: "Could not initiate the payment process.",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    startPayment();
  }, [total, phoneNumber, router, toast]);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      await sendSmsReceipt(phoneNumber, items, total);

      toast({
        title: "Payment Successful!",
        description: "Your messaging app should open with the receipt.",
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
  
  const content = () => {
      if (isProcessing && !paymentUrl) {
          return (
              <div className="flex flex-col items-center gap-4 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Connecting to PhonePe...</p>
              </div>
          )
      }

      if (error) {
          return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>
                    {error} Please try returning to the previous page.
                </AlertDescription>
            </Alert>
          )
      }
      
      if(paymentUrl && qrCodePlaceholder) {
          return (
            <div className="flex flex-col items-center gap-4 text-center">
                <p className="font-medium">Scan to Pay</p>
                <div className="p-2 border-4 border-primary rounded-lg">
                    <Image 
                        src={qrCodePlaceholder.imageUrl}
                        alt={qrCodePlaceholder.description}
                        width={150}
                        height={150}
                        data-ai-hint={qrCodePlaceholder.imageHint}
                        className="rounded-sm"
                    />
                </div>
                <p className="text-muted-foreground text-sm">
                    After scanning, click below to simulate a successful payment.
                </p>
            </div>
          )
      }
      
      return null;
  }


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
        <CardContent className="flex flex-col items-center gap-4 min-h-[280px] justify-center">
            {content()}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handlePaymentSuccess}
            disabled={isProcessing || !paymentUrl}
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
