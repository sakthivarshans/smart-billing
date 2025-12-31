'use server';
/**
 * @fileOverview A flow to create a Razorpay order.
 *
 * - initiateRazorpayOrder - Calls the Razorpay API to create an order.
 */
import { ai } from '@/ai/genkit';
import { 
  RazorpayOrderInputSchema, 
  RazorpayOrderOutputSchema,
  type RazorpayOrderInput,
  type RazorpayOrderOutput,
} from './razorpay-flow-types';
import Razorpay from 'razorpay';
import 'dotenv/config';


export async function initiateRazorpayOrder(input: RazorpayOrderInput): Promise<RazorpayOrderOutput> {
  return razorpayOrderFlow(input);
}

const razorpayOrderFlow = ai.defineFlow(
  {
    name: 'razorpayOrderFlow',
    inputSchema: RazorpayOrderInputSchema,
    outputSchema: RazorpayOrderOutputSchema,
  },
  async (input) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay Key ID or Key Secret is not configured in environment variables.');
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: input.amount,
        currency: 'INR',
        receipt: input.merchantTransactionId,
      };
      
      const order = await razorpay.orders.create(options);

      if (!order) {
        return {
            success: false,
            message: 'Failed to create Razorpay order: No order returned.',
        };
      }
      
      return {
        success: true,
        message: 'Razorpay order created successfully.',
        orderId: order.id,
      };
    } catch (error: any) {
        console.error('Razorpay API error:', error);
        return {
            success: false,
            message: `Failed to create Razorpay order: ${error.message || 'Unknown error'}`,
        };
    }
  }
);
