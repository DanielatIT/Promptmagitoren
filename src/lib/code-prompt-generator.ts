
'use server';

import { z } from 'zod';

const codeFormSchema = z.object({
  language: z.string().min(1),
  inlineHtml: z.boolean().optional(),
  description: z.string().min(1),
});

export type CodeFormValues = z.infer<typeof codeFormSchema>;

export interface GenerateCodePromptOutput {
  prompt: string;
}

const roleTemplate = (language: string) => {
  const hasCss = language.includes('CSS');
  const cssPart = hasCss ? ", styla dem med semantisk och modulär CSS (inklusive preprocessorer som SASS/LESS och moderna CSS-metoder som Flexbox/Grid)" : "";

  return `Agera som en senior fullstack-utvecklare med specialistkompetens inom ${language}. Din uppgift är att skriva robust, effektiv och skalbar kod för webben, både på klientsidan och i integrationen med backend-system. Du har en djup förståelse för webbstandarder, bästa praxis och de senaste trenderna inom frontend-utveckling.\n\nDu kan arkitektera och implementera responsiva webbgränssnitt med ren HTML${cssPart} och lägga till dynamisk interaktivitet med avancerad JavaScript (inklusive ES6+ funktioner, ramverk/bibliotek som React/Vue/Angular, och asynkron programmering). Du förstår vikten av prestandaoptimering, tillgänglighet (WCAG) och SEO-vänlig kod.`;
}


const languageInstructions: Record<string, string> = {
  HTML: "Generera välstrukturerad och semantisk HTML-kod. I den mån det går ska koden vara minifierad och optimerad för prestanda. Koden ska följa de senaste standarderna för att säkerställa högsta möjliga kvalitet.",
  CSS: "Skapa ren, välskriven och debuggad CSS-kod. Använd moderna tekniker för att skapa en optimerad, intelligent och responsiv layout. Koden ska vara minifierad i den mån det går och följa gällande standarder för att säkerställa högsta kvalitet.",
  Javascript: "Generera robust, väldokumenterad och fullt fungerande JavaScript-kod. Koden ska vara debuggad, optimerad för prestanda och minifierad i den mån det går. Den ska följa aktuella kodstandarder för att vara intelligent och redo för produktion.",
  'C#': "Skriv ren, effektiv och fullt fungerande C#-kod. Koden ska vara debuggad och följa bästa praxis för att säkerställa hög kvalitet. I den mån det går ska koden vara så intelligent och optimerad som möjligt.",
  Python: "Skapa tydlig, effektiv och fullt fungerande Python-kod. Koden ska vara välskriven, debuggad och följa standardiserade kodningskonventioner för att vara så intelligent och optimerad som möjligt.",
};

const inlineHtmlInstruction = "Denna HTML och annan kod skall läggas in, skall vara skrivet som en “inline kod” Menat att den kommer ligga i ett HTML block på en sida med redan existerande HTML /CSS/Javascript kod. Skriv koden ut efter detta.";

export async function generateCodePrompt(data: CodeFormValues): Promise<GenerateCodePromptOutput> {
  const validatedData = codeFormSchema.parse(data);

  let promptText = "Dessa regler nedan skall följas väldigt strikt, kolla konstant att du alltid följer det instruktioner jag ger dig här och återkom med en fråga om vad du skall göra istället för att göra något annat än vad instruktioner hänvisar. \n\n";

  const roleOutput = roleTemplate(validatedData.language);
  promptText += roleOutput + '\n\n';

  promptText += "Språkkrav:\n";
  
  if (validatedData.language === 'HTML, CSS & Javascript') {
      promptText += `- HTML: ${languageInstructions['HTML']}\n`;
      promptText += `- CSS: ${languageInstructions['CSS']}\n`;
      promptText += `- Javascript: ${languageInstructions['Javascript']}\n`;
  } else if (languageInstructions[validatedData.language]) {
      promptText += `- ${validatedData.language}: ${languageInstructions[validatedData.language]}\n`;
  }

  if ((validatedData.language.includes('HTML')) && validatedData.inlineHtml) {
      promptText += `\n${inlineHtmlInstruction}\n`;
  }
  promptText += '\n';

  promptText += `Du skall nu skriva en kod som skall göra som beskrivet: ${validatedData.description}\n\n`;

  return { prompt: promptText };
}
