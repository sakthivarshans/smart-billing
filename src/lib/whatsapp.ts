'use client';

import type { BillItem } from '@/lib/store';

export function sendWhatsAppReceipt(number: string, items: BillItem[], total: number) {
  // In a real application, you would integrate with a WhatsApp API provider for automated messages.
  // For this demo, we will use the "click to chat" feature to open WhatsApp with a pre-filled message.
  
  const receiptHeader = "Thank you for shopping at ABC Clothings!\n\nHere is your receipt:\n\n";
  
  const itemLines = items.map(item => 
    `- ${item.name}: ₹${item.price.toFixed(2)}`
  ).join('\n');
  
  const receiptFooter = `\n\n----------------\n*Total: ₹${total.toFixed(2)}*\n----------------\n\nHave a great day!`;
  
  const message = encodeURIComponent(receiptHeader + itemLines + receiptFooter);
  
  // We use the international format for the phone number, assuming it's an Indian number.
  const whatsappUrl = `https://wa.me/91${number}?text=${message}`;

  // Open the WhatsApp link in a new tab.
  // This will prompt the user to open WhatsApp on their device.
  window.open(whatsappUrl, '_blank');

  // We can return a resolved promise to maintain compatibility with the calling component.
  return Promise.resolve();
}
