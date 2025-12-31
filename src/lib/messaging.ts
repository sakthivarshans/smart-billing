'use client';

import type { BillItem } from '@/lib/store';

export function sendWhatsAppReceipt(number: string, items: BillItem[], total: number) {
  // This function uses the `https://wa.me/` link to open WhatsApp with a pre-filled message.
  
  const receiptHeader = "Thanks for shopping at ABC Clothings!\n\nHere is your receipt:\n";
  
  const itemLines = items.map(item => 
    `- ${item.name}: Rs${item.price.toFixed(2)}`
  ).join('\n');
  
  const receiptFooter = `\n\n*Total: Rs${total.toFixed(2)}*\n\nHave a great day!`;
  
  const message = encodeURIComponent(receiptHeader + itemLines + receiptFooter);
  
  // Construct the WhatsApp "click to chat" URL.
  // Note: The phone number should be in international format without '+' or '00'. 
  // For this example, we'll assume a 10-digit Indian number and prefix it with 91.
  const whatsappUrl = `https://wa.me/91${number}?text=${message}`;

  // Open the WhatsApp link.
  window.open(whatsappUrl, '_blank');

  // We can return a resolved promise to maintain compatibility with the calling component.
  return Promise.resolve();
}
