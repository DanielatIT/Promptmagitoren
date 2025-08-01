
"use client";

import React from 'react';
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
import { X, Plus, Trash2, Info, CheckCircle, XCircle } from "lucide-react"
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

const avoidWordsOptions = [
    { id: 'Upptäck', label: 'Upptäck' },
    { id: 'Utforska', label: 'Utforska' },
    { id: 'Oumbärligt', label: 'Oumbärligt' },
    { id: 'Särskiljt', label: 'Särskiljt' },
    { id: 'idealiskt', label: 'idealiskt (och dess böjningsformer)' },
];

export const copywritingStyles = [
    {
        id: 'AIDA',
        label: 'AIDA-modellen'
    },
    {
        id: 'Fyra P',
        label: 'Fyra P-modellen'
    },
    {
        id: 'Före-Efter-Bro',
        label: 'Före-efter-bro-modellen'
    },
    {
        id: 'PAS',
        label: 'PAS-modellen'
    },
    {
        id: 'Star-Story-Solution',
        label: 'Star Story Solution-modellen'
    },
];

const copywritingStyleInfo: Record<string, any> = {
    'AIDA': {
        title: 'AIDA-modellen',
        description: 'AIDA kommer från de engelska orden Attention, Interest, Desire och Action. Med AIDA lär du dig skriva på ett klassiskt vis med en beprövad struktur.',
        steps: [
            { title: 'Attention (uppmärksamhet)', text: 'Fånga dina läsares uppmärksamhet med en intressant introduktion.' },
            { title: 'Interest (intresse)', text: 'Berätta varför läsaren borde fortsätta läsa.' },
            { title: 'Desire (begär)', text: 'Skapa ett begär hos läsaren att göra något. Det kan till exempel vara att följa din sida, köpa en produkt eller prenumerera på ett nyhetsbrev.' },
            { title: 'Action (handling)', text: 'Nu kan du använda en CTA-knapp för att dra nytta av läsarens intresse.' }
        ],
        pros: ['Enkel att komma ihåg och jobba med.', 'Fångar läsarens intresse.', 'Gör det tydligt för läsaren vilken handling de ska göra.'],
        cons: ['Kan vara svår att använda för nyanserad kommunikation.', 'Kan vara ineffektiv vid mer komplex kommunikation.']
    },
    'Fyra P': {
        title: 'Fyra P-modellen',
        description: 'Här kommer ännu en klassisk skrivmodell! Fyra P används på flera sätt inom marknadsföring. Fyra P kan dels handla om en modell för marknadsföringsmix men i detta fallet pratar vi om Fyra P för copywriting. Dessa Fyra P är engelskans: Picture, Promise, Prove och Push.',
        steps: [
            { title: 'Picture (föreställ)', text: 'Du börjar med att skapa en bild av ett positivt resultat eller en bra framtid för ett nuvarande problem.' },
            { title: 'Promise (utlova)', text: 'Du fortsätter genom att berätta hur din produkt eller tjänst kan ge det positiva resultat som läsaren föreställer sig.' },
            { title: 'Prove (bevisa)', text: 'Bevisa att ditt löfte stämmer. Presentera konkreta bevis på att du kan uppfylla dina löften och att din produkt eller tjänst kan leverera det du lovar.' },
            { title: 'Push (driv)', text: 'Använd en CTA för att ta läsaren till handling.' }
        ],
        pros: ['Det är enkelt för läsaren att snabbt se fördelarna med något.', 'Sociala bevis fungerar bra för att skapa varumärkesförtroende.', 'Kan användas för både texter och videor.'],
        cons: ['Kräver att du vet något om målgrupper.', 'Fungerar bäst för etablerade företag som redan har sociala bevis.']
    },
    'Före-Efter-Bro': {
        title: 'Före – efter – bro',
        description: 'Med denna skrivmodell är det enkelt att skriva och den kan vara mycket effektiv. Namnet ”Före – efter – bro” kommer av att skribenten presenterar ett problem, visar hur bra livet blir efter lösningen och berättar sedan hur läsaren kan ta del av lösningen.',
        steps: [
            { title: 'Före', text: 'Beskriv läsarens nuvarande verklighet och de problem som hen har.' },
            { title: 'Efter', text: 'Berätta hur bra framtiden kan vara när problemet är löst.' },
            { title: 'Bro', text: 'Berätta hur din produkt eller tjänst kan ta läsaren till en ljus framtid.' }
        ],
        pros: ['Enkelt för copywritern.', 'Läsaren får läsa om ett problem som de kan relatera till.', 'Det är enkelt för läsaren att förstå.'],
        cons: ['Inte särskilt anpassningsbart.']
    },
    'PAS': {
        title: 'PAS-modellen',
        description: 'PAS står för engelskans Pain, Agitation och Solution. Detta är en skrivmodell som används flitigt inom marknadsföring.',
        steps: [
            { title: 'Pain (smärta)', text: 'Du börjar med att beskriva din målgrupps största och viktigaste problem.' },
            { title: 'Agitation (reta)', text: 'Du fortsätter med att konkretisera problemet genom att använda ord som associeras med problemet för läsaren. Det ökar behovet av en lösning.' },
            { title: 'Solution (lösning)', text: 'Slutligen presenteras lösningen. Berätta hur din produkt eller tjänst löser deras problem och hur ”smärtan” kan försvinna.' }
        ],
        pros: ['Modellen gör det enkelt att vara konkret.', 'Lösningen är mer tillfredsställande när problemet känns större.', 'Kan användas för många olika situationer.'],
        cons: ['Ett stort fokus på problem kan överskugga fördelarna med en lösning.']
    },
    'Star-Story-Solution': {
        title: 'Star Story Solution',
        description: 'Star Story Solution är en skrivmodell som gör det enkelt att skapa texter som fokuserar på storytelling. Det är detta fokus som gör denna skrivmodell så bra.',
        steps: [
            { title: 'Star (stjärna)', text: 'Introducera stjärnan i berättelsen. Det kan vara en verklig person eller påhittad karaktär som har ett problem som läsaren kan känna igen sig i.' },
            { title: 'Story (berättelse)', text: 'En berättelse presenteras, med stjärnan i centrum.' },
            { title: 'Solution (lösning)', text: 'Här är ditt mål att visa hur stjärnan löser sitt problem med hjälp av en produkt eller tjänst.' }
        ],
        pros: ['Personen i berättelsen får texten att kännas mer personlig.', 'Storytelling fångar läsarens uppmärksamhet.', 'Det är enkelt att skapa en mer nyanserad berättelse.'],
        cons: ['Passar inte lika bra för korta texter.', 'Valet av person kan ha stor betydelse för målgruppen.']
    }
};

const FormattedCopywritingInfo = ({ styleId }: { styleId: string }) => {
    const info = copywritingStyleInfo[styleId];
    if (!info) return null;

    return (
        <div className="text-sm p-2">
            <h3 className="text-base font-bold font-headline mb-2">{info.title}</h3>
            <p className="mb-4 text-muted-foreground">{info.description}</p>
            <div className="space-y-3 mb-4">
                {info.steps.map((step: any, index: number) => (
                    <div key={index}>
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                        <p className="text-muted-foreground">{step.text}</p>
                    </div>
                ))}
            </div>
            {info.pros && info.pros.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-foreground">Fördelar</h4>
                    <ul className="space-y-1.5">
                        {info.pros.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {info.cons && info.cons.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-foreground">Nackdelar</h4>
                    <ul className="space-y-1.5">
                        {info.cons.map((con: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>{con}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


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
    avoidVilket: z.boolean().default(true),
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
    avoidVilket: true,
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
        setValue(fieldName, !currentVal, { shouldValidate: true, shouldDirty: true });
    }
    
    const avoidWordsEnabled = useWatch({ control, name: "rules.avoidWords.enabled" });
    const taskType = useWatch({ control, name: "taskTypeRadio" });


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
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="space-y-2"
                                  >
                                      {taskTypeRadioOptions.map((task) => (
                                          <FormItem key={task} className="flex items-center space-x-3 space-y-0">
                                              <FormControl>
                                                  <RadioGroupItem value={task} />
                                              </FormControl>
                                              <FormLabel className="font-normal">{task}</FormLabel>
                                          </FormItem>
                                      ))}
                                      <FormItem className="flex items-center space-x-3 space-y-0">
                                          <FormControl>
                                              <RadioGroupItem value="custom" />
                                          </FormControl>
                                          <FormLabel className="font-normal">Annan...</FormLabel>
                                      </FormItem>
                                  </RadioGroup>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  {taskType === 'custom' && (
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
                                <TooltipProvider>
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
                                                <FormLabel className="font-normal flex items-center gap-2">{style.label}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button type="button">
                                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent 
                                                            side="right" 
                                                            align="center" 
                                                            sideOffset={20}
                                                            className="w-96 max-h-[calc(100vh-2rem)] overflow-y-auto bg-card">
                                                            <FormattedCopywritingInfo styleId={style.id} />
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </TooltipProvider>
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

            <FormSection
                title="Regler på texten"
                description="Alla ibockade regler gäller, bocka av om du inte vill använda regel."
                onToggle={() => toggleDisabled('rules_disabled')}
                isDisabled={values.rules_disabled}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={control} name="rules.avoidSuperlatives" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik superlativ</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidPraise" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik lovord</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidAcclaim" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik beröm</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.isInformative" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Informativ text</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.useWeForm" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Skriv i vi-form</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.addressReaderAsYou" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Benämn läsaren som "ni"</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidXYPhrase" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik "i en X är Y värdefullt..."</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidVilket" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik ", vilket..."</FormLabel></FormItem>)} />
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
