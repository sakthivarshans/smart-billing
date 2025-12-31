/**
 * @fileOverview Type definitions for the Fast2SMS flow.
 *
 * - SmsInput - The input type for the SMS flow.
 * - SmsOutput - The return type for the SMS flow.
 */
import { z } from 'zod';

export const SmsInputSchema = z.object({
  message: z.string().describe('The content of the SMS message.'),
  number: z.string().describe('The recipient\'s 10-digit phone number.'),
});
export type SmsInput = z.infer<typeof SmsInputSchema>;

export const SmsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SmsOutput = z.infer<typeof SmsOutputSchema>;
