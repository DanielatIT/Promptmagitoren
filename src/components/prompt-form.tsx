"use client";

import { useFormContext, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Trash2 } from "lucide-react"
import { FormSection } from './form-section';

const aiRoleOptions = [
    'Copywriter', 'SEO expert', 'Skribent för bloggar', 'Korrekturläsare', 'Programmerare för HTML, CSS och Javascript', 'Researcher'
] as const;

const taskTypeRadioOptions = ['Artikel', 'Seo onpage text', 'Korrekturläsning'] as const;

const tonalityOptions = [
    { id: 'professional', label: 'Professionell/Formell' },
    { id: 'friendly', label: 'Vänlig/Tillgänglig' },
    { id: 'informative', label: 'Informativ/Faktapresenterande' },
    { id: 'persuasive', label: 'Övertygande/Säljande' },
] as const;

const writingForRadioOptions = ['Kund', 'Vår blogg'] as const;

const avoidWordsOptions = [
    { id: 'Upptäck', label: 'Upptäck' },
    { id: 'Utforska', label: 'Utforska' },
    { id: 'Oumbärligt', label: 'Oumbärligt' },
    { id: 'Särskiljt', label: 'Särskiljt' },
    { id: 'idealiskt', label: 'idealiskt (och dess böjningsformer)' },
];

export const formSchema = z.object({
  topicGuideline: z.string().min(1, 'Detta fält är obligatoriskt.'),
  aiRole: z.enum(aiRoleOptions),
  taskTypeRadio: z.enum([...taskTypeRadioOptions, 'custom']),
  taskTypeCustom: z.string().optional(),
  
  tonality: z.array(z.string()).optional(),
  tonality_disabled: z.boolean().default(false),
  
  textLength: z.string().optional(),
  textLength_disabled: z.boolean().default(false),
  
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().default(false),
  lists_disabled: z.boolean().default(false),
  
  language: z.enum(['Engelska', 'Svenska']),
  
  writingForRadio: z.enum([...writingForRadioOptions, 'custom']),
  writingForCustom: z.string().optional(),
  writingFor_disabled: z.boolean().default(false),

  rules: z.object({
    avoidSuperlatives: z.boolean().default(true),
    avoidPraise: z.boolean().default(true),
    avoidAcclaim: z.boolean().default(true),
    isInformative: z.boolean().default(true),
    useWeForm: z.boolean().default(true),
    addressReaderAsYou: z.boolean().default(true),
    avoidWords: z.object({
        enabled: z.boolean().default(true),
        words: z.array(z.string()).default(['Upptäck', 'Utforska', 'Oumbärligt', 'Särskiljt', 'idealiskt']),
    }),
    avoidXYPhrase: z.boolean().default(true),
    customRules: z.string().optional(),
  }),
  rules_disabled: z.boolean().default(false),
  
  links: z.array(z.object({ url: z.string().url("Invalid URL format"), anchorText: z.string().min(1, "Anchor text is required") })).optional(),
  links_disabled: z.boolean().default(false),

  primaryKeyword: z.string().optional(),
  primaryKeyword_disabled: z.boolean().default(false),
  
  author: z.string().optional(),
  author_disabled: z.boolean().default(false),

}).superRefine((data, ctx) => {
    if (data.taskTypeRadio === 'custom' && (!data.taskTypeCustom || data.taskTypeCustom.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Beskrivning av texttyp är obligatoriskt när 'Annan...' är valt.",
        path: ['taskTypeCustom'],
      });
    }
    if (data.writingForRadio === 'custom' && (!data.writingForCustom || data.writingForCustom.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Detta fält är obligatoriskt när 'Annan...' är valt.",
        path: ['writingForCustom'],
      });
    }
  });


export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: Partial<FormValues> = {
  topicGuideline: '',
  aiRole: 'Copywriter',
  taskTypeRadio: 'Artikel',
  taskTypeCustom: '',
  tonality: [],
  tonality_disabled: false,
  textLength: '',
  textLength_disabled: false,
  numberOfLists: '',
  excludeLists: false,
  lists_disabled: false,
  language: 'Svenska',
  writingForRadio: 'Kund',
  writingForCustom: '',
  writingFor_disabled: false,
  rules: {
    avoidSuperlatives: true,
    avoidPraise: true,
    avoidAcclaim: true,
    isInformative: true,
    useWeForm: true,
    addressReaderAsYou: true,
    avoidWords: {
        enabled: true,
        words: ['Upptäck', 'Utforska', 'Oumbärligt', 'Särskiljt', 'idealiskt'],
    },
    avoidXYPhrase: true,
    customRules: '',
  },
  rules_disabled: false,
  links: [],
  links_disabled: false,
  primaryKeyword: '',
  primaryKeyword_disabled: false,
  author: '',
  author_disabled: false,
};

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

export function generateInitialPrompt(data: FormValues): { prompt: string } {
  let prompt = "Dessa regler nedan skall följas väldigt strikt, kolla konstant att du alltid följer det instruktioner jag ger dig här och återkom med en fråga om vad du skall göra istället för att göra något annat än vad instruktioner hänvisar. \n\n";

  if (data.topicGuideline) {
    prompt += `Förhåll dig till denna information när du skriver texten: ${data.topicGuideline}\n\n`;
  }

  prompt += roleOutputs[data.aiRole] + '\n\n';

  const taskType = data.taskTypeRadio === 'custom'
    ? data.taskTypeCustom
    : taskTypeMap[data.taskTypeRadio];
  if (taskType) {
    prompt += `Din uppgift är att: ${taskType}\n\n`;
  }

  if (!data.tonality_disabled && data.tonality && data.tonality.length > 0) {
    prompt += `Tonaliteten ska vara: ${data.tonality.join(', ')}\n\n`;
  }

  if (!data.textLength_disabled && data.textLength) {
    const textLengthNum = parseInt(data.textLength, 10);
    if (!isNaN(textLengthNum)) {
      const lowerBound = textLengthNum - 50;
      prompt += `Längd på denna text skall vara ${textLengthNum}, och skall hållas till detta så gott det går. Texten får ej överskridas mer än med 20 ord och får ej vara mindre än ${lowerBound} ord.\n\n`;
    }
  }
  
  if (!data.lists_disabled) {
    if (data.excludeLists) {
      prompt += 'Texten får inte innehålla några listor alls.\n\n';
    } else if (data.numberOfLists) {
      const numberOfListsNum = parseInt(data.numberOfLists, 10);
      if (!isNaN(numberOfListsNum)) {
        prompt += `Texten får bara ha ${numberOfListsNum} antal listor i alla dess former\n\n`;
      }
    }
  }


  prompt += languageOutputs[data.language] + '\n\n';

  if (!data.writingFor_disabled) {
    const writingFor = data.writingForRadio === 'custom'
      ? data.writingForCustom
      : writingForMap[data.writingForRadio];
    if (writingFor) {
      prompt += `Vi skriver denna text för: ${writingFor}\n\n`;
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
      prompt += `Regler för texten: ${rules.join(', ')}\n\n`;
    }
  }

  if (!data.links_disabled && data.links && data.links.length > 0) {
    data.links.forEach(link => {
      if (link.url && link.anchorText)
        prompt += `Lägg in hyperlänkar i texten, länken är: ${link.url}. På detta sökord: ${link.anchorText}\n\n`;
    });
  }

  if (!data.primaryKeyword_disabled && data.primaryKeyword) {
    prompt += `Denna text skall innehålla ${data.primaryKeyword} 1% av textens totala antal ord.\n\n`;
  }

  if (!data.author_disabled && data.author) {
    prompt += `Denna texten är skriven av ${data.author} och kan nämnas i en CTA.\n\n`;
  } else if (!data.author_disabled) {
    prompt += 'Texten skall skrivas ut ett neutralt perspektiv där vi som skriver inte benämns.\n\n';
  }

  return { prompt };
}

function TaskTypeSection() {
    const { control } = useFormContext<FormValues>();
    
    return (
        <FormSection title="Vad skall AIn aggera som?" required>
            <FormField
                control={control}
                name="aiRole"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-4"
                            >
                                {aiRoleOptions.map((role) => (
                                    <FormItem key={role} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={role} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{role}</FormLabel>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormSection>
    )
}

function AIActionSection() {
    const { control } = useFormContext<FormValues>();
    const taskTypeRadio = useWatch({ control, name: "taskTypeRadio" });
    
    return (
         <FormSection title="Vilken typ av text som skall produceras" required>
            <FormField
                control={control}
                name="taskTypeRadio"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormControl>
                             <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                            >
                                {[...taskTypeRadioOptions, 'custom'].map((task) => (
                                    <FormItem key={task} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={task} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{task === 'custom' ? 'Annan...' : task}</FormLabel>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {taskTypeRadio === 'custom' && (
                <FormField
                    control={control}
                    name="taskTypeCustom"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <FormControl>
                                <Textarea placeholder="Beskriv typen av text..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </FormSection>
    )
}

export function PromptForm() {
    const { control, setValue, getValues } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "links",
    });
    
    const writingForRadio = useWatch({ control, name: "writingForRadio" });
    const avoidWordsEnabled = useWatch({ control, name: "rules.avoidWords.enabled" });
    
    const values = useWatch({ control });

    const toggleDisabled = (fieldName: keyof FormValues) => {
        setValue(fieldName, !getValues(fieldName));
    }


    return (
        <div className="space-y-6">
            <FormSection title="Förklara vad texten skall handla om" required>
                <FormField
                    control={control}
                    name="topicGuideline"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder="All information som AI:n behöver för att kunna skriva texten..." {...field} rows={6} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaskTypeSection />
                <AIActionSection />
            </div>

            <FormSection title="Vilken tonalitet ska texten ha?" onToggle={() => toggleDisabled('tonality_disabled')} isDisabled={values.tonality_disabled}>
                <FormField
                    control={control}
                    name="tonality"
                    render={() => (
                        <FormItem className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tonalityOptions.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={control}
                                    name="tonality"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.label)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.label])
                                                            : field.onChange(field.value?.filter((value) => value !== item.label));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </FormItem>
                    )}
                />
            </FormSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSection title="Längd på texten" onToggle={() => toggleDisabled('textLength_disabled')} isDisabled={values.textLength_disabled}>
                    <FormField
                        control={control}
                        name="textLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximalt antal ord</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="t.ex. 500" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </FormSection>
                
                <FormSection title="Antal listor" onToggle={() => toggleDisabled('lists_disabled')} isDisabled={values.lists_disabled}>
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="numberOfLists"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximalt antal listor</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="t.ex. 2" {...field} disabled={getValues('excludeLists')} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="excludeLists"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Exkludera listor helt</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </FormSection>
            </div>

            <FormSection title="Språk">
                <FormField
                    control={control}
                    name="language"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel className={field.value === 'Svenska' ? 'text-foreground' : 'text-muted-foreground'}>Svenska</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value === 'Engelska'}
                                    onCheckedChange={(checked) => field.onChange(checked ? 'Engelska' : 'Svenska')}
                                />
                            </FormControl>
                            <FormLabel className={field.value === 'Engelska' ? 'text-foreground' : 'text-muted-foreground'}>Engelska</FormLabel>
                        </FormItem>
                    )}
                />
            </FormSection>

            <FormSection title="Vilka skriver vi för?" onToggle={() => toggleDisabled('writingFor_disabled')} isDisabled={values.writingFor_disabled}>
                <FormField
                    control={control}
                    name="writingForRadio"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                 <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    {[...writingForRadioOptions, 'custom'].map((item) => (
                                        <FormItem key={item} className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value={item} /></FormControl>
                                            <FormLabel className="font-normal">{item === 'custom' ? 'Annan...' : item}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
                {writingForRadio === 'custom' && (
                    <FormField
                        control={control}
                        name="writingForCustom"
                        render={({ field }) => (
                            <FormItem className="mt-4"><FormControl><Textarea placeholder="Beskriv målgruppen..." {...field} /></FormControl><FormMessage/></FormItem>
                        )}
                    />
                )}
            </FormSection>

            <FormSection title="Regler på texten" onToggle={() => toggleDisabled('rules_disabled')} isDisabled={values.rules_disabled}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={control} name="rules.avoidSuperlatives" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik superlativ</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidPraise" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik lovord</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidAcclaim" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik beröm</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.isInformative" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Informativ text</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.useWeForm" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Skriv i vi-form</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.addressReaderAsYou" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Benämn läsaren som "ni"</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidXYPhrase" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik "i en X är Y värdefullt..."</FormLabel></FormItem>)} />
                    </div>
                    <div>
                        <FormField control={control} name="rules.avoidWords.enabled" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik specifika ord</FormLabel></FormItem>)} />
                        {avoidWordsEnabled && (
                            <div className="pl-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Controller
                                    name="rules.avoidWords.words"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                        {avoidWordsOptions.map(word => (
                                            <FormItem key={word.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(word.id)}
                                                    onCheckedChange={checked => {
                                                        const newValue = checked
                                                            ? [...(field.value || []), word.id]
                                                            : (field.value || []).filter(v => v !== word.id);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{word.label}</FormLabel>
                                            </FormItem>
                                        ))}
                                        </>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                    <FormField control={control} name="rules.customRules" render={({ field }) => (<FormItem><FormLabel>Fler regler</FormLabel><FormControl><Textarea placeholder="Lägg till egna regler, en per rad..." {...field} /></FormControl></FormItem>)} />
                </div>
            </FormSection>

            <FormSection title="Länkar att inkludera" onToggle={() => toggleDisabled('links_disabled')} isDisabled={values.links_disabled}>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                            <FormField control={control} name={`links.${index}.url`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={control} name={`links.${index}.anchorText`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Sökord</FormLabel><FormControl><Input {...field} placeholder="Sökord att länka" /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ url: '', anchorText: '' })}><Plus className="mr-2 h-4 w-4" /> Lägg till länk</Button>
                </div>
            </FormSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSection title="Primärt sökord/sökfras" onToggle={() => toggleDisabled('primaryKeyword_disabled')} isDisabled={values.primaryKeyword_disabled}>
                    <FormField control={control} name="primaryKeyword" render={({ field }) => (<FormItem><FormControl><Input placeholder="t.ex. bästa SEO-tipsen" {...field} /></FormControl></FormItem>)} />
                </FormSection>

                <FormSection title="Vem skriver texten?" onToggle={() => toggleDisabled('author_disabled')} isDisabled={values.author_disabled}>
                    <FormField control={control} name="author" render={({ field }) => (<FormItem><FormControl><Input placeholder="Ditt namn eller företagsnamn" {...field} /></FormControl></FormItem>)} />
                </FormSection>
            </div>

            <Button type="submit" className="w-full">
                Förhandsgranska
            </Button>
        </div>
    );
}
