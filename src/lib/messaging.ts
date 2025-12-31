'use client';

import type { BillItem } from '@/lib/store';
import { sendSms } from '@/ai/flows/sms-flow';

export async function sendReceipt(number: string, items: BillItem[], total: number, paymentId: string) {
  const billNumber = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  
  const receiptHeader = 
`ABC CLOTHINGS
GSTIN: 27ABCDE1234F1Z5
INVOICE

Bill No: ${billNumber}
Date: ${now.toLocaleDateString()}
Time: ${now.toLocaleTimeString()}
Payment ID: ${paymentId.replace('pay_', '')}
---------------------
`;

  const itemLines = items.map(item => 
    `${item.name.padEnd(15)} Rs${item.price.toFixed(2)}`
  ).join('\n');
  
  const receiptFooter = 
`---------------------
TOTAL: Rs${total.toFixed(2)}

Thank You!
Visit Again!
`;
  
  const message = receiptHeader + itemLines + receiptFooter;

  try {
    const result = await sendSms({
        message,
        number,
    });

    if (!result.success) {
        throw new Error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error;
  }
}
