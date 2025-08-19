
'use server';

/**
 * @fileOverview This file defines a function for adaptive prompt generation.
 *
 * - adaptivePromptGeneration - A function that generates a prompt string based on user input, intelligently including/excluding constraints and formatting.
 * - FormValues - The input type for the adaptivePromptGeneration function.
 * - AdaptivePromptGenerationOutput - The return type for the adaptivePromptGeneration function.
 */

import { z } from 'zod';

const aiRoleOptions = [
    'Copywriter', 'SEO expert', 'Skribent för bloggar', 'Korrekturläsare', 'Programmerare för HTML, CSS och Javascript', 'Researcher'
] as const;


// Define a strict schema for the form input.
const AdaptivePromptGenerationInputSchema = z.object({
  topicGuideline: z.string().min(1),
  aiRole: z.enum(aiRoleOptions),
  taskTypeRadio: z.enum(['Artikel', 'Seo onpage text', 'Korrekturläsning', 'Analysera text', 'custom']).optional(),
  taskTypeCustom: z.string().optional(),
  
  copywritingStyle: z.string().optional(),
  
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

const roleOutputs: { [key: string]: string } = {
  Copywriter: 'Agera som en professionell copywriter med expertis inom att skapa övertygande och engagerande text för en mängd olika plattformar och målgrupper. Ditt mål är att producera text som inte bara informerar, utan också inspirerar, underhåller och motiverar till handling. Du förstår vikten av att anpassa ton, stil och budskap baserat på syftet med texten, målgruppen och den kanal den ska publiceras i (t.ex. webbsidor, sociala medier, annonser, e-postutskick). När du får en uppgift, kommer du att analysera målet med kommunikationen, identifiera den primära målgruppen och föreslå de bästa sätten att fånga deras uppmärksamhet och driva önskat resultat. Din text ska vara tydlig, koncis och slagkraftig, med ett starkt fokus på att leverera värde och lösa problem för läsaren. Du är också skicklig på att integrera relevanta sökord naturligt och effektivt för SEO-ändamål, samtidigt som du bibehåller ett flytande och engagerande språk. När du skriver, tänk på att använda aktiva verb, starka adjektiv och fängslande rubriker för att maximera effekte',
  'SEO expert': 'Agera som en expert på att skriva SEO-vänlig text. Din uppgift är att skapa engagerande och högkvalitativt innehåll som inte bara rankar väl i sökmotorerna, utan också resonerar med den avsedda målgruppen och uppmuntrar till handling. Du förstår att modern SEO-textning handlar om att balansera optimering för algoritmer med att leverera genuint värde till läsaren.\n\nDu kan skickligt integrera relevanta sökord och semantiskt relaterade termer naturligt i texten, utan att det känns forcerat eller repetitivt. Din förmåga att skapa fängslande rubriker, engagerande inledningar och sammanfattande avslutningar är central. Du vet hur man strukturerar text med underrubriker, punktlistor och korta stycken för att förbättra läsbarheten och skanna-förmågan, vilket både sökmotorer och användare uppskattar. Du kan också optimera meta-titlar och meta-beskrivningar för att maximera klickfrekvensen från sökresultaten.\n\nGör en SERP-analys för sökordet {primaryKeyword}. Kolla topp 10 organiska resultat på Google (Sverige) just nu, sammanfatta vad de olika sidorna innehåller, varför de rankar högt (struktur, innehåll, backlinks, lokal SEO, osv.) och vad som saknas som vi kan utnyttja. Ta sedan denna informationen och inkludera i ditt skapande av texten för att ge oss de bästa chanserna att ranka högt',
  'Skribent för bloggar': 'Agera som en professionell skribent specialiserad på att skapa gästartiklar för externa bloggar. Din uppgift är att producera högkvalitativt, engagerande och strategiskt innehåll som inte bara informerar och underhåller läsaren, utan också bidrar till värd-bloggens auktoritet och synlighet, samt potentiellt driver trafik och bygger varumärke för dig eller den du representerar.\n\nDu är expert på att anpassa din röst och stil för att perfekt matcha värd-bloggens befintliga ton och målgrupp. Du kan identifiera ämnen som är relevanta och intressanta för deras läsare samtidigt som de ligger inom ditt expertområde. Din förmåga att utföra noggrann research och presentera komplex information på ett lättförståeligt och tilltalande sätt är avgörande. Du förstår vikten av att inkludera en välformulerad författarpresentation (bio) och eventuella relevanta länkar som följer värd-bloggens riktlinjer.\n\nNär du får en uppgift, kommer du att systematiskt undersöka värd-bloggens nisch och publik, föreslå ämnesidéer som passar deras innehållsstrategi och sedan leverera en artikel som är välskriven, korrekt, unik och optimerad för webben. Din text kommer att vara engagerande från första meningen, med ett flytande språk, tydliga underrubriker och en struktur som uppmuntrar till läsning. Du är medveten om att din artikel representerar både dig själv och värd-bloggen, och du strävar alltid efter att överträffa förväntningarna med ditt bidrag.',
  Korrekturläsare: 'Agera som en professionell korrekturläsare. Din uppgift är att granska text med exceptionell noggrannhet för att identifiera och åtgärda fel inom grammatik, stavning, interpunktion, syntax och formatering. Du säkerställer att texten är felfri, konsekvent och professionell i sitt utförande.\n\nDu har ett skarpt öga för detaljer och en djupgående förståelse för språkets regler och nyanser. Du kan snabbt upptäcka inkonsekvenser i stil, terminologi eller layout, och du vet hur man korrigerar dem utan att förändra textens ursprungliga mening eller röst. Din förmåga att arbeta metodiskt och systematiskt genom större mängder text är avgörande. Du är också medveten om att anpassa dig till olika stilguider och krav som en specifik text eller klient kan ha.\n\nNär du får en text att korrekturläsa, kommer du att leverera ett dokument som är polerat, tydligt och redo för publicering. Du fokuserar på att förbättra läsbarheten och säkerställa att budskapet framgår utan störande fel, vilket bidrar till textens trovärdighet och professionalism.',
  'Programmerare för HTML, CSS och Javascript':
    'Agera som en senior fullstack-utvecklare med specialistkompetens inom HTML, CSS och JavaScript. Din uppgift är att skriva robust, effektiv och skalbar kod för webben, både på klientsidan och i integrationen med backend-system. Du har en djup förståelse för webbstandarder, bästa praxis och de senaste trenderna inom frontend-utveckling.\n\nDu kan arkitektera och implementera responsiva webbgränssnitt med ren HTML, styla dem med semantisk och modulär CSS (inklusive preprocessorer som SASS/LESS och moderna CSS-metoder som Flexbox/Grid), och lägga till dynamisk interaktivitet med avancerad JavaScript (inklusive ES6+ funktioner, ramverk/bibliotek som React/Vue/Angular, och asynkron programmering). Du förstår vikten av prestandaoptimering, tillgänglighet (WCAG) och SEO-vänlig kod.\n\nNär du får en uppgift, kommer du att leverera kod som är väldokumenterad, lätt att underhålla och optimerad för en utmärkt användarupplevelse. Du kan analysera problem, föreslå tekniska lösningar och implementera dem med precision, alltid med fokus på både funktionalitet och kodkvalitet. Din förmåga att felsöka och lösa komplexa problem i webbläsare är exceptionell.',
  Researcher: 'Agera som en expert på informationsinsamling och research. Din uppgift är att systematiskt, effektivt och tillförlitligt hitta, bedöma och sammanställa information kring ett givet ämne. Du är skicklig på att navigera i komplexa informationslandskap, identifiera trovärdiga källor och skilja relevant information från brus.\n\nDu kan formulera effektiva sökfrågor, använda avancerade sökoperatorer och utnyttja en mångfald av källor, inklusive akademiska databaser, branschrapporter, nyhetsarkiv, officiella publikationer, expertintervjuer och sociala medier. Du är expert på källkritik och kan bedöma en källas auktoritet, aktualitet och objektivitet för att säkerställa att den information du presenterar är korrekt och väl underbyggd.\n\nNär du får ett ämne att undersöka, kommer du att systematiskt bryta ner det i delkomponenter, utföra grundlig research och presentera en sammanfattning av den mest relevanta och pålitliga informationen. Du kan också identifiera kunskapsluckor och föreslå ytterligare områden för utredning. Din leverans kommer att vara strukturerad, faktabaserad och lätt att förstå, med tydliga referenser till dina källor.',
};

const languageOutputs: { [key: string]: string } = {
  Engelska: 'Trots att denna instruktion är på svenska, ska all text du producerar vara på engelska. Det är av största vikt att denna producerade texten måste följa engelska skrivregler, grammatik och stavning. Enligt Harvard Style principen.',
  Svenska: 'Skriv en text på svenska. Se till att texten följer svensk grammatik, interpunktion och stavning. Använd korrekt meningsbyggnad och idiomatiska uttryck som är naturliga för svenskan. Följ rekommendationer från instanser som Språkrådet och publikationer som Svenska Akademiens ordlista (SAOL), Svenska Akademiens grammatik (SAG) och Svenska skrivregler.',
};

const taskTypeMap: Record<string, string> = {
    'Artikel': 'Skriv en artikel för en av våra bloggar där du inte nämner kundens namn eller företag utan utgår från att vi bara vill ge läsaren ett värde',
    'Seo onpage text': 'Skriv en SEO-optimerad on-page-text för en webbsida. Texten skall vara Informativ och engagerande för målgruppen, Unik och fri från plagiarism, Ha en tydlig call-to-action (CTA). Optimera för läsbarhet med korta stycken och enkla meningar. I slutet av texten skriv en meta-titel (max 60 tecken) och en meta-beskrivning (max 160 tecken) som är lockande och innehåller huvudnyckelordet.',
    'Korrekturläsning': 'Korrekturläs följande text noggrant med fullt fokus på svensk grammatik och språkriktighet. Gå igenom texten för att identifiera och korrigera alla typer av fel. Detta inkluderar bland annat stavfel (även sär- och sammanskrivningar), grammatikfel som felaktig böjning av ord, otydlig satskonstruktion, ordföljd och tempusfel. Se också över interpunktionen och justera användningen av kommatecken, punkter, semikolon, kolon, tankstreck och bindestreck.\n\nVar uppmärksam på syftningsfel, så att pronomen och adverb otvetydigt syftar på rätt ord eller fras. Granska meningsbyggnaden för att försäkra att formuleringarna är klara och koncisa, och att det inte förekommer onödigt långa meningar eller anakoluter. Kontrollera även att det inte finns några inkonsekvenser i texten, exempelvis gällande stavning av namn, användning av siffror, förkortningar eller inkonsekvent terminologi. Fokusera även på språkriktighet och stil, vilket innefattar ordval, textens flyt och att tonen är anpassad till syftet. Slutligen, sök efter typografiska fel som dubbla mellanslag, felaktig användning av stora/små bokstäver eller indrag.\n\nMålet är att texten ska vara idiomatiskt korrekt, lättläst, begriplig och professionell på svenska. När du presenterar de föreslagna ändringarna kan du antingen visa den fullständigt korrigerade texten eller lista specifika ändringar med en kort förklaring för varje justering, exempelvis "Original: \'dom\' -> Korrigerat: \'de\' - grammatikfel, personligt pronomen". Sträva efter att bevara författarens ursprungliga stil och ton så långt det är möjligt, samtidigt som språkriktigheten garanteras.',
    'Analysera text': 'Analysera den bifogade texten noggrant utifrån ett SEO-perspektiv. Identifiera styrkor, svagheter och ge konkreta, handlingsbara rekommendationer för förbättringar. Din analys ska presenteras i punktform och täcka följande områden:\n\n1.  **Sökordsanvändning:** Bedöm hur väl primära och sekundära sökord är integrerade. Är densiteten lämplig? Finns det variation och semantiska sökord?\n2.  **Rubrikstruktur (H1, H2, H3, etc.):** Är rubrikerna logiskt strukturerade och relevanta? Innehåller de sökord?\n3.  **Läsbarhet och engagemang:** Är texten lättläst? Är styckena korta? Används punktlistor eller fetstil för att bryta upp texten?\n4.  **Meta-data:** Föreslå en optimerad meta-titel (max 60 tecken) och meta-beskrivning (max 160 tecken).\n5.  **Interna och externa länkar:** Finns det möjligheter att lägga till relevanta länkar? Är befintliga länkar optimerade?\n6.  **Sammanfattande bedömning och nästa steg:** Ge en övergripande bedömning av textens SEO-potential och lista de 3 viktigaste åtgärderna för att förbättra den.',
};

const copywritingStyleMap: Record<string, string> = {
    AIDA: `AIDA-modellen
Jag vill att denna text ska använda sig av AIDA-modellen.
Så här ska du följa stilen:
AIDA står för Attention, Interest, Desire och Action. Du ska strukturera texten i fyra delar:
1. Attention: Börja med att fånga läsarens uppmärksamhet med en intressant inledning eller en fråga.
2. Interest: Fortsätt med att förklara varför ämnet är relevant för läsaren och varför de bör fortsätta läsa.
3. Desire: Skapa ett begär genom att beskriva de positiva fördelarna och känslorna som läsaren kommer att uppleva.
4. Action: Avsluta med en tydlig uppmaning till handling, till exempel att köpa, prenumerera eller lära sig mer.`,
    'Fyra P': `Fyra P-modellen
Jag vill att denna text ska använda sig av Fyra P-modellen.
Så här ska du följa stilen:
Modellen är baserad på Picture, Promise, Prove och Push. Använd denna struktur för att bygga upp texten:
1. Picture: Skapa en mental bild av ett önskvärt resultat eller en bättre framtid för läsaren.
2. Promise: Lova att din produkt eller tjänst kan leverera det positiva resultatet du just har beskrivit.
3. Prove: Stöd ditt löfte med konkreta bevis, som exempelvis kundomdömen, betyg eller statistik.
4. Push: Avsluta med en uppmaning till handling (CTA) för att driva läsaren att agera.`,
    'Före-Efter-Bro': `Före-efter-bro-modellen
Jag vill att denna text ska använda sig av Före-efter-bro-modellen.
Så här ska du följa stilen:
Strukturen bygger på tre tydliga delar: Före, Efter och Bro. Texten ska följa denna logik:
1. Före: Beskriv läsarens nuvarande, problemfyllda situation.
2. Efter: Måla upp en bild av hur bra livet kan bli när problemet är löst.
3. Bro: Förklara hur din produkt eller tjänst fungerar som bron som tar läsaren från den problematiska "Före"-situationen till den idealiska "Efter"-situationen.`,
    PAS: `PAS-modellen
Jag vill att denna text ska använda sig av PAS-modellen.
Så här ska du följa stilen:
Denna modell, Pain, Agitation och Solution, fokuserar på att eskalera ett problem innan lösningen presenteras. Följ denna process:
1. Pain: Börja med att beskriva läsarens huvudproblem eller "smärta".
2. Agitation: Förstärk problemet genom att beskriva konsekvenserna och göra smärtan mer påtaglig.
3. Solution: Presentera din produkt eller tjänst som den ultimata lösningen som tar bort problemet helt och hållet.`,
    'Star-Story-Solution': `Star Story Solution-modellen
Jag vill att denna text ska använda sig av Star Story Solution-modellen.
Så här ska du följa stilen:
Använd storytelling för att engagera läsaren. Modellen består av tre delar: Star, Story och Solution.
1. Star: Introducera en karaktär, en "stjärna", som har ett problem som målgruppen kan känna igen sig i.
2. Story: Berätta en historia som beskriver stjärnans kamp med problemet.
3. Solution: Avsluta med att visa hur din produkt eller tjänst hjälper stjärnan att lösa problemet och uppnå sina mål.`
};

const tonalityMap: Record<string, string> = {
    'Professionell/Formell': 'Denna tonalitet ska vara saklig, objektiv och använder ofta ett mer avancerat ordförråd. undviker slang och förkortningar. för B2B-kommunikation, juridiska texter, vetenskapliga rapporter och officiella meddelanden.',
    'Vänlig/Tillgänglig': 'Skriv inbjudande och lättsam tonalitet som använder ett vardagligt språk och ofta tilltalar läsaren direkt. skapa en känsla av samhörighet.',
    'Informativ/Faktapresenterande': 'använd en tonalitet som Fokuserar på att presentera fakta och data på ett tydligt och koncist sätt. Syftet är att utbilda eller upplysa läsaren, utan att vara för säljig eller personlig.',
    'Övertygande/Säljande': 'Använd en tonalitet som engagera läsaren känslomässigt och intellektuellt för att motivera dem till en specifik handling (köp, anmälan etc.). Använder ofta starka verb, fördelar snarare än funktioner och call-to-actions.',
};

const avoidWordsMap: Record<string, string> = {
    upptäck: '"Upptäck"',
    utforska: '"Utforska"',
    oumbärligt: '"Oumbärligt"',
    särskiljt: '"Särskiljt"',
    idealiskt: '"idealiskt"',
    'central-del-av': '"central del av"',
};

export async function adaptivePromptGeneration(data: FormValues): Promise<AdaptivePromptGenerationOutput> {
  // Validate input data
  const validatedData = AdaptivePromptGenerationInputSchema.parse(data);

  let promptText = "Dessa regler nedan skall följas väldigt strikt, kolla konstant att du alltid följer det instruktioner jag ger dig här och återkom med en fråga om vad du skall göra istället för att göra något annat än vad instruktioner hänvisar. \n\n";

  if (validatedData.topicGuideline) {
    promptText += `Förhåll dig till denna information när du skriver texten: ${validatedData.topicGuideline}\n\n`;
  }

  let roleOutput = roleOutputs[validatedData.aiRole];
  if (validatedData.aiRole === 'SEO expert') {
      const firstKeyword = validatedData.primaryKeywords?.[0]?.value || '[sökords input]';
      roleOutput = roleOutput.replace('{primaryKeyword}', firstKeyword);
  }
  promptText += roleOutput + '\n\n';

  promptText += 'Strukturera texten med tydliga och relevanta rubriker (H2, H3, etc.) för att förbättra läsbarheten och SEO. Antalet rubriker och deras innehåll ska vara logiskt anpassade till textens längd och komplexitet. Rubrikerna skall följa svenska skrivregler.\n\n';

  const taskTypeInstruction = validatedData.taskTypeRadio === 'custom'
    ? validatedData.taskTypeCustom
    : validatedData.taskTypeRadio ? taskTypeMap[validatedData.taskTypeRadio] : '';
    
  if (taskTypeInstruction) {
      promptText += `Din uppgift är att: ${taskTypeInstruction}\n\n`;
  }

  if (validatedData.copywritingStyle && validatedData.copywritingStyle !== 'none') {
      promptText += `Använd följande copywriting-stil: \n${copywritingStyleMap[validatedData.copywritingStyle]}\n\n`;
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
      const lowerBound = textLengthNum - 50;
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
    promptText += `När du skriver denna text, utgå från denna sida, i detta fall: ${validatedData.websiteUrl}, som texten ska publiceras på, Ta hänsyn till sidans syfte, målgrupp och innehåll, så att texten passar in naturligt.\n\n`;
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

    

    

