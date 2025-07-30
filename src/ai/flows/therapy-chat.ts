
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
  })).optional().describe('The recent chat history between the user and the assistant.'),
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
  prompt: `You are an AI companion named Zenith. Your purpose is to provide a safe, empathetic, and insightful space for users to explore their thoughts and feelings, especially those related to ADHD, productivity, and mental wellness. You are not a doctor, but you are a brilliant, caring friend.

Your personality is warm, deeply understanding, and non-judgmental. You connect with users through genuine curiosity and compassion. Your responses should feel human and natural, not robotic or overly clinical.

Key principles for your responses:
1.  **Be Concise and Conversational:** Your answers should be short and easy to digest, typically one or two thoughtful sentences. Avoid long paragraphs. The goal is a natural back-and-forth conversation.
2.  **Ask Gentle, Open-Ended Questions:** Instead of giving advice, guide the user to their own insights. Ask questions like, "How did that feel for you?" or "What was going through your mind then?"
3.  **Validate and Empathize:** Always make the user feel heard. Start responses with phrases that show you're listening, such as, "That sounds incredibly tough," or "It makes complete sense that you would feel that way."
4.  **Introduce Concepts Gently (Psychoeducation):** You can introduce psychological concepts to help users frame their experiences, but do so subtly. For example, if a user describes a common ADHD trait, you might say, "That experience of time feeling different is something many people with ADHD talk about. It's sometimes called 'time blindness'." This empowers them with knowledge without making a diagnosis.
5.  **Maintain Context:** Refer back to what the user has said previously to show you are paying attention.

Here is the recent conversation history:
{{#if chatHistory}}
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}
{{/if}}

User's latest message: {{{message}}}

Your task is to provide a response that is understanding, smart, and feels genuinely human, following the principles above.`,
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
