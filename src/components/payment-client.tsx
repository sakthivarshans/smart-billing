
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBillStore, useAdminStore, useApiKeys } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, CheckCircle, Loader2, AlertTriangle, CreditCard, Send, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiateRazorpayOrder } from '@/ai/flows/razorpay-flow';
import { sendWhatsAppPdf } from '@/ai/flows/whatsapp-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { BillItem } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

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
  const { storeDetails, addSale } = useAdminStore();
  const initialApiKeys = useApiKeys(); // Gets keys on initial render
  const getApiKeys = useAdminStore((state) => state.getApiKeys);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  
  // State to hold the API keys, which will be updated on the client
  const [apiKeys, setApiKeys] = useState(initialApiKeys);

  // Price breakup calculation
  const subtotal = total / 1.18; // Assuming 18% GST
  const gstAmount = total - subtotal;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // It fetches the latest API keys from localStorage via the store.
    setApiKeys(getApiKeys());
  }, [getApiKeys]);


  const handlePaymentSuccess = async (response: any) => {
    console.log('Razorpay success response:', response);
    
    // Record the sale
    addSale({
      id: response.razorpay_payment_id || uuidv4(),
      items,
      total,
      phoneNumber,
      date: new Date().toISOString(),
      paymentResponse: response,
      status: 'success',
    });
    
    setIsProcessing(false);
    toast({
      title: "Payment Successful!",
      description: "You can now send the receipt.",
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
        
        addSale({
            id: response.error?.metadata?.payment_id || uuidv4(),
            items,
            total,
            phoneNumber,
            date: new Date().toISOString(),
            paymentResponse: response,
            status: 'failure',
        });
        
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
      if (!apiKeys.razorpayKeyId || !apiKeys.razorpayKeySecret) {
        throw new Error("Razorpay Key ID or Key Secret is not configured in the admin dashboard.");
      }
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

  const generatePDF = (): string => {
    if (!paymentId) throw new Error("Payment ID is not available.");
  
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const billNumber = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(storeDetails.storeName, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(storeDetails.address, 105, 28, { align: 'center' });
    doc.text(`GSTIN: ${storeDetails.gstin} | Phone: ${storeDetails.phoneNumber}`, 105, 34, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 105, 50, { align: 'center' });
    
    // Bill Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${billNumber}`, 14, 60);
    doc.text(`Date: ${now.toLocaleDateString()}`, 14, 65);
    doc.text(`Time: ${now.toLocaleTimeString()}`, 14, 70);

    doc.text(`Payment ID: ${paymentId.replace('pay_', '')}`, 196, 60, { align: 'right' });
    doc.text(`Customer: ${phoneNumber}`, 196, 65, { align: 'right' });
    
    // Table
    const tableColumn = ["S.No", "Item Name", "Grams/Size", "Price (INR)"];
    const tableRows: (string | number)[][] = [];
  
    items.forEach(item => {
      const itemData = [
        item.id,
        item.name,
        item.optional1 || '',
        item.price.toFixed(2),
      ];
      tableRows.push(itemData);
    });
  
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: 'striped',
        headStyles: { fillColor: [63, 0, 127] },
        styles: {
            halign: 'left',
        },
        columnStyles: {
            3: { halign: 'right' },
        }
    });

    const finalY = doc.autoTable.previous.finalY;
  
    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: Rs ${total.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
  
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text("Thank You! Visit Again!", 105, finalY + 30, { align: 'center' });
    
    // Returns the base64 string without the data URI prefix
    return doc.output('datauristring').split(',')[1];
  };

  const handleSendReceipt = async () => {
    if (!paymentId) return;

    setIsSending(true);
    try {
        const pdfBase64 = generatePDF();
        const billNumber = Math.floor(100000 + Math.random() * 900000);
        
        const receiptCaption = 
`*${storeDetails.storeName}*
Thank you for your purchase!
Here is your invoice (Bill No: *${billNumber}*).
Payment ID: _${paymentId.replace('pay_', '')}_
Total: *Rs${total.toFixed(2)}*
Thank you! Visit Again!
`;

        const result = await sendWhatsAppPdf({
            to: phoneNumber,
            pdfBase64,
            filename: `invoice-${billNumber}.pdf`,
            caption: receiptCaption,
            whatsappApiKey: apiKeys.whatsappApiKey,
        });

        if (result.success) {
            toast({
                title: 'Receipt Sent!',
                description: 'The invoice has been sent via WhatsApp.',
            });
            resetBillAndReturn();
        } else {
            throw new Error(result.message);
        }

    } catch (err: any) {
        console.error("Failed to send receipt:", err);
        toast({
            variant: "destructive",
            title: "Failed to Send Receipt",
            description: err.message || "Could not send the message. Please ensure the API key is correct and the service is running.",
        });
    } finally {
        setIsSending(false);
    }
  };


  const resetBillAndReturn = () => {
    resetBill();
    router.push('/billing');
  }

  useEffect(() => {
    if (total === 0 && !paymentDone) {
      router.push('/billing');
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
                  You can now send the receipt to the customer.
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
            Review your bill summary below
          </CardDescription>
          <div className="space-y-2 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium flex items-center">
                <IndianRupee size={12} className="mr-1" />{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SGST (9%)</span>
              <span className="font-medium flex items-center">
                <IndianRupee size={12} className="mr-1" />{sgst.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGST (9%)</span>
              <span className="font-medium flex items-center">
                <IndianRupee size={12} className="mr-1" />{cgst.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-4xl font-bold text-primary pt-4 flex items-center justify-center border-t mt-4">
            <IndianRupee size={32} className="mr-1" />
            {total.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 min-h-[150px] justify-center">
            {content()}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            {!paymentDone ? (
                <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handlePayAction}
                    disabled={isProcessing || !apiKeys.razorpayKeyId}
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
                        onClick={handleSendReceipt}
                        disabled={isSending || !apiKeys.whatsappApiKey}
                    >
                        {isSending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                        ) : (
                           <><Send className="mr-2 h-4 w-4" /> Send via WhatsApp</>
                        )}
                    </Button>
                    <Button
                        className="w-full"
                        variant="link"
                        onClick={resetBillAndReturn}
                    >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Skip
                    </Button>
                </>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
