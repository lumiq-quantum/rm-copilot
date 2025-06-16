'use server';
/**
 * @fileOverview Summarizes a customer's financial information and interaction history.
 *
 * - customerSummary - A function that summarizes customer information.
 * - CustomerSummaryInput - The input type for the customerSummary function.
 * - CustomerSummaryOutput - The return type for the customerSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerSummaryInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer to summarize.'),
});
export type CustomerSummaryInput = z.infer<typeof CustomerSummaryInputSchema>;

const CustomerSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the customer’s financial information and interaction history.'),
});
export type CustomerSummaryOutput = z.infer<typeof CustomerSummaryOutputSchema>;

export async function customerSummary(input: CustomerSummaryInput): Promise<CustomerSummaryOutput> {
  return customerSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerSummaryPrompt',
  input: {schema: CustomerSummaryInputSchema},
  output: {schema: CustomerSummaryOutputSchema},
  prompt: `You are an expert financial analyst. Summarize the financial information and interaction history for customer ID {{{customerId}}}. Focus on key details relevant to a relationship manager starting a new conversation.`,
});

const customerSummaryFlow = ai.defineFlow(
  {
    name: 'customerSummaryFlow',
    inputSchema: CustomerSummaryInputSchema,
    outputSchema: CustomerSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
