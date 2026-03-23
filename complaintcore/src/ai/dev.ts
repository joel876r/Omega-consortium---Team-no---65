import { config } from 'dotenv';
config();

import '@/ai/flows/provide-customer-chatbot-assistance.ts';
import '@/ai/flows/suggest-agent-assignment.ts';
import '@/ai/flows/generate-agent-response-suggestions.ts';
import '@/ai/flows/analyze-incoming-complaint.ts';