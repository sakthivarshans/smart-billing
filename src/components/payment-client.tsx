'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore } from '@/lib/store';
import { createWhatsAppMessage } from '@/lib/messaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CheckCircle, Loader2, AlertTriangle, CreditCard, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiateRazorpayOrder } from '@/ai/flows/razorpay-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function PaymentClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { total, items, phoneNumber, resetBill } = useBillStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);


  const handlePaymentSuccess = async (response: any) => {
    console.log('Razorpay success response:', response);
    toast({
      title: "Payment Successful!",
      description: "Redirecting to WhatsApp to send the receipt.",
      action: <CheckCircle className="text-green-500" />,
    });
    setPaymentId(response.razorpay_payment_id);
    setPaymentDone(true);
  };

  const openRazorpayCheckout = (orderId: string) => {
    const razorpayKeyId = 'rzp_test_RyETUyYsV3wYnQ'; 

    const options = {
      key: razorpayKeyId,
      amount: total * 100,
      currency: "INR",
      name: "ABC Clothings",
      description: "Smart Bill Payment",
      order_id: orderId,
      handler: handlePaymentSuccess,
      prefill: {
        contact: phoneNumber,
        method: "upi",
      },
      notes: {
        address: "ABC Clothings Store",
      },
      theme: {
        color: "#3f007f",
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay with UPI',
              instruments: [
                {
                    method: 'upi'
                },
                {
                    method: 'qr'
                },
              ],
            },
          },
          sequence: ['block.upi'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response);
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: response.error.description || "Your payment was not successful.",
        });
        setError("Payment failed. Please try again.");
    });
    rzp.open();
  };
  
  const handlePayAction = () => {
    if (orderId) {
      openRazorpayCheckout(orderId);
    }
  }


  useEffect(() => {
    if (total === 0 && !paymentDone) {
      router.push('/');
      return;
    }

    const createOrder = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await initiateRazorpayOrder({
          amount: Math.round(total * 100), // Razorpay expects amount in paisa
          merchantTransactionId: `TXN_${Date.now()}`,
        });

        if (result.success && result.orderId) {
          setOrderId(result.orderId);
        } else {
          throw new Error(result.message || 'Failed to create Razorpay order.');
        }
      } catch (err: any) {
        console.error("Failed to create order:", err);
        setError(err.message || 'Could not connect to payment gateway.');
        toast({
          variant: "destructive",
          title: "Payment Gateway Error",
          description: err.message || "Could not initiate the payment process.",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    if (total > 0) {
        createOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, router]);

  useEffect(() => {
    if (paymentDone && paymentId) {
      const whatsappUrl = createWhatsAppMessage(phoneNumber, items, total, paymentId);
      window.open(whatsappUrl, '_blank');
      resetBill();
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDone, paymentId]);
  
  const content = () => {
      if (isProcessing && !orderId) {
          return (
              <div className="flex flex-col items-center gap-4 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Contacting Payment Gateway...</p>
              </div>
          )
      }

      if (error) {
          return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          )
      }
      
      if (paymentDone) {
        return (
          <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle size={64} className="text-green-500"/>
              <p className="font-medium text-lg">Payment Successful!</p>
              <p className="text-muted-foreground text-sm">
                  Redirecting to WhatsApp...
              </p>
          </div>
        )
      }
      
      if(orderId) {
          return (
            <div className="flex flex-col items-center gap-4 text-center">
                <CreditCard size={64} className="text-primary"/>
                <p className="font-medium text-lg">Your order is ready.</p>
                <p className="text-muted-foreground text-sm">
                    Click the button below to open the secure payment page.
                </p>
            </div>
          )
      }
      
      return null;
  }
  
  const getButtonContent = () => {
      if (paymentDone) {
          return (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
          )
      }
      if (isProcessing && !orderId) {
          return (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
              </>
          )
      }
      return (
        <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Razorpay
        </>
      )
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
        <CardContent className="flex flex-col items-center gap-4 min-h-[200px] justify-center">
            {content()}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handlePayAction}
            disabled={isProcessing || !orderId || paymentDone}
          >
            {getButtonContent()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
