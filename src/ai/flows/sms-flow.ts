'use server';
/**
 * @fileOverview A flow to send an SMS using the Fast2SMS API.
 * 
 * - sendSms - Calls the Fast2SMS API to send a message.
 */
import { ai } from '@/ai/genkit';
import fetch from 'node-fetch';
import {
  SmsInputSchema,
  SmsOutputSchema,
  type SmsInput,
  type SmsOutput,
} from './sms-flow-types';
import 'dotenv/config';

export async function sendSms(input: SmsInput): Promise<SmsOutput> {
  return smsFlow(input);
}

const smsFlow = ai.defineFlow(
  {
    name: 'smsFlow',
    inputSchema: SmsInputSchema,
    outputSchema: SmsOutputSchema,
  },
  async (input) => {
    const apiKey = "2M1BjnSKlfQxzsdNJpmqH0hC4tyGiWPrXgFTukVLve3YO8aoE9FzkgbhLjetAUEcXvBw5a2NCorOyZTH";

    if (!apiKey) {
      throw new Error('Fast2SMS API key is not configured.');
    }

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': apiKey,
        },
        body: JSON.stringify({
          route: 'q',
          message: input.message,
          language: 'english',
          flash: 0,
          numbers: input.number,
        }),
      });

      const result = await response.json();

      if (result.return === true) {
        return {
          success: true,
          message: 'SMS sent successfully!',
        };
      } else {
        return {
          success: false,
          message: `Failed to send SMS: ${result.message || 'Unknown error from Fast2SMS'}`,
        };
      }
    } catch (error: any) {
      console.error('Fast2SMS API error:', error);
      return {
        success: false,
        message: `Failed to send SMS: ${error.message || 'Unknown error'}`,
      };
    }
  }
);
