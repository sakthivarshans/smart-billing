/**
 * @fileOverview Type definitions for the WhatsApp messaging flow.
 */
import { z } from 'zod';

export const WhatsAppMessageInputSchema = z.object({
  to: z.string().describe("The recipient's phone number."),
  pdfBase64: z.string().describe("The base64 encoded PDF string."),
  filename: z.string().describe("The desired filename for the PDF."),
  message: z.string().describe("The caption to be sent with the PDF."),
  whatsappApiKey: z.string().describe("The WhatsApp Gateway API Key."),
});
export type WhatsAppMessageInput = z.infer<typeof WhatsAppMessageInputSchema>;

export const WhatsAppMessageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type WhatsAppMessageOutput = z.infer<typeof WhatsAppMessageOutputSchema>;
