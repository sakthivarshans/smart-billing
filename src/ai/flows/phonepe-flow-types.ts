/**
 * @fileOverview Type definitions for the PhonePe payment flow.
 *
 * - PhonePePaymentInput - The input type for the payment flow.
 * - PhonePePaymentOutput - The return type for the payment flow.
 */
import { z } from 'zod';

export const PhonePePaymentInputSchema = z.object({
  amount: z.number().describe('The total amount of the transaction in paisa.'),
  merchantTransactionId: z.string().describe('A unique ID for the transaction.'),
  customerPhoneNumber: z.string().describe("The customer's 10-digit phone number."),
});
export type PhonePePaymentInput = z.infer<typeof PhonePePaymentInputSchema>;

export const PhonePePaymentOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  redirectUrl: z.string().optional().describe('The URL to redirect the user to for payment.'),
});
export type PhonePePaymentOutput = z.infer<typeof PhonePePaymentOutputSchema>;
