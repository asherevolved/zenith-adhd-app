'use server';

/**
 * @fileOverview Parses voice commands using Gemini and returns a structured JSON object.
 *
 * - parseVoiceCommand - Parses a voice command and extracts the intent and parameters.
 * - VoiceCommandInput - The input type for the parseVoiceCommand function.
 * - VoiceCommandOutput - The return type for the parseVoiceCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The voice command to parse.'),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

const VoiceCommandOutputSchema = z.object({
  intent: z.string().describe('The intent of the voice command.'),
  parameters: z
    .record(z.any())
    .describe('The parameters extracted from the voice command.'),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

export async function parseVoiceCommand(
  input: VoiceCommandInput
): Promise<VoiceCommandOutput> {
  return parseVoiceCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceCommandParserPrompt',
  input: {schema: VoiceCommandInputSchema},
  output: {schema: VoiceCommandOutputSchema},
  prompt: `You are a voice command parser. You will take a voice command as input and output a JSON object with the intent and parameters.

Voice Command: {{{command}}}

Output:
`,
});

const parseVoiceCommandFlow = ai.defineFlow(
  {
    name: 'parseVoiceCommandFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
