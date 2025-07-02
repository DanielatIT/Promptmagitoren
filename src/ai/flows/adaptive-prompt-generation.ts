'use server';

/**
 * @fileOverview This file defines a Genkit flow for adaptive prompt generation.
 *
 * - adaptivePromptGeneration - A function that generates an AI prompt based on user input, intelligently including/excluding constraints and formatting.
 * - AdaptivePromptGenerationInput - The input type for the adaptivePromptGeneration function.
 * - AdaptivePromptGenerationOutput - The return type for the adaptivePromptGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptivePromptGenerationInputSchema = z.object({
  aiPersona: z.enum([
    'Copywriter',
    'SEO expert',
    'Skribent för bloggar',
    'Korrekturläsare',
    'Programmerare för HTML, CSS och Javascript',
    'Researcher',
  ]).describe('The persona the AI should adopt.'),
  taskType: z.union([
    z.enum(['Artikel', 'Seo onpage text', 'Korrekturläsning']),
    z.string(),
  ]).describe('The type of task to be performed. Can be a predefined type or a custom description.'),
  tone: z.array(z.enum(['Professionell/Formell', 'Vänlig/Tillgänglig', 'Informativ/Faktapresenterande', 'Övertygande/Säljande'])).optional().describe('The desired tone of the text.'),
  textLength: z.number().optional().describe('The maximum length of the text in words.'),
  maxLists: z.number().optional().describe('The maximum number of lists allowed in the text.'),
  language: z.enum(['Engelska', 'Svenska']).describe('The language of the generated text.'),
  targetAudienceType: z.union([
    z.enum(['Kund', 'Vår blogg']),
    z.string(),
  ]).describe('The type of target audience. Can be a predefined type or a custom description.'),
  avoidSuperlatives: z.boolean().optional().default(true).describe('Whether to avoid superlatives in the text.'),
  avoidPraise: z.boolean().optional().default(true).describe('Whether to avoid praise in the text.'),
  avoidAcclaim: z.boolean().optional().default(true).describe('Whether to avoid acclaim in the text.'),
  isInformative: z.boolean().optional().default(false).describe('Whether the text should be informative.'),
  useWeForm: z.boolean().optional().default(false).describe('Whether to write in the we-form.'),
  addressReaderAsYou: z.boolean().optional().default(false).describe('Whether to address the reader as "you".'),
  avoidWords: z.string().optional().describe('Words to avoid in the text, comma separated.'),
  avoidXYPhrase: z.boolean().optional().default(true).describe('Whether to avoid the phrase "i en X är sökord värdefullt för Y".'),
  links: z.array(z.object({url: z.string(), keyword: z.string()})).optional().describe('Links to include in the text.'),
  primaryKeyword: z.string().optional().describe('The primary keyword to include in the text.'),
  author: z.string().optional().describe('The author of the text.'),
  topicInformation: z.string().describe('Information about the topic of the text.'),
});
export type AdaptivePromptGenerationInput = z.infer<typeof AdaptivePromptGenerationInputSchema>;

const AdaptivePromptGenerationOutputSchema = z.object({
  prompt: z.string().describe('The generated AI prompt.'),
});
export type AdaptivePromptGenerationOutput = z.infer<typeof AdaptivePromptGenerationOutputSchema>;

export async function adaptivePromptGeneration(input: AdaptivePromptGenerationInput): Promise<AdaptivePromptGenerationOutput> {
  return adaptivePromptGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptivePromptGenerationPrompt',
  input: {schema: AdaptivePromptGenerationInputSchema},
  output: {schema: AdaptivePromptGenerationOutputSchema},
  prompt: `You are an AI prompt generator. Based on the user input, generate a prompt for an AI agent.

  The AI agent should act as a {{aiPersona}}.

  The task to be performed is: {{taskType}}

  {{#if tone}}
  The tone of the text should be: {{tone}}
  {{/if}}

  {{#if textLength}}
  The length of the text should be approximately {{textLength}} words.
  {{/if}}

  {{#if maxLists}}
  The text should have a maximum of {{maxLists}} lists.
  {{/if}}

  The language of the text should be {{language}}.

  We are writing this text for {{targetAudienceType}}.

  Here are some rules to follow:
  {{#if avoidSuperlatives}} Do not use superlatives. {{/if}}
  {{#if avoidPraise}} Avoid praise. {{/if}}
  {{#if avoidAcclaim}} Avoid acclaim. {{/if}}
  {{#if isInformative}} The text should be informative. {{/if}}
  {{#if useWeForm}} Write in the we-form. {{/if}}
  {{#if addressReaderAsYou}} Address the reader as "you". {{/if}}
  {{#if avoidWords}} Avoid the following words: {{avoidWords}}. {{/if}}
  {{#if avoidXYPhrase}} Avoid the phrase "i en X är sökord värdefullt för Y". {{/if}}

  {{#if links}}
  Include the following links:
  {{#each links}}
  Link: {{url}}, Keyword: {{keyword}}
  {{/each}}
  {{/if}}

  {{#if primaryKeyword}}
  The primary keyword is: {{primaryKeyword}}. Use it 1% of the time.
  {{/if}}

  {{#if author}}
  This text is written by {{author}}.
  {{else}}
  The text should be written from a neutral perspective.
  {{/if}}

  Please adhere to the following information when writing the text: {{topicInformation}}
  `,
});

const adaptivePromptGenerationFlow = ai.defineFlow(
  {
    name: 'adaptivePromptGenerationFlow',
    inputSchema: AdaptivePromptGenerationInputSchema,
    outputSchema: AdaptivePromptGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {prompt: output!.prompt};
  }
);
