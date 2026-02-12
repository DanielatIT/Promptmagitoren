
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
    avoidWordsMap,
    serpAnalysisPrompt,
    aiRoleOptions,
    forbiddenWordsForSubjectRule
} from './prompt-data';


// Define a strict schema for the form input.
const AdaptivePromptGenerationInputSchema = z.object({
  topicGuideline: z.string().min(1),
  aiRole: z.enum([...aiRoleOptions, 'custom']),
  aiRoleCustom: z.string().optional(),
  performSerpAnalysis: z.boolean().optional(),
  serpKeyword: z.string().optional(),
  taskTypeRadio: z.enum([...Object.keys(taskTypeMap), 'custom'] as [string, ...string[]]).optional(),
  taskTypeCustom: z.string().optional(),
  
  tonality: z.array(z.string()).optional(),
  tonalityCustom: z.string().optional(),
  
  textLength: z.string().optional(),
  
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().optional(),
  
  language: z.enum(['Engelska', 'Svenska']),
  convertToHtml: z.boolean().optional(),
  
  rules: z.object({
    avoidSuperlatives: z.boolean().default(true),
    avoidPraise: z.boolean().default(true),
    avoidAcclaim: z.boolean().default(true),
    isInformative: z.boolean().default(true),
    isTechnical: z.boolean().default(true),
    useWeForm: z.boolean().default(true),
    addressReaderAsYou: z.boolean().default(true),
    avoidWords: z.object({
        enabled: z.boolean().default(true),
        words: z.array(z.string()).optional(),
    }),
    avoidPhrases: z.object({
        enabled: z.boolean().default(true),
        avoidXYPhrase: z.boolean().default(true),
        avoidVilket: z.boolean().default(true),
        avoidKeywordAsSubject: z.boolean().default(true),
    }),
    avoidEmDash: z.boolean().default(true),
    customRules: z.string().optional(),
  }).optional(),
  
  primaryKeywords: z.array(z.object({ value: z.string() })).optional(),

  useAdvancedStructure: z.enum(['Ja', 'Nej']).optional(),
  advancedStructure: z.array(z.object({
    type: z.string(),
    topic: z.string().optional(),
    links: z.array(z.object({
      url: z.string(),
      anchorText: z.string(),
    })).optional(),
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
  
  if (roleOutput) {
      promptText += roleOutput + '\n\n';
  }

  if (validatedData.aiRole === 'SEO expert' && validatedData.performSerpAnalysis && validatedData.serpKeyword) {
      let analysisPrompt = serpAnalysisPrompt.replace(/\[Text input\]/g, validatedData.serpKeyword);
      promptText += analysisPrompt + '\n\n';
  }


  promptText += 'Strukturera texten med tydliga och relevanta rubriker (H2, H3, etc.) för att förbättra läsbarheten och SEO. Dessa rubriker skall alltid börja med stor bokstav var på resten av rubriken skall vara små bokstäver. Rubrikerna får inte innehålla några EM tecken (-).\n';
  promptText += 'Texten skall alltid ha en titel (H1).\n\n';

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

  if (validatedData.rules) {
    const rules: string[] = [];
    if (validatedData.rules.avoidSuperlatives) rules.push('Undvik superlativ');
    if (validatedData.rules.avoidPraise) rules.push('Undvik lovord');
    if (validatedData.rules.avoidAcclaim) rules.push('Undvik beröm.');
    if (validatedData.rules.isInformative) rules.push('Texten skall vara informativ med fokus på att ge läsaren kunskap för ämnet');
    if (validatedData.rules.isTechnical) rules.push('Texten ska vara tekniskt skriven och fokusera på den tekniska aspekten av ämnet. Inkludera tekniska specifikationer och data organiskt i texten eller som en egen sektion som beskriver ämnets specifika tekniska egenskaper.');
    if (validatedData.rules.useWeForm) rules.push('Skriv i vi-form, som att vi är företaget.');
    if (validatedData.rules.addressReaderAsYou) rules.push('Läsaren skall benämnas som ni.');
    if (validatedData.rules.avoidWords?.enabled && validatedData.rules.avoidWords.words && validatedData.rules.avoidWords.words.length > 0) {
        const wordsToAvoid = validatedData.rules.avoidWords.words.map(id => avoidWordsMap[id]).filter(Boolean);
        if (wordsToAvoid.length > 0) {
          rules.push(`Texten får aldrig innehålla orden: ${wordsToAvoid.join(', ')}`);
        }
    }
    
    if (validatedData.rules.avoidPhrases?.enabled) {
      if (validatedData.rules.avoidPhrases.avoidXYPhrase) rules.push('skriv aldrig en mening som liknar eller är i närheten av detta “...i en X värld/industri/område är “sökordet” värdefullt för Y anledning”');
      if (validatedData.rules.avoidPhrases.avoidVilket) rules.push('Undvik att använda ",vilket..." och använd bara den där det mest passar. ", vilket" får bara finnas i texten 1 gång och ersätts med "och" "som" "detta" och andra ord');
      if (validatedData.rules.avoidPhrases.avoidKeywordAsSubject) {
        const firstKeyword = validatedData.primaryKeywords?.find(kw => kw.value.trim())?.value.trim();
        const forbiddenWords = forbiddenWordsForSubjectRule.join('/');
        
        const examplePhrase = firstKeyword 
            ? `"${firstKeyword} är ${forbiddenWords} för.."` 
            : `"...är ${forbiddenWords} för.."`;

        rules.push(`Du får aldrig använda denna mening eller någon form av denna meningsuppbyggnad, som första mening av en text och skall undvikas att skrivas om det inte är av yttersta vikt för att förstå senare in i texten: ${examplePhrase} Sen anledning. Det ord jag inkluderat i outputen är då det ord som skall undvikas i denna specifika mening.`);
      }
    }
    
    if (validatedData.rules.avoidEmDash) rules.push('Undvik att använda em-tecken (—) i texten.');

    if (validatedData.rules.customRules) {
        rules.push(...validatedData.rules.customRules.split('\n').filter(rule => rule.trim() !== ''));
    }

    if (rules.length > 0) {
        promptText += `Regler för texten: ${rules.join('. ')}\n\n`;
    }
  }

  if (validatedData.useAdvancedStructure === 'Ja' && validatedData.advancedStructure && validatedData.advancedStructure.length > 0) {
    let structurePrompt = "Jag vill att texten skall följa denna struktur med denna information i ordning:\n\n";
    
    const cardOutputs = validatedData.advancedStructure.map(card => {
      let cardOutput = '';
      const topic = card.topic?.trim();

      switch (card.type) {
        case 'Titel':
          cardOutput = topic ? `Textens/artikelns titel: ${topic}.` : 'Textens/artikelns titel. Om ej definierat skriv mest lämpad titel enligt tonaliteten angiven.';
          break;
        case 'Ingress/inledning':
          cardOutput = topic ? `Ingress eller inledning om: ${topic}.` : 'Ingress eller inledning.';
          break;
        case 'Underrubrik & Brödtext':
          cardOutput = topic ? `Underrubrik med medhavande brödtext om: ${topic}.` : 'Underrubrik med medhavande brödtext.';
          break;
        case 'Fristående text':
          cardOutput = topic ? `Fristående text om: ${topic}.` : 'Fristående text.';
          break;
        case 'lista':
           cardOutput = topic ? `En lista gällande ${topic}.` : 'En lista.';
           break;
        case 'CTA':
          cardOutput = topic ? `Call to action: uppmana till textens primära action. Följ tonaliteten men uppmana till denna konvertering: ${topic}.` : 'Call to action: uppmana till textens primära action.';
          break;
        case 'Anpassat fält':
          cardOutput = topic ? `INKLUDERA det som står i text fältet: ${topic}` : '';
          break;
      }

      if (card.links && card.links.length > 0) {
          const linkInstructions = card.links
            .filter(link => link.url && link.anchorText)
            .map(link => 
              `I detta stycke, lägg in hyperlänken "${link.url}" på sökordet "${link.anchorText}".`
          ).join(' ');
          if (linkInstructions) {
            cardOutput += ` ${linkInstructions}`;
          }
      }
      
      return cardOutput.trim();
    }).filter(Boolean);

    if (cardOutputs.length > 0) {
      structurePrompt += cardOutputs.join('\n\n');
      promptText += structurePrompt + '\n\n';
    }
  }

  if (validatedData.primaryKeywords && validatedData.primaryKeywords.length > 0) {
    const keywords = validatedData.primaryKeywords.map(kw => kw.value).filter(Boolean);
    if (keywords.length > 0) {
      promptText += `Denna text skall innehålla följande sökord/sökfraser: ${keywords.join(', ')}. Fördela dessa naturligt i texten med en densitet på cirka 2.5% av textens totala antal ord för varje sökord.\n\n`;
    }
  }
  
  promptText += 'Texten skall skrivas ut ett neutralt perspektiv där vi som skriver inte benämns.\n\n';
  
  if (validatedData.convertToHtml) {
    promptText += "Texten som produceras skall konverteras till inline HTML kod enligt best best practice/bästa praxis för hur HTML kod skall skrivas i SEO syfte. Inline kod i detta fallet menas att denna komma inkluderas på en sida i ett redan implementerat fält så som i ett text fält i wordpress/elementor\n\n";
  }

  return { prompt: promptText };
}
