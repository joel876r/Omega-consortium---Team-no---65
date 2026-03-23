'use server';
/**
 * @fileOverview This file implements a Genkit flow for suggesting the best agent
 * for an incoming support ticket based on its characteristics and agent availability.
 *
 * - suggestAgentAssignment - The main function to call for agent assignment suggestions.
 * - SuggestAgentAssignmentInput - The input type for the suggestAgentAssignment function.
 * - SuggestAgentAssignmentOutput - The return type for the suggestAgentAssignment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Mocks fetching a list of available agents with their skills and current workload.
 * In a real application, this would query a database or an agent management system.
 */
const getAvailableAgents = ai.defineTool(
  {
    name: 'getAvailableAgents',
    description: 'Returns a list of currently available agents, their skills, and current workload.',
    inputSchema: z.object({
      filterByCategory: z.string().optional().describe('Optional: Filter agents by a specific skill category.'),
    }),
    outputSchema: z.array(
      z.object({
        agentId: z.string().describe('Unique identifier for the agent.'),
        name: z.string().describe('The name of the agent.'),
        skills: z.array(z.string()).describe('A list of skills the agent possesses (e.g., "Technical Support", "Billing", "Refunds").'),
        currentLoad: z.number().describe('The number of active tickets currently assigned to the agent.'),
        availabilityStatus: z.enum(['Available', 'Busy', 'Offline']).describe('The current availability status of the agent.'),
      })
    ),
  },
  async (input) => {
    // Simulate fetching agents from a backend system
    const allAgents = [
      { agentId: 'agent1', name: 'Alice Smith', skills: ['Technical Support', 'Software Issues'], currentLoad: 2, availabilityStatus: 'Available' as const },
      { agentId: 'agent2', name: 'Bob Johnson', skills: ['Billing', 'Account Management', 'Refunds'], currentLoad: 1, availabilityStatus: 'Available' as const },
      { agentId: 'agent3', name: 'Charlie Brown', skills: ['Technical Support', 'Hardware Issues'], currentLoad: 3, availabilityStatus: 'Busy' as const },
      { agentId: 'agent4', name: 'Diana Prince', skills: ['General Inquiries', 'Product Information'], currentLoad: 0, availabilityStatus: 'Available' as const },
      { agentId: 'agent5', name: 'Eve Adams', skills: ['Billing', 'Technical Support'], currentLoad: 2, availabilityStatus: 'Available' as const },
    ];

    if (input.filterByCategory) {
      return allAgents.filter(agent => agent.skills.includes(input.filterByCategory!));
    }

    return allAgents;
  }
);

const SuggestAgentAssignmentInputSchema = z.object({
  ticketId: z.string().describe('The unique identifier for the incoming ticket.'),
  category: z.string().describe('The category of the complaint (e.g., "Technical Issue", "Billing Inquiry").'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity level of the ticket.'),
  description: z.string().describe('A detailed description of the customer complaint.'),
});
export type SuggestAgentAssignmentInput = z.infer<typeof SuggestAgentAssignmentInputSchema>;

const SuggestAgentAssignmentOutputSchema = z.object({
  suggestedAgentId: z.string().describe('The ID of the agent suggested for the ticket.'),
  suggestedAgentName: z.string().describe('The name of the agent suggested for the ticket.'),
  reasoning: z.string().describe('A brief explanation of why this agent was suggested.'),
});
export type SuggestAgentAssignmentOutput = z.infer<typeof SuggestAgentAssignmentOutputSchema>;

const suggestAgentAssignmentPrompt = ai.definePrompt({
  name: 'suggestAgentAssignmentPrompt',
  input: { schema: SuggestAgentAssignmentInputSchema },
  output: { schema: SuggestAgentAssignmentOutputSchema },
  tools: [getAvailableAgents],
  prompt: `You are an AI agent assignment system. Your goal is to suggest the best available agent for an incoming support ticket.

Use the 'getAvailableAgents' tool to fetch a list of agents, their skills, and current workload.

Ticket Details:
  ID: {{{ticketId}}}
  Category: {{{category}}}
  Severity: {{{severity}}}
  Description: {{{description}}}

When suggesting an agent, prioritize:
1. Agents whose skills closely match the ticket's category and description.
2. Agents with lower current workload (fewer active tickets).
3. Agents with 'Available' status.
4. For 'Critical' or 'High' severity tickets, prioritize relevant skills even if the agent has a slightly higher load, but avoid 'Busy' or 'Offline' agents.

First, call the 'getAvailableAgents' tool to get the current list of agents.
Then, based on the ticket details and the available agents, provide the suggestedAgentId, suggestedAgentName, and a concise reasoning for your choice.
`,
});

const suggestAgentAssignmentFlow = ai.defineFlow(
  {
    name: 'suggestAgentAssignmentFlow',
    inputSchema: SuggestAgentAssignmentInputSchema,
    outputSchema: SuggestAgentAssignmentOutputSchema,
  },
  async (input) => {
    const { output } = await suggestAgentAssignmentPrompt(input);
    return output!;
  }
);

export async function suggestAgentAssignment(input: SuggestAgentAssignmentInput): Promise<SuggestAgentAssignmentOutput> {
  return suggestAgentAssignmentFlow(input);
}
