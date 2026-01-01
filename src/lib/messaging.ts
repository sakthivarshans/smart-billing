'use client';

import type { BillItem } from '@/lib/store';
import { useAdminStore } from '@/lib/store';

export function createWhatsAppMessage(number: string, items: BillItem[], total: number, paymentId: string): string {
  const { storeDetails } = useAdminStore.getState();
  const billNumber = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  
  const receiptHeader = 
`*${storeDetails.storeName}*
Thank you for your purchase!

Here is a summary of your bill:
Bill No: *${billNumber}*
Payment ID: _${paymentId.replace('pay_', '')}_
Total: *Rs${total.toFixed(2)}*
-------------------------------------
`;
  
  const receiptFooter = 
`
You can get a detailed PDF invoice from the cashier.

Thank you! Visit Again!
`;
  
  // NOTE: Attaching a PDF directly is not possible with web `wa.me` links.
  // A backend with the WhatsApp Business API is required for that functionality.
  const message = receiptHeader + receiptFooter;
  
  const internationalNumber = `91${number}`;
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${internationalNumber}?text=${encodedMessage}`;
}
