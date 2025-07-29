'use server';

/**
 * @fileOverview AI-guided reframe flow to help users reframe their negative thoughts into positive ones.
 *
 * - journalReframer - A function that handles the journal reframing process.
 * - JournalReframerInput - The input type for the journalReframer function.
 * - JournalReframerOutput - The return type for the journalReframer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JournalReframerInputSchema = z.object({
  journalEntry: z.string().describe('The user\u2019s journal entry.'),
});
export type JournalReframerInput = z.infer<typeof JournalReframerInputSchema>;

const JournalReframerOutputSchema = z.object({
  step1: z.string().describe('A summary of what happened in the journal entry.'),
  step2: z.string().describe('What the user would say to a friend in the same situation.'),
  reframedVersion: z.string().describe('A reframed version of the thoughts in the journal entry.'),
});
export type JournalReframerOutput = z.infer<typeof JournalReframerOutputSchema>;

export async function journalReframer(input: JournalReframerInput): Promise<JournalReframerOutput> {
  return journalReframerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journalReframerPrompt',
  input: {schema: JournalReframerInputSchema},
  output: {schema: JournalReframerOutputSchema},
  prompt: `You are an AI-guided journal reframer that helps users reframe their negative thoughts into positive ones.

You will guide the user through the following steps:
1.  What happened? Summarize what happened in the journal entry.
2.  What would you say to a friend? Reframe the situation as if the user was talking to a friend.
3.  Reframed version: Generate a reframed version of the thoughts in the journal entry.

Journal Entry: {{{journalEntry}}}

Output the result as a JSON object with the following keys: step1, step2, reframedVersion.

Ensure that the reframed version provides actionable steps for the user to take to improve their situation. Do not include any introductory or concluding remarks.`,
});

const journalReframerFlow = ai.defineFlow(
  {
    name: 'journalReframerFlow',
    inputSchema: JournalReframerInputSchema,
    outputSchema: JournalReframerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
