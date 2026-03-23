'use server';
/**
 * @fileOverview An AI assistant for providing customer support via chatbot.
 *
 * - provideCustomerChatbotAssistance - A function that handles customer queries via a chatbot.
 * - CustomerChatbotAssistanceInput - The input type for the provideCustomerChatbotAssistance function.
 * - CustomerChatbotAssistanceOutput - The return type for the provideCustomerChatbotAssistance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CustomerChatbotAssistanceInputSchema = z
  .string()
  .describe('The customer\'s query for the AI chatbot.');
export type CustomerChatbotAssistanceInput = z.infer<
  typeof CustomerChatbotAssistanceInputSchema
>;

const CustomerChatbotAssistanceOutputSchema = z
  .string()
  .describe('The AI-generated response to the customer\'s query.');
export type CustomerChatbotAssistanceOutput = z.infer<
  typeof CustomerChatbotAssistanceOutputSchema
>;

export async function provideCustomerChatbotAssistance(
  input: CustomerChatbotAssistanceInput
): Promise<CustomerChatbotAssistanceOutput> {
  return customerChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerChatbotAssistancePrompt',
  input: { schema: CustomerChatbotAssistanceInputSchema },
  output: { schema: CustomerChatbotAssistanceOutputSchema },
  prompt: `You are a helpful customer service AI assistant for ComplaintCore AI. Your goal is to provide immediate, self-service assistance to customers regarding their complaints. Answer common questions and guide them towards self-resolution or provide information based on their query. If you cannot fully resolve the issue, offer to escalate to a live agent but try to help as much as possible first.

Customer's Query: {{{query}}}`,
});

const customerChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'customerChatbotAssistanceFlow',
    inputSchema: CustomerChatbotAssistanceInputSchema,
    outputSchema: CustomerChatbotAssistanceOutputSchema,
  },
  async (query) => {
    const { output } = await prompt({ query });
    return output!;
  }
);
