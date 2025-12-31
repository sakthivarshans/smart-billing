
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore, useAdminStore } from '@/lib/store';
import { createWhatsAppMessage } from '@/lib/messaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CheckCircle, Loader2, AlertTriangle, CreditCard, Send, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiateRazorpayOrder } from '@/ai/flows/razorpay-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}


export function PaymentClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { total, items, phoneNumber, resetBill } = useBillStore();
  const { storeDetails, apiKeys } = useAdminStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);


  const handlePaymentSuccess = async (response: any) => {
    console.log('Razorpay success response:', response);
    setIsProcessing(false);
    toast({
      title: "Payment Successful!",
      description: "You can now download the invoice or send the receipt.",
      action: <CheckCircle className="text-green-500" />,
    });
    setPaymentId(response.razorpay_payment_id);
    setPaymentDone(true);
  };

  const openRazorpayCheckout = (orderId: string) => {
    const razorpayKeyId = apiKeys.razorpayKeyId; 

    const options = {
      key: razorpayKeyId,
      amount: Math.round(total * 100),
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
      modal: {
        ondismiss: () => {
            setIsProcessing(false);
            toast({
                variant: "destructive",
                title: "Payment Cancelled",
                description: "The payment process was not completed.",
            });
        }
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

    if (!window.Razorpay) {
        toast({
            variant: "destructive",
            title: "Razorpay SDK not loaded",
            description: "Please check your internet connection and try again.",
        });
        setIsProcessing(false);
        return;
    }
    
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response);
        setIsProcessing(false);
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: response.error.description || "Your payment was not successful.",
        });
        setError("Payment failed. Please try again.");
    });
    rzp.open();
  };
  
  const handlePayAction = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await initiateRazorpayOrder({
        amount: Math.round(total * 100), // Razorpay expects amount in paisa
        merchantTransactionId: `TXN_${Date.now()}`,
        keyId: apiKeys.razorpayKeyId,
        keySecret: apiKeys.razorpayKeySecret,
      });

      if (result.success && result.orderId) {
        openRazorpayCheckout(result.orderId);
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
      setIsProcessing(false);
    }
  }

  const handleSendReceipt = () => {
    if (paymentId) {
      const whatsappUrl = createWhatsAppMessage(phoneNumber, items, total, paymentId);
      window.open(whatsappUrl, '_blank');
      resetBill();
      router.push('/');
    }
  };

  const generateAndDownloadPDF = () => {
    if (!paymentId) return;
  
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const billNumber = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();

    // Header
    doc.setFontSize(20);
    doc.text(storeDetails.storeName, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(storeDetails.address, 105, 28, { align: 'center' });
    doc.text(`GSTIN: ${storeDetails.gstin}`, 105, 34, { align: 'center' });
    doc.text(`Phone: ${storeDetails.phoneNumber}`, 105, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.text('INVOICE', 105, 50, { align: 'center' });
    
    // Bill Details
    doc.setFontSize(10);
    doc.text(`Bill No: ${billNumber}`, 14, 60);
    doc.text(`Date: ${now.toLocaleDateString()}`, 14, 65);
    doc.text(`Time: ${now.toLocaleTimeString()}`, 14, 70);
    doc.text(`Payment ID: ${paymentId.replace('pay_', '')}`, 14, 75);
    
    // Table
    const tableColumn = ["S.No", "Item Name", "Price (INR)"];
    const tableRows: (string | number)[][] = [];
  
    items.forEach(item => {
      const itemData = [
        item.id,
        item.name,
        item.price.toFixed(2),
      ];
      tableRows.push(itemData);
    });
  
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'striped',
        headStyles: { fillColor: [63, 0, 127] }
    });

    const finalY = doc.autoTable.previous.finalY;
  
    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: Rs ${total.toFixed(2)}`, 14, finalY + 15);
  
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank You! Visit Again!", 105, finalY + 25, { align: 'center' });
    
    doc.save(`invoice-${billNumber}.pdf`);
    resetBill();
    router.push('/');
  }

  useEffect(() => {
    if (total === 0 && !paymentDone) {
      router.push('/');
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, router, paymentDone]);
  
  const content = () => {
      if (isProcessing && !paymentDone) {
          return (
              <div className="flex flex-col items-center gap-4 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Connecting to Razorpay...</p>
              </div>
          )
      }

      if (error) {
          return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>
                    {error} Please try again.
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
                  You can now download the invoice or send the receipt to the customer.
              </p>
          </div>
        )
      }
      
      return (
        <div className="flex flex-col items-center gap-4 text-center">
            <CreditCard size={64} className="text-primary"/>
            <p className="font-medium text-lg">Your bill is ready.</p>
            <p className="text-muted-foreground text-sm">
                Click the button below to open the secure payment page.
            </p>
        </div>
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
        <CardFooter className="flex flex-col gap-2">
            {!paymentDone ? (
                <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handlePayAction}
                    disabled={isProcessing || !apiKeys.razorpayKeyId || !apiKeys.razorpayKeySecret}
                >
                    {isProcessing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing...</>
                    ) : (
                        <><CreditCard className="mr-2 h-4 w-4" /> Pay with Razorpay</>
                    )}
                </Button>
            ) : (
                <>
                    <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={generateAndDownloadPDF}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button 
                        className="w-full" 
                        size="lg" 
                        variant="secondary"
                        onClick={handleSendReceipt}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send via WhatsApp
                    </Button>
                </>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}

    
