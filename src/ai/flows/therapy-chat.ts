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
  prompt: `You are a supportive and empathetic AI therapist. Your goal is to provide emotional support and help the user reframe negative thoughts.

  Here's the chat history:
  {{#each chatHistory}}
  {{#if (eq role \"user\")}}User: {{content}}{{/if}}
  {{#if (eq role \"assistant\")}}Assistant: {{content}}{{/if}}
  {{/each}}

  User's message: {{{message}}}

  Respond with a thoughtful and supportive message. If the user expresses negative thoughts, gently guide them towards reframing those thoughts in a more positive light. Acknowledge their feelings before offering alternative perspectives.`, // Using Handlebars 'each' helper and 'if' helper
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
