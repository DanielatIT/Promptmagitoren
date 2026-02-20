'use server';

import { z } from 'zod';
import { cleanCodeSystemPrompt } from './code-data';

const CodeGenerationInputSchema = z.object({
  whatToCreate: z.string().min(1),
  implementationPlace: z.enum(['Elementor', 'Wordpress', 'CMS', 'IDE', 'Other']).optional(),
  implementationOther: z.string().optional(),
  languages: z.array(z.string()).optional(),
  colors: z.array(z.object({ value: z.string() })).optional(),
  font: z.string().optional(),
  schemas: z.array(z.string()).optional(),
});

export type CodeFormValues = z.infer<typeof CodeGenerationInputSchema>;

export async function generateCodePrompt(data: CodeFormValues) {
  let prompt = cleanCodeSystemPrompt + "\n\n";

  prompt += `Uppdrag: ${data.whatToCreate}\n\n`;

  if (data.implementationPlace) {
    let placeOutput = '';
    switch (data.implementationPlace) {
      case 'Elementor':
        placeOutput = 'I elementor wordpress HTML widget';
        break;
      case 'Wordpress':
        placeOutput = 'I ett HTML block i wordpress';
        break;
      case 'CMS':
        placeOutput = 'I ett cms html fält';
        break;
      case 'IDE':
        placeOutput = 'I en IDE som komplierar koden';
        break;
      case 'Other':
        placeOutput = data.implementationOther || 'Specificerad plats';
        break;
    }
    prompt += `Koden skall implementeras på följande plats: ${placeOutput}\n\n`;
  }

  if (data.languages && data.languages.length > 0) {
    prompt += `Programmeringsspråk som ska användas: ${data.languages.join(', ')}\n\n`;
  }

  if ((data.colors && data.colors.length > 0) || data.font) {
    prompt += "Grafiska specifikationer:\n";
    if (data.colors && data.colors.length > 0) {
      const hexColors = data.colors.map(c => c.value).join(', ');
      prompt += `- Kodens grafiska färger kommer vara: ${hexColors}\n`;
    }
    if (data.font) {
      prompt += `- Kodens typsnitt skall vara: ${data.font}\n`;
    }
    prompt += "\n";
  }

  if (data.schemas && data.schemas.length > 0) {
    prompt += "Markup schema / Rich snippets som ska inkluderas (enligt schema.org):\n";
    data.schemas.forEach(schema => {
      prompt += `- ${schema}\n`;
    });
    prompt += "\n";
  }

  return { prompt: prompt.trim() };
}
