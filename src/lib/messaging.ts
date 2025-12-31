'use client';

import type { BillItem } from '@/lib/store';

export function sendSmsReceipt(number: string, items: BillItem[], total: number) {
  // This function uses the `sms:` URI scheme to open the user's default messaging app.
  // The message body length is limited, so we keep it concise.
  
  const receiptHeader = "Thanks for shopping at ABC Clothings!\n\nReceipt:\n";
  
  const itemLines = items.map(item => 
    `- ${item.name}: Rs${item.price.toFixed(2)}`
  ).join('\n');
  
  const receiptFooter = `\n\nTotal: Rs${total.toFixed(2)}\n\nHave a great day!`;
  
  // The body of the SMS has different encoding rules and length limits depending on the OS.
  // We use encodeURIComponent which is a safe bet for most cases.
  const message = encodeURIComponent(receiptHeader + itemLines + receiptFooter);
  
  // Character to use depends on OS. '?' for iOS, '&' for Android.
  // However, modern OSes are often smart enough to handle this.
  // We will use '?' as it is more common.
  const smsUrl = `sms:${number}?body=${message}`;

  // Open the SMS link. This will prompt the user to open their default messaging app.
  window.open(smsUrl, '_blank');

  // We can return a resolved promise to maintain compatibility with the calling component.
  return Promise.resolve();
}
