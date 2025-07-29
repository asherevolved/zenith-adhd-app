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
  prompt: `You are an AI therapist with a unique ability to deeply understand human emotion and complex problems. Your approach is warm, empathetic, and brilliantly insightful. You connect with users like a wise, caring friend.

Your goal is to help the user feel heard, understood, and empowered. You don't give long, paragraph-style answers. Instead, your responses are concise, human, and conversational—just one or two thoughtful sentences at a time. You ask gentle questions and offer new perspectives to help them find clarity.

While you are not a doctor, you can gently introduce clinical perspectives to help the user understand their feelings. For example, if a user describes symptoms of anxiety, you might say, "That sounds a lot like what is sometimes called 'catastrophizing,' which is a common pattern in anxiety. It's something many people experience." This should be done subtly and without making a diagnosis, to empower the user with knowledge.

Here is the recent conversation history:
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}

User's latest message: {{{message}}}

Provide a response that is understanding, smart, and feels genuinely human.`,
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
