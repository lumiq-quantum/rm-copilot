'use server';

/**
 * @fileOverview Generates charts from customer data based on user questions.
 *
 * - generateCharts - A function that generates charts from customer data.
 * - GenerateChartsInput - The input type for the generateCharts function.
 * - GenerateChartsOutput - The return type for the generateCharts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartsInputSchema = z.object({
  customerData: z
    .string()
    .describe('The customer data to visualize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'),
  question: z.string().describe('The question asked by the relationship manager.'),
});
export type GenerateChartsInput = z.infer<typeof GenerateChartsInputSchema>;

const GenerateChartsOutputSchema = z.object({
  chart: z.object({
    url: z.string().describe('The URL of the generated chart image.'),
    altText: z.string().describe('Alt text describing the chart.'),
  }).optional(),
  reasoning: z.string().describe('The reasoning behind the chart generation.'),
});
export type GenerateChartsOutput = z.infer<typeof GenerateChartsOutputSchema>;

export async function generateCharts(input: GenerateChartsInput): Promise<GenerateChartsOutput> {
  return generateChartsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartsPrompt',
  input: {schema: GenerateChartsInputSchema},
  output: {schema: GenerateChartsOutputSchema},
  prompt: `You are an AI assistant specializing in data visualization. A relationship manager has asked a question about customer data. You should generate a chart based on the question and data provided. Explain the reasoning for generating chart.

Question: {{{question}}}
Customer Data: {{media url=customerData}}

Consider these chart types:
- Bar chart: To compare values across different categories.
- Line chart: To show trends over time.
- Pie chart: To show proportions of different categories.

Output the chart in the form of base64 image or if you can't generate chart then return empty chart url with alt text explaining that chart can't be generated.
Reasoning should describe steps you took to answer relationship manager question.
`,
});

const generateChartsFlow = ai.defineFlow(
  {
    name: 'generateChartsFlow',
    inputSchema: GenerateChartsInputSchema,
    outputSchema: GenerateChartsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output?.chart?.url) {
      return output;
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.customerData}},
        {text: input.question + ". Generate a chart based on the customer data."}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {
      chart: {
        url: media.url,
        altText: 'Generated chart based on customer data.',
      },
      reasoning: output?.reasoning || 'Generated chart based on customer data visualization.',
    };
  }
);
