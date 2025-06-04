// src/ai/flows/restocking-suggestion.ts
'use server';

/**
 * @fileOverview A restocking suggestion AI agent.
 *
 * - suggestRestockLevels - A function that suggests restocking levels based on recent sales data.
 * - SuggestRestockLevelsInput - The input type for the suggestRestockLevels function.
 * - SuggestRestockLevelsOutput - The return type for the suggestRestockLevels function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRestockLevelsInputSchema = z.object({
  recentSalesData: z
    .string()
    .describe('A stringified JSON array containing the recent sales data, including item names and quantities sold.'),
});
export type SuggestRestockLevelsInput = z.infer<typeof SuggestRestockLevelsInputSchema>;

const SuggestRestockLevelsOutputSchema = z.object({
  restockSuggestions: z
    .string()
    .describe('A stringified JSON array containing the suggested restock levels for each item.'),
});
export type SuggestRestockLevelsOutput = z.infer<typeof SuggestRestockLevelsOutputSchema>;

export async function suggestRestockLevels(input: SuggestRestockLevelsInput): Promise<SuggestRestockLevelsOutput> {
  return suggestRestockLevelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRestockLevelsPrompt',
  input: {schema: SuggestRestockLevelsInputSchema},
  output: {schema: SuggestRestockLevelsOutputSchema},
  prompt: `You are an inventory management expert for a grocery store. Analyze the recent sales data and provide restocking suggestions.

Recent Sales Data:
{{{recentSalesData}}}

Based on this data, suggest reasonable restocking levels for each item. Respond with a JSON array of objects, each containing the item name and suggested restock quantity. Make sure the response is parseable by JSON.parse.
`,
});

const suggestRestockLevelsFlow = ai.defineFlow(
  {
    name: 'suggestRestockLevelsFlow',
    inputSchema: SuggestRestockLevelsInputSchema,
    outputSchema: SuggestRestockLevelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
