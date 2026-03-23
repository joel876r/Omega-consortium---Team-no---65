'use server';
/**
 * @fileOverview A Genkit flow for generating agent response suggestions based on customer complaint history and current ticket context.
 *
 * - generateAgentResponseSuggestions - A function that handles the generation of response suggestions.
 * - GenerateAgentResponseSuggestionsInput - The input type for the generateAgentResponseSuggestions function.
 * - GenerateAgentResponseSuggestionsOutput - The return type for the generateAgentResponseSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentResponseSuggestionsInputSchema = z.object({
  customerComplaintHistory: z
    .string()
    .describe("A summary or list of the customer's past complaint history."),
  currentTicketContext: z
    .string()
    .describe(
      'The current ticket\s context, including the complaint description and any prior agent/customer interactions.'
    ),
});
export type GenerateAgentResponseSuggestionsInput = z.infer<
  typeof GenerateAgentResponseSuggestionsInputSchema
>;

const GenerateAgentResponseSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested responses for the agent to use.'),
});
export type GenerateAgentResponseSuggestionsOutput = z.infer<
  typeof GenerateAgentResponseSuggestionsOutputSchema
>;

export async function generateAgentResponseSuggestions(
  input: GenerateAgentResponseSuggestionsInput
): Promise<GenerateAgentResponseSuggestionsOutput> {
  return generateAgentResponseSuggestionsFlow(input);
}

const generateAgentResponseSuggestionsPrompt = ai.definePrompt({
  name: 'generateAgentResponseSuggestionsPrompt',
  input: {schema: GenerateAgentResponseSuggestionsInputSchema},
  output: {schema: GenerateAgentResponseSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to help customer service agents provide quick and consistent responses.
Based on the customer's complaint history and the current ticket context, provide a list of 3-5 concise and relevant response suggestions that an agent can use.
The suggestions should be professional and address the customer's issue.

Customer Complaint History:
{{{customerComplaintHistory}}}

Current Ticket Context:
{{{currentTicketContext}}}

Please provide only the suggestions in a JSON array format matching the output schema.`,
});

const generateAgentResponseSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateAgentResponseSuggestionsFlow',
    inputSchema: GenerateAgentResponseSuggestionsInputSchema,
    outputSchema: GenerateAgentResponseSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await generateAgentResponseSuggestionsPrompt(input);
    return output!;
  }
);
