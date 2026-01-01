/**
 * @fileOverview Type definitions for the WhatsApp messaging flow.
 */
import { z } from 'zod';

export const WhatsAppMessageInputSchema = z.object({
  to: z.string().describe("The recipient's phone number."),
  pdfBase64: z.string().describe("The base64 encoded PDF string."),
  filename: z.string().describe("The desired filename for the PDF."),
  caption: z.string().describe("The caption for the PDF document."),
  whatsappApiKey: z.string().describe("The WhatsApp Business API Key."),
});
export type WhatsAppMessageInput = z.infer<typeof WhatsAppMessageInputSchema>;

export const WhatsAppMessageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type WhatsAppMessageOutput = z.infer<typeof WhatsAppMessageOutputSchema>;
