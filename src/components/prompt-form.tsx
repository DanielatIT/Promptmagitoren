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
import { X, Plus, Trash2, Info } from "lucide-react"
import { FormSection } from './form-section';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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

const copywritingStyles = [
    {
        id: 'AIDA',
        label: 'AIDA-modellen',
        tooltip: `AIDA kommer från de engelska orden Attention, Interest, Desire och Action. Med AIDA lär du dig skriva på ett klassiskt vis med en beprövad struktur. Detta betyder varje bokstav i AIDA:

Attention (uppmärksamhet): Fånga dina läsares uppmärksamhet med en intressant introduktion.
Interest (intresse): Berätta varför läsaren borde fortsätta läsa.
Desire (begär): Skapa ett begär hos läsaren att göra något. Det kan till exempel vara att följa din sida, köpa en produkt eller prenumerera på ett nyhetsbrev.
Action (handling): Nu kan du använda en CTA-knapp för att dra nytta av läsarens intresse.
Exempel med AIDA-modellen
För att göra AIDA-modellen lite enklare att förstå ska vi ta ett exempel. Säg att du driver en webshop där du säljer växter och trädgårdstillbehör. Du har lanserat en ny självvattnande balkonglåda som du vill sälja. Såhär kan din hemsida se ut:

Attention: Vem vattnar växterna på din balkong när du är på semester?

Interest: Här är vår nya serie av självvattnande balkonglådor! De håller dina växter fina och gröna i upp till en månad, utan att du behöver röra ett finger. Kom aldrig hem till vissna blommor igen!

Desire: Tänk dig en sommar på en båt mellan öar i Grekland. Du kan njuta utan att oroa dig för din fina hortensia, som njuter av sommaren på din balkong. Om grannen också är på semester och inte kan hjälpa till att vattna gör det inget – din självbevattnande blomlåda gör jobbet!

Action: Bli aldrig besviken på vissna blommor igen – beställ din självvattnande balkonglåda idag!

Fördelar
✅ Enkel att komma ihåg och jobba med.
✅ Fångar läsarens intresse.
✅ Gör det tydligt för läsaren vilken handling de ska göra.

Nackdelar
❌ Kan vara svår att använda för nyanserad kommunikation.
❌ Kan vara ineffektiv vid mer komplex kommunikation.`,
    },
    {
        id: 'Fyra P',
        label: 'Fyra P-modellen',
        tooltip: `Här kommer ännu en klassisk skrivmodell! Fyra P används på flera sätt inom marknadsföring. Fyra P kan dels handla om en modell för marknadsföringsmix men i detta fallet pratar vi om Fyra P för copywriting. Dessa Fyra P är engelskans: Picture, Promise, Prove och Push. Vi ska förklara:

Picture (föreställ): Du börjar med att skapa en bild av ett positivt resultat eller en bra framtid för ett nuvarande problem.
Promise (utlova): Du fortsätter genom att berätta hur din produkt eller tjänst kan ge det positiva resultat som läsaren föreställer sig.
Prove (bevisa): Bevisa att ditt löfte stämmer. Presentera konkreta bevis på att du kan uppfylla dina löften och att din produkt eller tjänst kan leverera det du lovar.
Push (driv): Använd en CTA för att ta läsaren till handling.
Exempel med Fyra P
I detta exempel ska vi ta en titt på en restaurang som nyligen lanserade sin sommarmeny. Restaurangen skickar ut marknadsföringsmail och använder Fyra P som skrivmodell för sin copy.

Picture: Ämnesrad: Njut av sommarmenyn på vår soliga takterrass
Du, dina närmaste vänner, handskalade räkor, eftermiddagssol, bra musik och en kall rosé. Kan du se det framför dig?

Promise: Nu har vi lanserat vår helt nya sommarmeny med härligt somriga rätter såsom handskalade räkor med aioli, vit sparris med vitlökssmör och moules frites. Sommarfavoriten laxburgare är dessutom tillbaka på menyn och du kan sätta ihop din egen trerätters-middag för bara 375 kronor. Ja, NU är det sommar!

Prove: Våra gäster älskar oss och särskilt vår sommarterrass! Läs gärna några av våra omdömen från Google Maps, där vi har 4,8 av 5 i betyg från 338 gäster.

Push: Terrassen blir snabbt full så skynda dig att boka nu. Om du bokar senast 2 juni får du dessutom 10 procent rabatt på en trerättersmeny.

Fördelar
✅ Det är enkelt för läsaren att snabbt se fördelarna med något.
✅ Sociala bevis fungerar bra för att skapa varumärkesförtroende.
✅ Kan användas för både texter och videor.

Nackdelar
❌ Kräver att du vet något om målgrupper.
❌ Fungerar bäst för etablerade företag som redan har sociala bevis.`,
    },
    {
        id: 'Före-Efter-Bro',
        label: 'Före-efter-bro-modellen',
        tooltip: `Med denna skrivmodell är det enkelt att skriva och den kan vara mycket effektiv. Namnet ”Före – efter – bro” kommer av att skribenten presenterar ett problem, visar hur bra livet blir efter lösningen och berättar sedan hur läsaren kan ta del av lösningen. Såhär fungerar den:

Före: Beskriv läsarens nuvarande verklighet och de problem som hen har.
Efter: Berätta hur bra framtiden kan vara när problemet är löst.
Bro: Berätta hur din produkt eller tjänst kan ta läsaren till en ljus framtid.
Exempel med Före – efter – bro
I detta exempel ska vi ta en titt på en webshop som säljer prenumerationer på grönsakslådor som levereras varje vecka. Butiken har skapat en annons för Facebook med hjälp av Före – efter – bro-modellen.

Före: Du vet nog vad vi pratar om. Du står på ICA efter en lång arbetsdag och behöver välja grönsaker för hela veckan. Inspirationen är inte på topp så det blir som vanligt: gurka, tomat, paprika och ett salladshuvud.

Efter: Tänk dig istället att när du kommer hem från jobbet på måndag eftermiddag så får du en låda med färska grönsaker levererade till din dörr. Utöver tomater och en gurka får du lokalt odlad pak choi, spenat, kålrabbi, vitkål, sallat och mycket mer!

Bro: Prenumerera på Baras Mångfaldsodling för att få din första leverans inom bara två veckor. CTA: Välj din grönsakslåda.

Fördelar
✅ Enkelt för copywritern.
✅ Läsaren får läsa om ett problem som de kan relatera till.
✅ Det är enkelt för läsaren att förstå.

Nackdelar
❌ Inte särskilt anpassningsbart.`,
    },
    {
        id: 'PAS',
        label: 'PAS-modellen',
        tooltip: `PAS står för engelskans Pain, Agitation och Solution. Detta är en skrivmodell som används flitigt inom marknadsföring. Såhär fungerar PAS:

Pain (smärta): Du börjar med att beskriva din målgrupps största och viktigaste problem.
Agitation (reta): Du fortsätter med att konkretisera problemet genom att använda ord som associeras med problemet för läsaren. Det ökar behovet av en lösning.
Solution (lösning): Slutligen presenteras lösningen. Berätta hur din produkt eller tjänst löser deras problem och hur ”smärtan” kan försvinna.
Exempel med PAS-modellen
Pain: Är du trött på trötta fötter och dåliga joggingturer?

Agitation: Det är svårt att sätta personbästa när man har blåsor på fötterna. Det blir lätt att hitta ursäkter och ligga kvar i soffan.

Solution: Med högteknologiska sulor som var specifikt designade för dig och dina steg blir du av med trötta fötter för alltid. Spring längre, snabbare och utan blåsor. CTA: Skapa anpassade sulor för dina fötter

Fördelar
✅ Modellen gör det enkelt att vara konkret.
✅ Lösningen är mer tillfredsställande när problemet känns större.
✅ Kan användas för många olika situationer.

Nackdelar
❌ Ett stort fokus på problem kan överskugga fördelarna med en lösning.`,
    },
    {
        id: 'Star-Story-Solution',
        label: 'Star Story Solution-modellen',
        tooltip: `Star Story Solution är en skrivmodell som gör det enkelt att skapa texter som fokuserar på storytelling. Det är detta fokus som gör denna skrivmodell så bra. Såhär fungerar den:

Star (stjärna): Introducera stjärnan i berättelsen. Det kan vara en verklig person eller påhittad karaktär som har ett problem som läsaren kan känna igen sig i.
Story (berättelse): En berättelse presenteras, med stjärnan i centrum.
Solution (lösning): Här är ditt mål att visa hur stjärnan löser sitt problem med hjälp av en produkt eller tjänst.
Exempel med Star Story Solution
Vi kan ta ett exempel med ett företag som erbjuder anpassade måltider för personer med allergier eller andra specialdieter. Företaget har intervjuat nöjda kunder och har skapat en kundberättelse med bilder och texter.

Star: Detta är Sara. Sara är vegetarian och är allergisk mot nötter, baljväxter, tomater och soja.

Story: Det är viktigt för Sara att leva ett hälsosamt liv med en balanserad kost. Hon äter därför ofta samma rätt, om och om igen. Hon lägger flera timmar varje vecka på att se till att hon får vad hon behöver. Hon är trött på att känna att varje måltid är en närmast omöjlig uppgift. Nu har hon hittat MealHacker.

Solution: Med en prenumeration på MealHacker får Sara ett paket varje månad med måltidsförslag och testade recept som passar hennes allergier och preferenser. Bakom hennes måltidsförslag står dietister, läkare och kockar som jobbar tillsammans för att skapa goda, näringsrika och säkra recept för Sara. Sara är särskilt nöjd med att MealHacker kan anpassa hennes måltid för att öka hennes proteinintag, vilket hjälper för att uppnå hennes träningsmål.

Fördelar
✅ Personen i berättelsen får texten att kännas mer personlig.
✅ Storytelling fångar läsarens uppmärksamhet.
✅ Det är enkelt att skapa en mer nyanserad berättelse.

Nackdelar
❌ Passar inte lika bra för korta texter.
❌ Valet av person kan ha stor betydelse för målgruppen.`,
    },
] as const;


export const formSchema = z.object({
  topicGuideline: z.string().min(1, 'Detta fält är obligatoriskt.'),
  aiRole: z.enum([
    'Copywriter', 'SEO expert', 'Skribent för bloggar', 'Korrekturläsare', 'Programmerare för HTML, CSS och Javascript', 'Researcher'
  ]),
  taskTypeRadio: z.enum(['Artikel', 'Seo onpage text', 'Korrekturläsning', 'custom']),
  taskTypeCustom: z.string().optional(),
  
  copywritingStyle: z.string().optional(),
  copywritingStyle_disabled: z.boolean().default(false),
  
  tonality: z.array(z.string()).optional(),
  tonality_disabled: z.boolean().default(false),
  
  textLength: z.string().optional(),
  textLength_disabled: z.boolean().default(false),
  
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().default(false),
  lists_disabled: z.boolean().default(false),
  
  language: z.enum(['Engelska', 'Svenska']),
  
  writingForRadio: z.enum(['Kund', 'Vår blogg', 'custom']),
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
  copywritingStyle: 'none',
  copywritingStyle_disabled: false,
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

export function PromptForm() {
    const { control, setValue, getValues } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "links",
    });
    
    const values = useWatch({ control });

    const toggleDisabled = (fieldName: keyof FormValues) => {
        const currentVal = getValues(fieldName);
        setValue(fieldName, !currentVal);
    }
    
    const writingForRadio = useWatch({ control, name: "writingForRadio" });
    const avoidWordsEnabled = useWatch({ control, name: "rules.avoidWords.enabled" });

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
                <FormSection title="Vilken typ av text som skall produceras" required>
                  <Controller
                      control={control}
                      name="taskTypeRadio"
                      render={({ field }) => (
                          <FormItem className="space-y-3">
                              <FormControl>
                                  <RadioGroup
                                      onValueChange={(value) => {
                                          field.onChange(value);
                                      }}
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
                  {useWatch({ control, name: "taskTypeRadio" }) === 'custom' && (
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
            </div>

            <FormSection title="Copywriting-stil?" description="Om någon, vilken copywriting-stil skall texten ha" onToggle={() => toggleDisabled('copywritingStyle_disabled')} isDisabled={values.copywritingStyle_disabled}>
                <FormField
                    control={control}
                    name="copywritingStyle"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="none" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Ingen specifik stil</FormLabel>
                                    </FormItem>
                                    {copywritingStyles.map((style) => (
                                        <FormItem key={style.id} className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={style.id} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{style.label}</FormLabel>
                                            <TooltipProvider delayDuration={100}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-md whitespace-pre-wrap">
                                                        <p>{style.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>


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
                            <FormLabel className={cn(field.value === 'Svenska' ? 'text-foreground' : 'text-muted-foreground', 'transition-colors')}>Svenska</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value === 'Engelska'}
                                    onCheckedChange={(checked) => field.onChange(checked ? 'Engelska' : 'Svenska')}
                                />
                            </FormControl>
                            <FormLabel className={cn(field.value === 'Engelska' ? 'text-foreground' : 'text-muted-foreground', 'transition-colors')}>Engelska</FormLabel>
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
        </div>
    );
}
