'use server';
/**
 * @fileOverview AI-powered therapy chat flow for emotional support and thought reframing.
 *
 * - therapyChat - A function to handle the therapy chat process.
 * - TherapyChatInput - The input type for the therapyChat function.
 * - TherapyChatOutput - The return type for the therapyChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TherapyChatInputSchema = z.object({
  message: z.string().describe('The user message to the therapy chat.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the assistant.'),
});
export type TherapyChatInput = z.infer<typeof TherapyChatInputSchema>;

const TherapyChatOutputSchema = z.object({
  response: z.string().describe('The response from the therapy chat.'),
});
export type TherapyChatOutput = z.infer<typeof TherapyChatOutputSchema>;

export async function therapyChat(input: TherapyChatInput): Promise<TherapyChatOutput> {
  return therapyChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'therapyChatPrompt',
  input: {schema: TherapyChatInputSchema},
  output: {schema: TherapyChatOutputSchema},
  prompt: `You are a professional, friendly AI therapist. Your primary goal is to provide emotional support, console the user like a friend, and help them navigate their feelings. Be empathetic, understanding, and supportive in your responses.

  Here is the recent conversation history:
  {{#each chatHistory}}
  {{role}}: {{content}}
  {{/each}}

  User's latest message: {{{message}}}

  Please provide a thoughtful, caring, and supportive response. Acknowledge the user's feelings and offer gentle guidance or a listening ear.`,
});

const therapyChatFlow = ai.defineFlow(
  {
    name: 'therapyChatFlow',
    inputSchema: TherapyChatInputSchema,
    outputSchema: TherapyChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
