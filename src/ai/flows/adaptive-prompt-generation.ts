
'use server';

/**
 * @fileOverview This file defines a Genkit flow for adaptive prompt generation.
 *
 * - adaptivePromptGeneration - A function that generates an AI prompt based on user input, intelligently including/excluding constraints and formatting.
 * - AdaptivePromptGenerationOutput - The return type for the adaptivePromptGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { FormValues } from '@/components/prompt-form';

const AdaptivePromptGenerationOutputSchema = z.object({
  prompt: z.string().describe('The generated AI prompt.'),
});
export type AdaptivePromptGenerationOutput = z.infer<typeof AdaptivePromptGenerationOutputSchema>;

export async function adaptivePromptGeneration(input: FormValues): Promise<AdaptivePromptGenerationOutput> {
  const result = await adaptivePromptGenerationFlow(input);
  return { prompt: result };
}

const roleOutputs: { [key: string]: string } = {
  Copywriter: 'Agera som en professionell copywriter med expertis inom att skapa övertygande och engagerande text för en mängd olika plattformar och målgrupper. Ditt mål är att producera text som inte bara informerar, utan också inspirerar, underhåller och motiverar till handling. Du förstår vikten av att anpassa ton, stil och budskap baserat på syftet med texten, målgruppen och den kanal den ska publiceras i (t.ex. webbsidor, sociala medier, annonser, e-postutskick). När du får en uppgift, kommer du att analysera målet med kommunikationen, identifiera den primära målgruppen och föreslå de bästa sätten att fånga deras uppmärksamhet och driva önskat resultat. Din text ska vara tydlig, koncis och slagkraftig, med ett starkt fokus på att leverera värde och lösa problem för läsaren. Du är också skicklig på att integrera relevanta sökord naturligt och effektivt för SEO-ändamål, samtidigt som du bibehåller ett flytande och engagerande språk. När du skriver, tänk på att använda aktiva verb, starka adjektiv och fängslande rubriker för att maximera effekte',
  'SEO expert': 'Agera som en expert på att skriva SEO-vänlig text. Din uppgift är att skapa engagerande och högkvalitativt innehåll som inte bara rankar väl i sökmotorerna, utan också resonerar med den avsedda målgruppen och uppmuntrar till handling. Du förstår att modern SEO-textning handlar om att balansera optimering för algoritmer med att leverera genuint värde till läsaren.\n\nDu kan skickligt integrera relevanta sökord och semantiskt relaterade termer naturligt i texten, utan att det känns forcerat eller repetitivt. Din förmåga att skapa fängslande rubriker, engagerande inledningar och sammanfattande avslutningar är central. Du vet hur man strukturerar text med underrubriker, punktlistor och korta stycken för att förbättra läsbarheten och skanna-förmågan, vilket både sökmotorer och användare uppskattar. Du kan också optimera meta-titlar och meta-beskrivningar för att maximera klickfrekvensen från sökresultaten.\n\nNär du får en uppgift, kommer du att analysera målgruppens sökintention, identifiera de viktigaste sökorden och sedan producera en text som är informativ, övertygande och optimerad för maximal synlighet. Din text kommer att vara tydlig, koncis och slagkraftig, med fokus på att lösa användarens problem och positionera innehållet som en auktoritet inom ämnet.',
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
};

const writingForMap: Record<string, string> = {
    'Kund': 'Vi skriver denna text för en av våra kunder som skall publiceras på något vis på deras webbplats.',
    'Vår blogg': 'Vi skriver denna text för en av våra bloggar. Dessa bloggar har som syfte att bidra med informativ information kring ämne i denna text. Men även ha ett syfte av att inkludera viktiga externlänkar.'
};

const copywritingStyleMap: Record<string, string> = {
    'AIDA': `### **1. AIDA-modellen**
Jag vill att denna text ska använda sig av AIDA-modellen.

**Så här ska du följa stilen:**
AIDA står för **Attention**, **Interest**, **Desire** och **Action**. Du ska strukturera texten i fyra delar:
1.  **Attention:** Börja med att fånga läsarens uppmärksamhet med en intressant inledning eller en fråga.
2.  **Interest:** Fortsätt med att förklara varför ämnet är relevant för läsaren och varför de bör fortsätta läsa.
3.  **Desire:** Skapa ett begär genom att beskriva de positiva fördelarna och känslorna som läsaren kommer att uppleva.
4.  **Action:** Avsluta med en tydlig uppmaning till handling, till exempel att köpa, prenumerera eller lära sig mer.`,
    'Fyra P': `### **2. Fyra P-modellen**
Jag vill att denna text ska använda sig av Fyra P-modellen.

**Så här ska du följa stilen:**
Modellen är baserad på **Picture**, **Promise**, **Prove** och **Push**. Använd denna struktur för att bygga upp texten:
1.  **Picture:** Skapa en mental bild av ett önskvärt resultat eller en bättre framtid för läsaren.
2.  **Promise:** Lova att din produkt eller tjänst kan leverera det positiva resultatet du just har beskrivit.
3.  **Prove:** Stöd ditt löfte med konkreta bevis, som exempelvis kundomdömen, betyg eller statistik.
4.  **Push:** Avsluta med en uppmaning till handling (**CTA**) för att driva läsaren att agera.`,
    'Före-Efter-Bro': `### **3. Före-efter-bro-modellen**
Jag vill att denna text ska använda sig av Före-efter-bro-modellen.

**Så här ska du följa stilen:**
Strukturen bygger på tre tydliga delar: **Före**, **Efter** och **Bro**. Texten ska följa denna logik:
1.  **Före:** Beskriv läsarens nuvarande, problemfyllda situation.
2.  **Efter:** Måla upp en bild av hur bra livet kan bli när problemet är löst.
3.  **Bro:** Förklara hur din produkt eller tjänst fungerar som bron som tar läsaren från den problematiska "Före"-situationen till den idealiska "Efter"-situationen.`,
    'PAS': `### **4. PAS-modellen**
Jag vill att denna text ska använda sig av PAS-modellen.

**Så här ska du följa stilen:**
Denna modell, **Pain**, **Agitation** och **Solution**, fokuserar på att eskalera ett problem innan lösningen presenteras. Följ denna process:
1.  **Pain:** Börja med att beskriva läsarens huvudproblem eller "smärta".
2.  **Agitation:** Förstärk problemet genom att beskriva konsekvenserna och göra smärtan mer påtaglig.
3.  **Solution:** Presentera din produkt eller tjänst som den ultimata lösningen som tar bort problemet helt och hållet.`,
    'Star-Story-Solution': `### **5. Star Story Solution-modellen**
Jag vill att denna text ska använda sig av Star Story Solution-modellen.

**Så här ska du följa stilen:**
Använd storytelling för att engagera läsaren. Modellen består av tre delar: **Star**, **Story** och **Solution**.
1.  **Star:** Introducera en karaktär, en "stjärna", som har ett problem som målgruppen kan känna igen sig i.
2.  **Story:** Berätta en historia som beskriver stjärnans kamp med problemet.
3.  **Solution:** Avsluta med att visa hur din produkt eller tjänst hjälper stjärnan att lösa problemet och uppnå sina mål.`
};


const adaptivePromptGenerationFlow = ai.defineFlow(
  {
    name: 'adaptivePromptGenerationFlow',
    inputSchema: z.any(), // Using "any" because the schema is defined and validated in the form component.
    outputSchema: z.string(),
  },
  async (data: FormValues) => {
    let promptText = "Dessa regler nedan skall följas väldigt strikt, kolla konstant att du alltid följer det instruktioner jag ger dig här och återkom med en fråga om vad du skall göra istället för att göra något annat än vad instruktioner hänvisar. \n\n";

    if (data.topicGuideline) {
      promptText += `Förhåll dig till denna information när du skriver texten: ${data.topicGuideline}\n\n`;
    }

    promptText += roleOutputs[data.aiRole] + '\n\n';

    const taskType = data.taskTypeRadio === 'custom'
      ? data.taskTypeCustom
      : taskTypeMap[data.taskTypeRadio];
    if (taskType) {
      promptText += `Din uppgift är att: ${taskType}\n\n`;
    }

    if (!data.copywritingStyle_disabled && data.copywritingStyle && data.copywritingStyle !== 'none') {
        promptText += `Använd följande copywriting-stil: \n${copywritingStyleMap[data.copywritingStyle]}\n\n`;
    }

    if (!data.tonality_disabled && data.tonality && data.tonality.length > 0) {
      promptText += `Tonaliteten ska vara: ${data.tonality.join(', ')}\n\n`;
    }

    if (!data.textLength_disabled && data.textLength) {
      const textLengthNum = parseInt(data.textLength, 10);
      if (!isNaN(textLengthNum)) {
        const lowerBound = textLengthNum - 50;
        promptText += `Längd på denna text skall vara ${textLengthNum}, och skall hållas till detta så gott det går. Texten får ej överskridas mer än med 20 ord och får ej vara mindre än ${lowerBound} ord.\n\n`;
      }
    }
    
    if (!data.lists_disabled) {
      if (data.excludeLists) {
        promptText += 'Texten får inte innehålla några listor alls.\n\n';
      } else if (data.numberOfLists) {
        const numberOfListsNum = parseInt(data.numberOfLists, 10);
        if (!isNaN(numberOfListsNum)) {
          promptText += `Texten får bara ha ${numberOfListsNum} antal listor i alla dess former\n\n`;
        }
      }
    }

    promptText += languageOutputs[data.language] + '\n\n';

    if (!data.writingFor_disabled) {
      const writingFor = data.writingForRadio === 'custom'
        ? data.writingForCustom
        : writingForMap[data.writingForRadio];
      if (writingFor) {
        promptText += `Vi skriver denna text för: ${writingFor}\n\n`;
      }
    }

    if (!data.rules_disabled) {
      const rules: string[] = [];
      if (data.rules.avoidSuperlatives) rules.push('Undvik superlativ');
      if (data.rules.avoidPraise) rules.push('Undvik lovord');
      if (data.rules.avoidAcclaim) rules.push('Undvik beröm.');
      if (data.rules.isInformative) rules.push('Texten skall vara informativ med fokus på att ge läsaren kunskap för ämnet');
      if (data.rules.useWeForm) rules.push('Skriv i vi-form, som att vi är företaget.');
      if (data.rules.addressReaderAsYou) rules.push('Läsaren skall benämnas som ni.');
      if (data.rules.avoidWords.enabled && data.rules.avoidWords.words.length > 0) {
          rules.push(`Texten får aldrig innehålla orden: ${data.rules.avoidWords.words.join(', ')}`);
      }
      if (data.rules.avoidXYPhrase) rules.push('skriv aldrig en mening som liknar eller är i närheten av detta “...i en X värld/industri/område är “sökordet” värdefullt för Y anledning”');
      if (data.rules.customRules) {
          rules.push(...data.rules.customRules.split('\n').filter(rule => rule.trim() !== ''));
      }

      if (rules.length > 0) {
        promptText += `Regler för texten: ${rules.join(', ')}\n\n`;
      }
    }

    if (!data.links_disabled && data.links && data.links.length > 0) {
      data.links.forEach(link => {
        if (link.url && link.anchorText)
          promptText += `Lägg in hyperlänkar i texten, länken är: ${link.url}. På detta sökord: ${link.anchorText}\n\n`;
      });
    }

    if (!data.primaryKeyword_disabled && data.primaryKeyword) {
      promptText += `Denna text skall innehålla ${data.primaryKeyword} 1% av textens totala antal ord.\n\n`;
    }

    if (!data.author_disabled && data.author) {
      promptText += `Denna texten är skriven av ${data.author} och kan nämnas i en CTA.\n\n`;
    } else if (!data.author_disabled) {
      promptText += 'Texten skall skrivas ut ett neutralt perspektiv där vi som skriver inte benämns.\n\n';
    }

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: promptText,
    });
    
    return result.text;
  }
);

    
