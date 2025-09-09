
'use server';

/**
 * @fileOverview This file defines a function for adaptive prompt generation.
 *
 * - adaptivePromptGeneration - A function that generates a prompt string based on user input, intelligently including/excluding constraints and formatting.
 * - FormValues - The input type for the adaptivePromptGeneration function.
 * - AdaptivePromptGenerationOutput - The return type for the adaptivePromptGeneration function.
 */

import { z } from 'zod';
import { 
    roleOutputs, 
    languageOutputs, 
    taskTypeMap, 
    tonalityMap, 
    avoidWordsMap 
} from './prompt-data';

const aiRoleOptions = [
    'SEO expert', 'Skribent för bloggar'
] as const;


// Define a strict schema for the form input.
const AdaptivePromptGenerationInputSchema = z.object({
  topicGuideline: z.string().min(1),
  aiRole: z.enum([...aiRoleOptions, 'custom']),
  aiRoleCustom: z.string().optional(),
  taskTypeRadio: z.enum(['Artikel', 'Seo onpage text', 'custom']).optional(),
  taskTypeCustom: z.string().optional(),
  
  tonality: z.array(z.string()).optional(),
  tonalityCustom: z.string().optional(),
  
  textLength: z.string().optional(),
  
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().optional(),
  
  language: z.enum(['Engelska', 'Svenska']),
  
  websiteUrl: z.string().optional(),

  rules: z.object({
    avoidSuperlatives: z.boolean().default(true),
    avoidPraise: z.boolean().default(true),
    avoidAcclaim: z.boolean().default(true),
    isInformative: z.boolean().default(true),
    useWeForm: z.boolean().default(true),
    addressReaderAsYou: z.boolean().default(true),
    avoidWords: z.object({
        enabled: z.boolean().default(true),
        words: z.array(z.string()).optional(),
    }),
    avoidXYPhrase: z.boolean().default(true),
    avoidVilket: z.boolean().default(true),
    avoidEmDash: z.boolean().default(true),
    customRules: z.string().optional(),
  }).optional(),
  
  links: z.array(z.object({ url: z.string().url(), anchorText: z.string() })).optional(),

  primaryKeywords: z.array(z.object({ value: z.string() })).optional(),
  
  author: z.string().optional(),

  structure: z.array(z.object({
    type: z.string(),
    topic: z.string().optional(),
  })).optional(),
}).passthrough(); // Use passthrough to ignore _disabled fields

export type FormValues = z.infer<typeof AdaptivePromptGenerationInputSchema>;


export interface AdaptivePromptGenerationOutput {
  prompt: string;
}

export async function adaptivePromptGeneration(data: FormValues): Promise<AdaptivePromptGenerationOutput> {
  // Validate input data
  const validatedData = AdaptivePromptGenerationInputSchema.parse(data);

  let promptText = "Dessa regler nedan skall följas väldigt strikt, kolla konstant att du alltid följer det instruktioner jag ger dig här och återkom med en fråga om vad du skall göra istället för att göra något annat än vad instruktioner hänvisar.\n\n";

  if (validatedData.topicGuideline) {
    promptText += `Förhåll dig till denna information när du skriver texten: ${validatedData.topicGuideline}\n\n`;
  }

  let roleOutput = '';
  if (validatedData.aiRole === 'custom') {
      roleOutput = validatedData.aiRoleCustom || '';
  } else {
      roleOutput = roleOutputs[validatedData.aiRole];
  }

  if (validatedData.aiRole === 'SEO expert' && roleOutput) {
      const firstKeyword = validatedData.primaryKeywords?.[0]?.value || '[sökords input]';
      roleOutput = roleOutput.replace('{primaryKeyword}', firstKeyword);
  }
  
  if (roleOutput) {
      promptText += roleOutput + '\n\n';
  }

  promptText += 'Strukturera texten med tydliga och relevanta rubriker (H2, H3, etc.) för att förbättra läsbarheten och SEO. Antalet rubriker och deras innehåll ska vara logiskt anpassade till textens längd och komplexitet. Rubrikerna skall följa svenska skrivregler.\n\n';

  const taskTypeInstruction = validatedData.taskTypeRadio === 'custom'
    ? validatedData.taskTypeCustom
    : validatedData.taskTypeRadio ? taskTypeMap[validatedData.taskTypeRadio] : '';
    
  if (taskTypeInstruction) {
      promptText += `Din uppgift är att: ${taskTypeInstruction}\n\n`;
  }

  if ((validatedData.tonality && validatedData.tonality.length > 0) || (validatedData.tonalityCustom && validatedData.tonalityCustom.trim() !== '')) {
    const tonalityDescriptions = validatedData.tonality
      ?.map(t => tonalityMap[t])
      .filter(Boolean) || [];
    
    if (validatedData.tonalityCustom && validatedData.tonalityCustom.trim() !== '') {
        tonalityDescriptions.push(validatedData.tonalityCustom.trim());
    }

    if (tonalityDescriptions.length > 0) {
      promptText += `Tonaliteten ska följa dessa riktlinjer:\n${tonalityDescriptions.join('\n')}\n\n`;
    }
  }

  if (validatedData.textLength) {
    const textLengthNum = parseInt(validatedData.textLength, 10);
    if (!isNaN(textLengthNum)) {
      const lowerBound = Math.max(0, textLengthNum - 50); // Ensure lower bound isn't negative
      promptText += `Längd på denna text skall vara ${textLengthNum}, och skall hållas till detta så gott det går. Texten får ej överskridas mer än med 20 ord och får ej vara mindre än ${lowerBound} ord.\n\n`;
    }
  }
  
  if (validatedData.excludeLists) {
    promptText += 'Texten får inte innehålla några listor alls.\n\n';
  } else if (validatedData.numberOfLists) {
    const numberOfListsNum = parseInt(validatedData.numberOfLists, 10);
    if (!isNaN(numberOfListsNum)) {
      promptText += `Texten får bara ha ${numberOfListsNum} antal listor i alla dess former\n\n`;
    }
  }

  promptText += languageOutputs[validatedData.language] + '\n\n';

  if (validatedData.websiteUrl) {
    promptText += `När du skriver denna text, utgå från denna sida: ${validatedData.websiteUrl}, som texten ska publiceras på, Ta hänsyn till sidans syfte, målgrupp och innehåll, så att texten passar in naturligt.\n\n`;
  }

  if (validatedData.rules) {
    const rules: string[] = [];
    if (validatedData.rules.avoidSuperlatives) rules.push('Undvik superlativ');
    if (validatedData.rules.avoidPraise) rules.push('Undvik lovord');
    if (validatedData.rules.avoidAcclaim) rules.push('Undvik beröm.');
    if (validatedData.rules.isInformative) rules.push('Texten skall vara informativ med fokus på att ge läsaren kunskap för ämnet');
    if (validatedData.rules.useWeForm) rules.push('Skriv i vi-form, som att vi är företaget.');
    if (validatedData.rules.addressReaderAsYou) rules.push('Läsaren skall benämnas som ni.');
    if (validatedData.rules.avoidWords?.enabled && validatedData.rules.avoidWords.words && validatedData.rules.avoidWords.words.length > 0) {
        const wordsToAvoid = validatedData.rules.avoidWords.words.map(id => avoidWordsMap[id]).filter(Boolean);
        if (wordsToAvoid.length > 0) {
          rules.push(`Texten får aldrig innehålla orden: ${wordsToAvoid.join(', ')}`);
        }
    }
    if (validatedData.rules.avoidXYPhrase) rules.push('skriv aldrig en mening som liknar eller är i närheten av detta “...i en X värld/industri/område är “sökordet” värdefullt för Y anledning”');
    if (validatedData.rules.avoidVilket) rules.push('Undvik att använda ",vilket..." och använd bara den där det mest passar. ", vilket" får bara finnas i texten 1 gång och ersätts med "och" "som" "detta" och andra ord');
    if (validatedData.rules.avoidEmDash) rules.push('Undvik att använda em-tecken (—) i texten.');
    if (validatedData.rules.customRules) {
        rules.push(...validatedData.rules.customRules.split('\n').filter(rule => rule.trim() !== ''));
    }

    if (rules.length > 0) {
        promptText += `Regler för texten: ${rules.join('. ')}\n\n`;
    }
  }

  if (validatedData.structure && validatedData.structure.length > 0) {
    const structureIntro = "Detta skall vara strukturen på denna text du har valfrihet att lägga in dessa delar där du vill och där det passar bäst men styckarna skall, Detta är delarna jag vill ha in samt det ämne vardera text ska handla om: ";
    const structureParts = validatedData.structure.map(item => {
        if (item.topic && item.topic.trim() !== '') {
            return `Ha med ett stycke som är en ${item.type} som handlar om ${item.topic}`;
        }
        return `Ha med ett stycke som är en ${item.type} där du har fria händer att skriva om det du anser bäst`;
    }).join('. ');
    promptText += `${structureIntro}${structureParts}.\n\n`;
  }

  if (validatedData.links && validatedData.links.length > 0) {
    validatedData.links.forEach(link => {
      if (link.url && link.anchorText)
        promptText += `Lägg in hyperlänkar i texten, länken är: ${link.url}. På detta sökord: ${link.anchorText}\n\n`;
    });
  }

  if (validatedData.primaryKeywords && validatedData.primaryKeywords.length > 0) {
    const keywords = validatedData.primaryKeywords.map(kw => kw.value).filter(Boolean);
    if (keywords.length > 0) {
      promptText += `Denna text skall innehålla följande sökord/sökfraser: ${keywords.join(', ')}. Fördela dessa naturligt i texten med en densitet på cirka 2.5% av textens totala antal ord för varje sökord.\n\n`;
    }
  }

  if (validatedData.author) {
    promptText += `Denna texten är skriven av ${validatedData.author} och kan nämnas i en CTA.\n\n`;
  } else {
    promptText += 'Texten skall skrivas ut ett neutralt perspektiv där vi som skriver inte benämns.\n\n';
  }
  
  return { prompt: promptText };
}
