import type { BillItem } from '@/lib/store';

export function sendWhatsAppReceipt(number: string, items: BillItem[], total: number) {
  // This is a placeholder function.
  // In a real application, you would integrate with a WhatsApp API provider.
  console.log(`Sending WhatsApp receipt to: ${number}`);
  console.log('--- Receipt ---');
  items.forEach(item => {
    console.log(`${item.name}: ₹${item.price.toFixed(2)}`);
  });
  console.log('----------------');
  console.log(`Total: ₹${total.toFixed(2)}`);
  console.log('--- End of Receipt ---');
  
  // You can add a delay here to simulate sending
  return new Promise(resolve => setTimeout(resolve, 1000));
}
